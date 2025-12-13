// server/src/queues/queue.ts
import Queue from "bull";
import dotenv from "dotenv";
dotenv.config();

const REDIS_URL = process.env.REDIS_URL ?? process.env.REDIS_HOST ?? "redis://127.0.0.1:6379";

/**
 * Export the named queues used by the app.
 * - scrapeQueue: push jobs for pages to fetch+save.
 *
 * Job data shape:
 * { url: string, title?: string, usePuppeteer?: boolean, crawl?: boolean, delayMs?: number, randomize?: boolean, maxPerSite?: number, source?: string }
 */

export const scrapeQueue = new Queue("scrape", REDIS_URL);

// Optional: configure default job options here
scrapeQueue.on("error", (err) => {
  console.error("scrapeQueue error:", err);
});

export default {
  scrapeQueue,
};