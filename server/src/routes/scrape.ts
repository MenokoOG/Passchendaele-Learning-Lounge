// server/src/routes/scrape.ts
import express from "express";
import { scrapeQueue } from "../queues/queue.js";
import { RawCourse } from "../models/RawCourse.js";

const router = express.Router();

/**
 * POST /api/scrape
 * Body:
 *  { links: [{ title?, url, usePuppeteer? }], crawl?: boolean, delayMs?: number, randomize?: boolean, maxPerSite?: number }
 *
 * This route enqueues a job per provided link and returns quickly.
 */
router.post("/", async (req, res) => {
  const body = req.body || {};
  const rawLinks = Array.isArray(body.links) ? body.links : [];
  const crawl = !!body.crawl;
  const delayMs = Math.max(100, Number(body.delayMs ?? 1000));
  const randomize = !!body.randomize;
  const maxPerSite = Math.max(0, Number(body.maxPerSite ?? 25));
  const defaultUsePuppeteer = !!body.usePuppeteer;

  if (!rawLinks.length) {
    return res.status(400).json({ error: "No links provided" });
  }

  const enqueueResults: Array<any> = [];

  for (const l of rawLinks) {
    const url = String((l && l.url) || "").trim();
    if (!url) {
      enqueueResults.push({ url: null, status: "invalid", error: "missing url" });
      continue;
    }

    try {
      // Quick DB check: if URL exists already, short-circuit
      const exists = await RawCourse.findOne({ url }).lean();
      if (exists) {
        enqueueResults.push({ url, status: "exists_in_db", id: exists._id });
        continue;
      }

      const job = await scrapeQueue.add(
        "scrape",
        {
          url,
          title: l.title || undefined,
          usePuppeteer: typeof l.usePuppeteer === "boolean" ? l.usePuppeteer : defaultUsePuppeteer,
          crawl,
          delayMs,
          randomize,
          maxPerSite,
          source: "api-scrape",
        },
        {
          attempts: 3,
          backoff: { type: "exponential", delay: 2000 },
        }
      );

      enqueueResults.push({ url, status: "enqueued", jobId: job.id });
    } catch (err: any) {
      console.error("Failed to enqueue:", url, err?.message ?? err);
      enqueueResults.push({ url, status: "enqueue_failed", error: String(err?.message ?? err) });
    }
  }

  return res.json({ results: enqueueResults });
});

export default router;