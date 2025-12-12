// server/src/routes/scrape.ts
import express from "express";
import { RawCourse } from "../models/RawCourse.js";
import fetchAndExtract from "../utils/scraper_puppeteer.js";
import { isUrlAllowed } from "../utils/robots_check.js";

const router = express.Router();

/**
 * POST /api/scrape
 * Body: { links: [{ title, url, usePuppeteer? }], usePuppeteer?: boolean }
 *
 * For each link:
 *  - check robots.txt (isUrlAllowed)
 *  - fetch via fetchAndExtract(url, { usePuppeteer })
 *  - save into RawCourse (metadata.scraped = true)
 *
 * Returns: { results: [{ url, status, id?, error? }] }
 */
router.post("/", async (req, res) => {
  const body = req.body || {};
  const links = Array.isArray(body.links) ? body.links : [];
  const defaultUsePuppeteer = !!body.usePuppeteer;

  if (!links.length) {
    return res.status(400).json({ error: "No links provided" });
  }

  const results: Array<any> = [];

  for (const l of links) {
    const title = l.title || "";
    const url = String(l.url || "").trim();
    if (!url) {
      results.push({ url: null, status: "invalid", error: "missing url" });
      continue;
    }

    try {
      // robots.txt check
      const allowed = await isUrlAllowed(url);
      if (!allowed) {
        results.push({ url, status: "blocked_by_robots" });
        continue;
      }

      // decide whether to use puppeteer per-link or default
      const useP =
        typeof l.usePuppeteer === "boolean"
          ? l.usePuppeteer
          : defaultUsePuppeteer;

      // fetch & extract (this function should return { ok, title, html, text, sections, contentHtml? })
      const fetched = await fetchAndExtract(url, { usePuppeteer: useP });

      // If fetchAndExtract returns an object with ok false, mark as failed
      if (!fetched || (typeof fetched === "object" && fetched.ok === false)) {
        results.push({
          url,
          status: "fetch_failed",
          error: "fetch returned empty or failure",
        });
        continue;
      }

      const doc = new RawCourse({
        title: (fetched.title || title || url).slice(0, 300),
        url,
        fetchedAt: new Date(),
        fetchedBy: "scrape-route",
        contentHtml:
          (fetched as any).contentHtml || (fetched as any).html || null,
        text: (fetched as any).text || null,
        sections: (fetched as any).sections || [],
        metadata: {
          scraped: true,
          usePuppeteer: useP,
          sourceTool: "scrape-route",
        },
      });

      await doc.save();
      results.push({ url, status: "saved", id: doc._id });
    } catch (err: any) {
      console.error("scrape error for", url, err?.message ?? err);
      results.push({
        url,
        status: "error",
        error: String(err?.message ?? err),
      });
    }
  }

  return res.json({ results });
});

export default router;
