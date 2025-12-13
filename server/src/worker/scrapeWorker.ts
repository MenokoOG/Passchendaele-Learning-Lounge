// server/src/worker/scrapeWorker.ts
/**
 * Mongo-backed scrape worker.
 * - Atomically claims one pending job with findOneAndUpdate
 * - Runs fetchAndExtract, extracts license, saves RawCourse
 * - If job.crawl true, discovers internal links and inserts new ScrapeJobs (non-recursive)
 *
 * Usage (dev):
 *  npx ts-node -r dotenv/config src/worker/scrapeWorker.ts
 *
 * Or run compiled JS:
 *  node dist/worker/scrapeWorker.js
 */
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { ScrapeJob } from "../models/ScrapeJob.js";
import { RawCourse } from "../models/RawCourse.js";
import fetchAndExtract from "../utils/scraper_puppeteer.js";
import { extractLicenseFromText } from "../utils/extract_license.js";
import { load } from "cheerio";

const MONGO_URI = process.env.MONGO_URI ?? process.env.MONGODB_URI ?? "";
const POLL_INTERVAL_MS = Number(process.env.SCRAPE_POLL_INTERVAL_MS ?? 2000);
const WORKER_ID = `worker-${process.pid}`;

async function ensureDbConnected() {
  if (mongoose.connection.readyState === 1) return;
  if (!MONGO_URI) {
    console.error("MONGO_URI not set. Worker cannot connect to DB.");
    process.exit(1);
  }
  await mongoose.connect(MONGO_URI, {});
  console.log("Worker connected to MongoDB.");
}

function isValidHttpHref(href: string | null | undefined) {
  if (!href) return false;
  const trimmed = href.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("mailto:") || trimmed.startsWith("tel:")) return false;
  if (trimmed.startsWith("javascript:")) return false;
  if (trimmed === "#" || trimmed.startsWith("#")) return false;
  if (/\.(pdf|jpg|jpeg|png|gif|svg|zip|tar|gz|mp4|mp3|ogg|webm)(\?.*)?$/i.test(trimmed))
    return false;
  return true;
}

function extractLinksFromHtml(html: string, baseUrl: string, maxLinks = 25) {
  const $ = load(html || "<body></body>");
  const candidates = new Map<string, string>();
  let baseHost = "";
  try {
    baseHost = new URL(baseUrl).hostname;
  } catch {
    baseHost = "";
  }

  const selectors = ["article", "main", "#content", ".content", ".article", ".post", ".entry"];
  let area = null as any;
  for (const s of selectors) {
    const el = $(s);
    if (el && el.length && el.text().trim().length > 50) {
      area = el;
      break;
    }
  }
  const root = area || $("body");

  root.find("a[href]").each((_: any, el: any) => {
    const href = $(el).attr("href");
    if (!isValidHttpHref(href)) return;
    let absolute: string;
    try {
      absolute = new URL(href as string, baseUrl).toString();
    } catch {
      return;
    }
    try {
      const u = new URL(absolute);
      if (baseHost && u.hostname !== baseHost) return;
      u.hash = "";
      absolute = u.toString();
    } catch {
      return;
    }
    if (!candidates.has(absolute)) {
      const text = $(el).text().trim().replace(/\s+/g, " ").slice(0, 200) || "";
      candidates.set(absolute, text);
    }
  });

  if (candidates.size === 0) {
    $("a[href]").each((_, el) => {
      const href = $(el).attr("href");
      if (!isValidHttpHref(href)) return;
      let absolute: string;
      try {
        absolute = new URL(href as string, baseUrl).toString();
      } catch {
        return;
      }
      try {
        const u = new URL(absolute);
        if (baseHost && u.hostname !== baseHost) return;
        u.hash = "";
        absolute = u.toString();
      } catch {
        return;
      }
      if (!candidates.has(absolute)) {
        const text = $(el).text().trim().replace(/\s+/g, " ").slice(0, 200) || "";
        candidates.set(absolute, text);
      }
    });
  }

  const out: Array<{ title?: string; url: string }> = [];
  let i = 0;
  for (const [url, t] of candidates) {
    out.push({ title: t || undefined, url });
    i++;
    if (i >= maxLinks) break;
  }
  return out;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function processOneJob() {
  // Claim a pending job atomically: set status->processing and lockedUntil to avoid races.
  const now = new Date();
  const lockUntil = new Date(Date.now() + 60 * 1000); // give 60s to process (extend if needed)
  const job = await ScrapeJob.findOneAndUpdate(
    { status: "pending", $or: [{ lockedUntil: null }, { lockedUntil: { $lt: new Date() } }] },
    { $set: { status: "processing", lockedUntil: lockUntil, updatedAt: new Date() }, $inc: { attempts: 1 } },
    { sort: { createdAt: 1 }, returnDocument: "after" }
  ).lean();

  if (!job) return false;

  const jobId = (job as any)._id;
  const url = String(job.url || "");
  console.log(`[${WORKER_ID}] Claimed job ${jobId} -> ${url}`);

  try {
    // robots check (best-effort)
    try {
      const allowed = await (await import("../utils/robots_check.js")).isUrlAllowed(url);
      if (!allowed) {
        await ScrapeJob.findByIdAndUpdate(jobId, { $set: { status: "failed", lastError: "blocked_by_robots", updatedAt: new Date() } });
        console.warn(`[${WORKER_ID}] blocked by robots: ${url}`);
        return true;
      }
    } catch (robotErr: any) {
      // ignore robot errors
    }

    const fetched = await fetchAndExtract(url, { usePuppeteer: !!job.usePuppeteer });

    // license extraction
    const licenseFromText = extractLicenseFromText(String(fetched.text || ""));
    let licenseFromHtml: string | null = null;
    if (!licenseFromText && fetched.contentHtml) {
      licenseFromHtml = extractLicenseFromText((fetched.contentHtml || "").replace(/<[^>]+>/g, " "));
    }
    const licenseText = licenseFromText || licenseFromHtml || null;
    const licenseCaptured = !!licenseText;

    const doc: any = {
      title: (fetched.title || job.title || url).slice(0, 300),
      url,
      fetchedAt: new Date(),
      fetchedBy: `scrape-worker-${WORKER_ID}`,
      contentHtml: fetched.contentHtml || null,
      text: fetched.text || null,
      sections: fetched.sections || [],
      metadata: {
        scraped: true,
        usePuppeteer: !!job.usePuppeteer,
        sourceTool: "scrape-worker",
        fetchedAtRaw: new Date().toISOString(),
        licenseCaptured,
        licenseText,
      },
    };

    // Try insert first; if duplicate-key -> update existing doc with merged metadata
    try {
      const created = await RawCourse.create(doc);
      await ScrapeJob.findByIdAndUpdate(jobId, { $set: { status: "done", resultRawCourseId: created._id, updatedAt: new Date() } });
      console.log(`[${WORKER_ID}] Saved RawCourse for ${url}`);
    } catch (err: any) {
      // if duplicate key on url (already saved), update metadata on existing
      if (err && ((err.code === 11000) || (String(err.message).includes("E11000")))) {
        const existing = await RawCourse.findOne({ url }).exec();
        if (existing) {
          existing.title = existing.title || doc.title;
          existing.contentHtml = existing.contentHtml || doc.contentHtml;
          existing.text = existing.text || doc.text;
          existing.sections = (existing.sections && existing.sections.length) ? existing.sections : doc.sections;
          existing.metadata = {
            ...(existing.metadata || {}),
            ...(doc.metadata || {}),
            lastWorkerUpdate: new Date().toISOString(),
          };
          await existing.save();
          await ScrapeJob.findByIdAndUpdate(jobId, { $set: { status: "done", resultRawCourseId: existing._id, updatedAt: new Date() } });
          console.log(`[${WORKER_ID}] Merged metadata into existing RawCourse for ${url}`);
        } else {
          await ScrapeJob.findByIdAndUpdate(jobId, { $set: { status: "failed", lastError: "duplicate_insert_failed", updatedAt: new Date() } });
        }
      } else {
        await ScrapeJob.findByIdAndUpdate(jobId, { $set: { status: "failed", lastError: String(err?.message ?? err), updatedAt: new Date() } });
        console.error(`[${WORKER_ID}] Error saving RawCourse for ${url}:`, err);
        return true;
      }
    }

    // Crawl: discover internal links and enqueue them
    if (job.crawl) {
      const htmlToScan = fetched.contentHtml || String(fetched.text || "");
      if (htmlToScan) {
        const discovered = extractLinksFromHtml(htmlToScan, url, job.maxPerSite ?? 25);
        if (discovered && discovered.length) {
          for (const d of discovered) {
            if (!d.url || d.url === url) continue;
            // make sure link not already saved and not already queued
            const exists = await RawCourse.findOne({ url: d.url }).lean();
            if (exists) continue;
            try {
              await ScrapeJob.findOneAndUpdate(
                { url: d.url },
                {
                  $setOnInsert: {
                    title: d.title || "",
                    usePuppeteer: false,
                    crawl: false,
                    delayMs: job.delayMs ?? 1000,
                    randomize: false,
                    maxPerSite: 0,
                    status: "pending",
                    attempts: 0,
                  },
                },
                { upsert: true }
              );
            } catch (err) {
              // ignore duplicates or errors for discovered links
            }
          }
        }
      }
    }

    // Politeness wait using configured delayMs + jitter
    const delayMs = Number(job.delayMs ?? 1000);
    const jitter = job.randomize ? Math.floor(Math.random() * delayMs) : 0;
    await sleep(delayMs + jitter);

    return true;
  } catch (err: any) {
    console.error(`[${WORKER_ID}] Worker error for job ${jobId}`, err?.message ?? err);
    await ScrapeJob.findByIdAndUpdate(jobId, { $set: { status: "failed", lastError: String(err?.message ?? err), updatedAt: new Date() } });
    return true;
  }
}

async function runLoop() {
  while (true) {
    try {
      const didWork = await processOneJob();
      if (!didWork) {
        await sleep(POLL_INTERVAL_MS);
      }
    } catch (err) {
      console.error(`[${WORKER_ID}] Unexpected worker loop error`, err);
      await sleep(POLL_INTERVAL_MS);
    }
  }
}

async function start() {
  await ensureDbConnected();
  console.log("Starting scrape worker (mongo-backed). Poll interval:", POLL_INTERVAL_MS);
  runLoop().catch((e) => {
    console.error("Worker runLoop failed:", e);
    process.exit(1);
  });
}

start().catch((err) => {
  console.error("Worker startup failed:", err);
  process.exit(1);
});