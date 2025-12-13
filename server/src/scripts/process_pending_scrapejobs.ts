#!/usr/bin/env ts-node
/**
 * Process pending scrapejobs -> create RawCourse entries.
 *
 * Usage (dev):
 *   npx ts-node -r dotenv/config src/scripts/process_pending_scrapejobs.ts --limit=50 --delayMs=1000 --randomize --force
 *
 * Flags:
 *   --limit=N       maximum number of jobs to process (default: 100)
 *   --delayMs=N     base delay between requests in ms (default: 1000)
 *   --randomize     add jitter (0..delayMs) to delay
 *   --force         bypass robots.txt checks (dev only; use with care)
 *
 * This script assumes your project already has:
 *  - src/utils/scraper_puppeteer.js (export default fetchAndExtract)
 *  - src/utils/extract_license.js (export function extractLicenseFromText)
 *  - src/utils/robots_check.js (export function isUrlAllowed)
 *  - src/models/RawCourse.js (export RawCourse model)
 *
 * It reads from collection "scrapejobs" (whatever your route saved) and writes to RawCourse.
 */

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import fetchAndExtract from "../utils/scraper_puppeteer.js";
import { extractLicenseFromText } from "../utils/extract_license.js";
import { isUrlAllowed } from "../utils/robots_check.js";
import { RawCourse } from "../models/RawCourse.js";

const MONGO_URI = process.env.MONGO_URI ?? process.env.MONGODB_URI ?? "";
if (!MONGO_URI) {
  console.error("MONGO_URI not set. Aborting.");
  process.exit(1);
}

type ArgOpts = {
  limit: number;
  delayMs: number;
  randomize: boolean;
  force: boolean;
};

function parseArgs(): ArgOpts {
  const argv = process.argv.slice(2);
  const get = (k: string) => {
    const idx = argv.findIndex((a) => a === k || a.startsWith(`${k}=`));
    if (idx === -1) return undefined;
    const a = argv[idx];
    if (a.includes("=")) return a.split("=")[1];
    const v = argv[idx + 1];
    if (!v || v.startsWith("--")) return "true";
    return v;
  };

  return {
    limit: Number(get("--limit") ?? get("-n") ?? 100),
    delayMs: Number(get("--delayMs") ?? get("--delay") ?? 1000),
    randomize: !!(get("--randomize") ?? get("--jitter")),
    force: !!(get("--force") ?? get("--bypass-robots")),
  };
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const opts = parseArgs();
  console.log("Process pending scrapejobs with options:", opts);

  await mongoose.connect(MONGO_URI, {});
  console.log("Connected to MongoDB.");

  // Use collection-level access for scrapejobs to avoid needing a model file
  const scrapeColl = mongoose.connection.collection("scrapejobs");

  // Find pending jobs (adjust field names if your route uses different status/state)
  const cursor = scrapeColl.find(
    { status: { $in: ["pending", "queued", null, "new"] } },
    { sort: { _id: 1 }, limit: opts.limit }
  );

  let processed = 0;
  let saved = 0;
  let skipped = 0;
  let failed = 0;

  while (await cursor.hasNext()) {
    const job = await cursor.next() as any;
    if (!job) break;

    const jobId = job._id?.toString?.() ?? "(no-id)";
    const url = String(job.url || "").trim();
    if (!url) {
      console.warn("Skipping job (no url):", jobId);
      await scrapeColl.updateOne({ _id: job._id }, { $set: { status: "failed", error: "missing_url", updatedAt: new Date() } });
      failed++;
      continue;
    }

    try {
      // Skip if RawCourse already exists for this URL (quick dedupe)
      const exists = await RawCourse.findOne({ url }).lean();
      if (exists) {
        console.log(`Job ${jobId}: url already in RawCourse, marking job saved -> ${url}`);
        await scrapeColl.updateOne({ _id: job._id }, { $set: { status: "saved", rawId: exists._id, updatedAt: new Date() } });
        skipped++;
        continue;
      }

      // robots check unless forced
      if (!opts.force) {
        try {
          const allowed = await isUrlAllowed(url);
          if (!allowed) {
            console.warn(`Job ${jobId}: blocked by robots.txt -> ${url}`);
            await scrapeColl.updateOne({ _id: job._id }, { $set: { status: "blocked_by_robots", updatedAt: new Date() } });
            skipped++;
            continue;
          }
        } catch (rErr) {
          // best-effort: warn and continue (we'll try fetching)
          console.warn(`Job ${jobId}: robots check failed (continuing):`, (rErr instanceof Error ? rErr.message : String(rErr)));
        }
      } else {
        console.log(`Job ${jobId}: force bypass robots check enabled.`);
      }

      // fetch (prefer Puppeteer if job.usePuppeteer or job.useP set)
      const usePuppeteer = !!(job.usePuppeteer || job.useP);
      console.log(`Job ${jobId}: fetching ${url} (usePuppeteer=${usePuppeteer})`);
      const fetched = await fetchAndExtract(url, { usePuppeteer });

      // license extraction
      const licenseFromText = extractLicenseFromText(String(fetched.text ?? ""));
      let licenseFromHtml: string | null = null;
      if (!licenseFromText && fetched.contentHtml) {
        licenseFromHtml = extractLicenseFromText((fetched.contentHtml || "").replace(/<[^>]+>/g, " "));
      }
      const licenseText = licenseFromText || licenseFromHtml || null;

      const doc = {
        title: (fetched.title || job.title || url).slice(0, 300),
        url,
        fetchedAt: new Date(),
        fetchedBy: `process_pending_script_${jobId}`,
        contentHtml: fetched.contentHtml || (fetched.html ?? null) || null,
        text: fetched.text || null,
        sections: fetched.sections || [],
        metadata: {
          scraped: true,
          sourceTool: job.sourceTool || "process_pending_script",
          fetchedAtRaw: new Date().toISOString(),
          licenseCaptured: !!licenseText,
          licenseText,
          originalJobId: job._id,
        },
      };

      // create RawCourse (if duplicate arises, handle by updating metadata)
      try {
        const created = await RawCourse.create(doc);
        console.log(`Job ${jobId}: Saved RawCourse ${created._id} -> ${url}`);
        await scrapeColl.updateOne({ _id: job._id }, { $set: { status: "saved", rawId: created._id, updatedAt: new Date() } });
        saved++;
      } catch (dbErr: any) {
        // try merge/update for duplicate key or other transient errors
        if (dbErr && (dbErr.code === 11000 || (dbErr.message && dbErr.message.includes("E11000")))) {
          console.warn(`Job ${jobId}: duplicate on insert — attempting to update existing doc`);
          const existing = await RawCourse.findOne({ url }).exec();
          if (existing) {
            existing.title = existing.title || doc.title;
            existing.contentHtml = existing.contentHtml || doc.contentHtml;
            existing.text = existing.text || doc.text;
            existing.sections = (existing.sections && existing.sections.length) ? existing.sections : doc.sections;
            existing.metadata = {
              ...(existing.metadata || {}),
              ...(doc.metadata || {}),
              lastProcessedAt: new Date().toISOString(),
            };
            await existing.save();
            await scrapeColl.updateOne({ _id: job._id }, { $set: { status: "saved", rawId: existing._id, updatedAt: new Date() } });
            saved++;
          } else {
            console.error(`Job ${jobId}: duplicate but couldn't find existing doc`, dbErr);
            await scrapeColl.updateOne({ _id: job._id }, { $set: { status: "failed", error: String(dbErr), updatedAt: new Date() } });
            failed++;
          }
        } else {
          console.error(`Job ${jobId}: DB create failed:`, dbErr);
          await scrapeColl.updateOne({ _id: job._id }, { $set: { status: "failed", error: String(dbErr), updatedAt: new Date() } });
          failed++;
        }
      }

      // politeness delay
      const base = Math.max(0, Number(opts.delayMs || 1000));
      const jitter = opts.randomize ? Math.floor(Math.random() * base) : 0;
      const waitMs = base + jitter;
      if (waitMs > 0) {
        await sleep(waitMs);
      }
    } catch (err: any) {
      console.error(`Job ${jobId}: processing failed for url ${url}:`, err?.message ?? err);
      await scrapeColl.updateOne({ _id: job._id }, { $set: { status: "failed", error: String(err?.message ?? err), updatedAt: new Date() } });
      failed++;
    }

    processed++;
  } // end while

  console.log(`Done. processed=${processed}, saved=${saved}, skipped=${skipped}, failed=${failed}`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
