// server/src/routes/scrape.ts
import express from "express";
import { ScrapeJob } from "../models/ScrapeJob.js";
import { RawCourse } from "../models/RawCourse.js";
import fetchAndExtract from "../utils/scraper_puppeteer.js";
import { extractLicenseFromText } from "../utils/extract_license.js";
import { isUrlAllowed } from "../utils/robots_check.js";
import mongoose from "mongoose";

const router = express.Router();

/**
 * POST /api/scrape
 * Body:
 *  { links: [{ title?, url }], usePuppeteer?, crawl?, delayMs?, randomize?, maxPerSite? , processNow? }
 *
 * Behavior:
 *  - Inserts ScrapeJob(s) into Mongo (unique by url) with status 'pending'
 *  - If processNow:true then performs fetch+save inline synchronously and returns saved RawCourse(s)
 *
 * Response:
 *  { results: [ { url, status, jobId?, rawId?, error? } ] }
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

  for (const l of links) {
    const title = l.title || "";
    const url = String(l.url || "").trim();
    if (!url) {
      results.push({ url: null, status: "invalid", error: "missing url" });
      continue;
    }

    try {
      // best-effort robots check. If robots denies, we still create job but mark as blocked.
      let allowed = true;
      try {
        allowed = await isUrlAllowed(url);
      } catch (robotErr) {
        // ignore robot errors (conservative: allow)
        allowed = true;
      }
      if (!allowed) {
        results.push({ url, status: "blocked_by_robots" });
        continue;
      }

      if (processNow) {
        // inline processing (synchronous) — useful for quick testing without worker
        const fetched = await fetchAndExtract(url, {
          usePuppeteer: defaultUsePuppeteer,
        });
        const licenseFromText = extractLicenseFromText(
          String(fetched.text || "")
        );
        let licenseFromHtml: string | null = null;
        if (!licenseFromText && fetched.contentHtml) {
          licenseFromHtml = extractLicenseFromText(
            (fetched.contentHtml || "").replace(/<[^>]+>/g, " ")
          );
        }
        const licenseText = licenseFromText || licenseFromHtml || null;
        const licenseCaptured = !!licenseText;

        const doc = new RawCourse({
          title: (fetched.title || title || url).slice(0, 300),
          url,
          fetchedAt: new Date(),
          fetchedBy: "inline-scrape-route",
          contentHtml: fetched.contentHtml || null,
          text: fetched.text || null,
          sections: fetched.sections || [],
          metadata: {
            scraped: true,
            usePuppeteer: defaultUsePuppeteer,
            sourceTool: "inline-scrape-route",
            fetchedAtRaw: new Date().toISOString(),
            licenseCaptured,
            licenseText,
          },
        });
        await doc.save();
        results.push({ url, status: "saved", rawId: doc._id });
        continue;
      }

      // insert job (upsert so repeated calls won't produce duplicate errors)
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
