#!/usr/bin/env ts-node
/**
 * process_scrapejobs_to_raw.ts
 *
 * One-shot migration: process pending ScrapeJob documents, fetch/extract content (if needed),
 * run local rewrite, extract license, and insert/upsert into RawCourse collection.
 *
 * Usage (dry-run):
 *   npx ts-node -r dotenv/config src/scripts/process_scrapejobs_to_raw.ts --limit=50 --dry-run
 *
 * Real run:
 *   npx ts-node -r dotenv/config src/scripts/process_scrapejobs_to_raw.ts --limit=200 --delay=1000 --randomize
 *
 * Flags:
 *   --limit=N       : max jobs to process (default 200)
 *   --delay=MS      : base delay between jobs in ms (default 1000)
 *   --randomize     : add random jitter [0..delay) to each wait
 *   --dry-run       : do not write any DB changes (prints actions)
 *   --overwrite     : overwrite existing RawCourse content when url exists (default: skip)
 */

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { ScrapeJob } from "../models/ScrapeJob.js";
import { RawCourse } from "../models/RawCourse.js";
import fetchAndExtract from "../utils/scraper.js";
import { extractLicenseFromText } from "../utils/extract_license.js";
import { localRewriteDocument } from "../utils/local_rewrite.js";
import { MONGO_URI } from "../config.js";

type Opts = {
  limit: number;
  delay: number;
  randomize: boolean;
  dryRun: boolean;
  overwrite: boolean;
};

function parseArgs(): Opts {
  const argv = process.argv.slice(2);
  const get = (name: string, fallback?: string) => {
    const m = argv.find((a) => a.startsWith(`${name}=`));
    if (m) return m.split("=")[1];
    if (argv.includes(name)) return "true";
    return fallback;
  };
  return {
    limit: Number(get("--limit", "200")),
    delay: Number(get("--delay", "1000")),
    randomize: !!get("--randomize"),
    dryRun: !!get("--dry-run"),
    overwrite: !!get("--overwrite"),
  };
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function ensureDb() {
  if (!MONGO_URI) {
    console.error("MONGO_URI not set in config/env");
    process.exit(1);
  }
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(MONGO_URI, {});
    console.log("Connected to MongoDB.");
  }
}

async function processOne(jobDoc: any, opts: Opts) {
  const jobId = jobDoc._id?.toString?.() ?? "(no-id)";
  const url = String(jobDoc.url || jobDoc.link || "").trim();
  if (!url) {
    return { jobId, url: null, status: "skipped_invalid_url" };
  }

  // Skip if this job already migrated and not forcing overwrite
  if (!opts.overwrite && jobDoc.status === "migrated" && jobDoc.rawId) {
    return { jobId, url, status: "already_migrated", rawId: jobDoc.rawId };
  }

  // If RawCourse exists and not overwrite => skip
  const existing = await RawCourse.findOne({ url }).lean();
  if (existing && !opts.overwrite) {
    return { jobId, url, status: "raw_exists_skip", rawId: existing._id };
  }

  // Use existing scraped content on jobDoc if present; otherwise fetch
  let fetched: any = null;
  if (
    jobDoc.contentHtml ||
    jobDoc.text ||
    (jobDoc.sections && jobDoc.sections.length)
  ) {
    fetched = {
      url,
      title: jobDoc.title || "",
      contentHtml: jobDoc.contentHtml ?? null,
      text: jobDoc.text ?? null,
      sections: jobDoc.sections ?? [],
      metadata: jobDoc.metadata ?? {},
    };
  } else {
    // fetch remote page
    try {
      fetched = await fetchAndExtract(url, {
        usePuppeteer: !!jobDoc.usePuppeteer,
      });
    } catch (err: any) {
      return {
        jobId,
        url,
        status: "fetch_failed",
        error: String(err?.message ?? err),
      };
    }
  }

  // Ensure text and contentHtml normalized
  fetched.contentHtml = fetched.contentHtml ?? fetched.html ?? null;
  fetched.text = fetched.text ?? "";

  // license extraction
  let licenseText: string | null = null;
  try {
    licenseText = extractLicenseFromText(String(fetched.text || ""));
    if (!licenseText && fetched.contentHtml) {
      licenseText = extractLicenseFromText(
        String((fetched.contentHtml || "").replace(/<[^>]+>/g, " "))
      );
    }
  } catch (e) {
    licenseText = null;
  }

  // local rewrite (fallback) — uses your localRewriteDocument util
  let rewritten: string | null = null;
  try {
    rewritten = localRewriteDocument({
      title: fetched.title || jobDoc.title || "",
      html: fetched.contentHtml || "",
      text: fetched.text || "",
    });
  } catch (e: any) {
    rewritten = null;
    console.warn(`[${jobId}] localRewrite failed:`, e?.message ?? e);
  }

  const docPayload = {
    title: (fetched.title || jobDoc.title || url).slice(0, 300),
    url,
    fetchedAt: jobDoc.fetchedAt ? new Date(jobDoc.fetchedAt) : new Date(),
    fetchedBy: jobDoc.fetchedBy || "scrapejob-migration",
    contentHtml: fetched.contentHtml ?? null,
    text: fetched.text ?? null,
    sections: fetched.sections ?? [],
    metadata: {
      ...(fetched.metadata || {}),
      migratedFrom: "scrapejob",
      originalJobId: jobDoc._id,
      licenseCaptured: !!licenseText,
      licenseText: licenseText ?? null,
      lastParaphrase: {
        at: new Date(),
        model: "local-fallback",
        rewrittenText: rewritten,
      },
      migratedAt: new Date(),
    },
  };

  if (opts.dryRun) {
    // report what we'd do
    return {
      jobId,
      url,
      status: "dry-run",
      wouldCreate: true,
      payloadSummary: {
        title: docPayload.title,
        licenseCaptured: !!licenseText,
        sections: (docPayload.sections || []).length,
      },
    };
  }

  try {
    // upsert RawCourse (respecting overwrite flag)
    let rawDoc;
    if (opts.overwrite) {
      rawDoc = await RawCourse.findOneAndUpdate(
        { url },
        { $set: docPayload },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } else {
      // create if not exists; otherwise merge minimal fields
      const found = await RawCourse.findOne({ url });
      if (found) {
        // merge lightly: keep existing content unless missing
        found.title = found.title || docPayload.title;
        found.contentHtml = found.contentHtml || docPayload.contentHtml;
        found.text = found.text || docPayload.text;
        found.sections =
          found.sections && found.sections.length
            ? found.sections
            : docPayload.sections;
        found.metadata = {
          ...(found.metadata || {}),
          ...(docPayload.metadata || {}),
          migratedAt: new Date(),
        };
        rawDoc = await found.save();
      } else {
        rawDoc = await RawCourse.create(docPayload);
      }
    }

    // mark job migrated
    await ScrapeJob.findByIdAndUpdate(jobDoc._id, {
      $set: { status: "migrated", rawId: rawDoc._id, migratedAt: new Date() },
    });

    return { jobId, url, status: "migrated", rawId: rawDoc._id };
  } catch (err: any) {
    // write failure state to job so operator can diagnose
    try {
      await ScrapeJob.findByIdAndUpdate(jobDoc._id, {
        $set: {
          status: "migration_failed",
          error: String(err?.message ?? err),
          updatedAt: new Date(),
        },
      });
    } catch (e) {
      // ignore
    }
    return {
      jobId,
      url,
      status: "save_failed",
      error: String(err?.message ?? err),
    };
  }
}

async function main() {
  const opts = parseArgs();
  console.log("Options:", opts);

  await ensureDb();

  // select pending jobs
  const pendingStatuses = ["pending", "queued", "new", null];
  const jobs = await ScrapeJob.find({ status: { $in: pendingStatuses } })
    .sort({ _id: 1 })
    .limit(opts.limit)
    .lean()
    .exec();

  console.log(
    `Found ${jobs.length} scrapejobs to process (limit=${opts.limit}).`
  );

  const results: any[] = [];
  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    // polite delay before each job
    const baseDelay = opts.delay;
    const jitter = opts.randomize ? Math.floor(Math.random() * baseDelay) : 0;
    const wait = baseDelay + jitter;
    if (wait > 0) {
      console.log(
        `Waiting ${wait}ms before processing ${String(job.url).slice(0, 80)}...`
      );
      await sleep(wait);
    }

    try {
      const r = await processOne(job, opts);
      console.log(
        "=>",
        r.status,
        r.url ?? "(no url)",
        r.error ? `ERR:${r.error}` : "",
        r.rawId ? `raw:${r.rawId}` : ""
      );
      results.push(r);
    } catch (e) {
      console.error("Unhandled error processing job:", e);
      results.push({
        jobId: job._id?.toString?.(),
        url: job.url,
        status: "unhandled_error",
        error: String((e as any)?.message ?? e),
      });
    }
  }

  // summary
  const summary = results.reduce((acc: any, r: any) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});
  console.log("Processing complete. Summary:", summary);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
