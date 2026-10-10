// server/src/routes/scrape.ts
import express from "express";
import { ScrapeJob } from "../models/ScrapeJob.js";
import { RawCourse } from "../models/RawCourse.js";
import fetchAndExtract from "../utils/scraper.js";
import { extractLicenseFromContent } from "../utils/extract_license.js";
import { isUrlAllowed } from "../utils/robots_check.js";
import {
  PASSCHENDAELE_SOURCES,
  NATION_LABELS,
  findSourceByUrl,
} from "../data/passchendaele_sources.js";

const router = express.Router();

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * GET /api/scrape/sources
 * The curated Passchendaele source catalog (public; used by the Sources page
 * and the scraper console).
 */
router.get("/sources", (_req, res) => {
  res.json({ nations: NATION_LABELS, sources: PASSCHENDAELE_SOURCES });
});

/**
 * POST /api/scrape
 * Body:
 *  { links: [{ title?, url }], usePuppeteer?, crawl?, delayMs?, randomize?, maxPerSite? , processNow? }
 *
 * Behavior:
 *  - processNow:true  -> fetch + save inline (upsert by url) and return rawId
 *  - otherwise        -> insert ScrapeJob(s) (unique by url) with status 'pending' for the worker
 *  - robots.txt is honoured; disallowed URLs are reported as blocked_by_robots
 *  - catalog URLs get institution / nation / rights attribution stored on the record
 *
 * Response: { results: [ { url, status, jobId?, rawId?, error? } ] }
 */
router.post("/", async (req, res) => {
  const body = req.body || {};
  const links = Array.isArray(body.links) ? body.links : [];
  const defaultUsePuppeteer = !!body.usePuppeteer;
  const defaultCrawl = !!body.crawl;
  const processNow = !!body.processNow;
  const delayMs = Number(body.delayMs ?? 1000);
  const randomize = !!body.randomize;
  const maxPerSite = Number(body.maxPerSite ?? 25);

  if (!links.length) {
    return res.status(400).json({ error: "No links provided" });
  }

  const results: any[] = [];
  let first = true;

  for (const l of links) {
    const title = l.title || "";
    const url = String(l.url || "").trim();
    if (!url) {
      results.push({ url: null, status: "invalid", error: "missing url" });
      continue;
    }

    try {
      let allowed = true;
      try {
        allowed = await isUrlAllowed(url);
      } catch {
        allowed = true;
      }
      if (!allowed) {
        results.push({ url, status: "blocked_by_robots" });
        continue;
      }

      if (processNow) {
        // be polite between hosts' requests
        if (!first && delayMs > 0) {
          await sleep(delayMs + (randomize ? Math.random() * delayMs : 0));
        }
        first = false;

        const fetched = await fetchAndExtract(url, {
          usePuppeteer: defaultUsePuppeteer,
        });

        // Bot walls (WAF / "enable JavaScript") return a tiny page. Never store those as lessons.
        if (!fetched.text || String(fetched.text).trim().length < 300) {
          results.push({ url, status: "empty_or_bot_wall" });
          continue;
        }

        const { licenseText, licenseCaptured } = extractLicenseFromContent({
          text: fetched.text,
          contentHtml: fetched.contentHtml,
        });

        const source = findSourceByUrl(url);
        const now = new Date();
        const doc = await RawCourse.findOneAndUpdate(
          { url },
          {
            title: (title || source?.title || fetched.title || url).slice(0, 300),
            url,
            fetchedAt: now,
            fetchedBy: "inline-scrape-route",
            contentHtml: fetched.contentHtml || null,
            text: fetched.text || null,
            sections: fetched.sections || [],
            metadata: {
              scraped: true,
              usePuppeteer: defaultUsePuppeteer,
              sourceTool: "inline-scrape-route",
              fetchedAtRaw: now.toISOString(),
              licenseCaptured,
              licenseText,
              // Lesson page reads its section sidebar from metadata.sections
              sections: (fetched.sections || []).map((s: any) => ({
                heading: s.heading,
                text: s.text,
                words: s.words,
              })),
              topic: "battle-of-passchendaele-1917",
              sourceId: source?.id ?? null,
              institution: source?.institution ?? null,
              nation: source?.nation ?? null,
              sourceKind: source?.kind ?? null,
              rights: source?.rights ?? null,
              blurb: source?.blurb ?? null,
            },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        results.push({ url, status: "saved", rawId: doc?._id });
        continue;
      }

      const jobDoc = await ScrapeJob.findOneAndUpdate(
        { url },
        {
          $setOnInsert: {
            title,
            usePuppeteer: defaultUsePuppeteer,
            crawl: defaultCrawl,
            delayMs,
            randomize,
            maxPerSite,
            status: "pending",
            attempts: 0,
            metadata: {},
          },
          $set: { updatedAt: new Date() },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ).lean();

      results.push({ url, status: "queued", jobId: jobDoc?._id ?? null });
    } catch (err: any) {
      results.push({
        url,
        status: "error",
        error: err?.message ?? String(err),
      });
    }
  }

  return res.json({ results });
});

export default router;
