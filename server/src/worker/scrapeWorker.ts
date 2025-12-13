/**
 * Worker that consumes the 'scrape' queue and saves RawCourse docs.
 *
 * Usage (dev):
 *   npx ts-node -r dotenv/config src/worker/scrapeWorker.ts
 *
 * Or build and run compiled JS in production:
 *   node dist/worker/scrapeWorker.js
 */
import dotenv from "dotenv";
dotenv.config();

import Queue from "bull";
import mongoose from "mongoose";
import { RawCourse } from "../models/RawCourse.js";
import fetchAndExtract from "../utils/scraper_puppeteer.js";
import { isUrlAllowed } from "../utils/robots_check.js";
import { extractLicenseFromText } from "../utils/extract_license.js";
import { load, type Cheerio, type Element } from "cheerio";

const REDIS_URL = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";
const MONGO_URI = process.env.MONGO_URI ?? process.env.MONGODB_URI ?? "";

// Worker concurrency
const CONCURRENCY = Number(process.env.SCRAPE_WORKER_CONCURRENCY ?? 1);

// Queue
const scrapeQueue = new Queue("scrape", REDIS_URL);

// Local in-worker seen cache (keeps worker from reprocessing same URL repeatedly)
const recentSeen = new Map<string, number>();
const RECENT_TTL_MS = 24 * 60 * 60 * 1000; // 24h

function markSeen(url: string) {
  recentSeen.set(url, Date.now());
}
function seenRecently(url: string) {
  const t = recentSeen.get(url);
  if (!t) return false;
  if (Date.now() - t > RECENT_TTL_MS) {
    recentSeen.delete(url);
    return false;
  }
  return true;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
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
  let base: URL;
  try {
    base = new URL(baseUrl);
  } catch {
    // invalid base -> no links
    return [];
  }
  const baseHost = base.hostname;

  const selectors = ["article", "main", "#content", ".content", ".article", ".post", ".entry"];
  let area: Cheerio<Element> | null = null;
  for (const s of selectors) {
    const el = $(s);
    if (el && el.length && el.text().trim().length > 50) {
      area = el as Cheerio<Element>;
      break;
    }
  }
  const root: Cheerio<Element> = area || ($("body") as Cheerio<Element>);

  // primary pass: scoped area
  root.find("a[href]").each((_: number, el: Element) => {
    const hrefRaw = $(el).attr("href");
    if (!isValidHttpHref(hrefRaw)) return;
    const href = String(hrefRaw).trim(); // narrow to string
    let absolute: string;
    try {
      absolute = new URL(href, baseUrl).toString();
    } catch {
      return;
    }
    try {
      const u = new URL(absolute);
      if (u.hostname !== baseHost) return;
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

  // fallback to global anchors if none found in scoped area
  if (candidates.size === 0) {
    $("a[href]").each((_: number, el: Element) => {
      const hrefRaw = $(el).attr("href");
      if (!isValidHttpHref(hrefRaw)) return;
      const href = String(hrefRaw).trim();
      let absolute: string;
      try {
        absolute = new URL(href, baseUrl).toString();
      } catch {
        return;
      }
      try {
        const u = new URL(absolute);
        if (u.hostname !== baseHost) return;
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

async function ensureDbConnected() {
  if (mongoose.connection.readyState === 1) return;
  if (!MONGO_URI) {
    console.error("MONGO_URI not set. Worker cannot connect to DB.");
    process.exit(1);
  }
  await mongoose.connect(MONGO_URI, {});
  console.log("Worker connected to MongoDB.");
}

async function handleJob(job: any) {
  const data = job.data || {};
  const url = String(data.url || "").trim();
  if (!url) {
    console.warn("Job missing url:", job.id);
    return { ok: false, reason: "missing_url" };
  }
  if (seenRecently(url)) {
    return { ok: true, status: "recently_seen_cache_skip", url };
  }

  // polite delay between jobs if provided
  const delayMs = Number(data.delayMs ?? 1000);
  const randomize = !!data.randomize;
  const jitter = randomize ? Math.floor(Math.random() * delayMs) : 0;
  const waitMs = delayMs + jitter;

  try {
    // robots check (best-effort)
    try {
      const allowed = await isUrlAllowed(url);
      if (!allowed) {
        markSeen(url);
        return { ok: false, status: "blocked_by_robots", url };
      }
    } catch (rErr) {
      const msg = (rErr as any)?.message ?? rErr;
      console.warn("robots check failed (continuing):", url, msg);
    }

    // fetch page (puppeteer or http; fetchAndExtract will fall back)
    const usePuppeteer = !!data.usePuppeteer;
    const fetched = await fetchAndExtract(url, { usePuppeteer });

    // license extraction
    const licenseFromText = extractLicenseFromText(String(fetched.text || ""));
    let licenseFromHtml: string | null = null;
    if (!licenseFromText && fetched.contentHtml) {
      licenseFromHtml = extractLicenseFromText((fetched.contentHtml || "").replace(/<[^>]+>/g, " "));
    }
    const licenseCaptured = !!(licenseFromText || licenseFromHtml);
    const licenseText = licenseFromText || licenseFromHtml || null;

    // Build doc
    const doc = {
      title: (fetched.title || data.title || url).slice(0, 300),
      url,
      fetchedAt: new Date(),
      fetchedBy: job.id ? `scrape-worker-job-${job.id}` : "scrape-worker",
      contentHtml: fetched.contentHtml || null,
      text: fetched.text || null,
      sections: fetched.sections || [],
      metadata: {
        scraped: true,
        usePuppeteer,
        sourceTool: "scrape-worker",
        fetchedAtRaw: new Date().toISOString(),
        licenseCaptured,
        licenseText,
      },
    };

    // Try insert first; if duplicate-key -> update existing doc with merged metadata
    try {
      const created = await RawCourse.create(doc);
      markSeen(url);
      console.log("Saved RawCourse:", created._id.toString(), url);
    } catch (err: any) {
      // Mongo duplicate key -> update metadata instead of failing
      if (err && (err.code === 11000 || (err.message && (err.message as string).includes("E11000")))) {
        console.warn("Duplicate URL on insert — updating metadata instead:", url);
        const existing = await RawCourse.findOne({ url }).exec();
        if (existing) {
          existing.title = existing.title || doc.title;
          existing.contentHtml = existing.contentHtml || doc.contentHtml;
          existing.text = existing.text || doc.text;
          existing.sections = existing.sections && existing.sections.length ? existing.sections : doc.sections;
          existing.metadata = {
            ...(existing.metadata || {}),
            ...(doc.metadata || {}),
            lastWorkerUpdate: new Date().toISOString(),
          };
          await existing.save();
          markSeen(url);
        }
      } else {
        // other DB error — rethrow so Bull can handle retries/backoff
        console.error("Error saving RawCourse for url:", url, err);
        throw err;
      }
    }

    // If crawl requested: discover internal links and enqueue them (non-recursive by default)
    if (data.crawl) {
      const maxPerSite = Number(data.maxPerSite ?? 25);
      // prefer contentHtml, fallback to text
      const htmlToScan = fetched.contentHtml || String(fetched.text || "");
      if (htmlToScan) {
        const discovered = extractLinksFromHtml(htmlToScan, url, maxPerSite);
        if (discovered && discovered.length) {
          for (const d of discovered) {
            try {
              // skip if duplicate in local cache or same as parent
              if (!d.url || d.url === url) continue;
              if (seenRecently(d.url)) continue;
              // double-check against DB
              const exists = await RawCourse.findOne({ url: d.url }).lean();
              if (exists) {
                markSeen(d.url);
                continue;
              }
              // enqueue discovered link with crawl:false so it doesn't infinitely crawl (or adjust as desired)
              await scrapeQueue.add(
                "scrape",
                {
                  url: d.url,
                  title: d.title,
                  usePuppeteer: data.usePuppeteer ?? false,
                  crawl: false,
                  delayMs: data.delayMs ?? 1000,
                  randomize: !!data.randomize,
                  maxPerSite: 0,
                },
                { attempts: 3, backoff: { type: "exponential", delay: 2000 } }
              );
            } catch (e) {
              const msg = (e as any)?.message ?? e;
              console.warn("enqueue discovered link failed (continuing):", d.url, msg);
            }
          }
        }
      }
    }

    // politeness sleep
    await sleep(waitMs);

    return { ok: true, url, status: "processed" };
  } catch (err: any) {
    console.error("Worker error processing url:", url, (err as any)?.message ?? err);
    // Rethrow to let Bull handle retries/backoff
    throw err;
  }
}

// Main worker registration
async function start() {
  await ensureDbConnected();
  console.log("Starting scrape worker, concurrency =", CONCURRENCY);
  scrapeQueue.process(CONCURRENCY, async (job: any) => {
    return handleJob(job);
  });

  scrapeQueue.on("completed", (job, result) => {
    console.log("Job completed:", job.id, (result && (result as any).status) || "");
  });

  scrapeQueue.on("failed", (job, err) => {
    console.error("Job failed:", job.id, (err && (err as any).message) || err);
  });

  process.on("SIGINT", async () => {
    console.log("Shutting down worker...");
    try { await scrapeQueue.close(); } catch (e) {}
    try { await mongoose.disconnect(); } catch (e) {}
    process.exit(0);
  });
}

start().catch((err) => {
  console.error("Worker startup failed:", err);
  process.exit(1);
});
