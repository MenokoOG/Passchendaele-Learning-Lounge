// server/src/scripts/batch_scrape_courses.ts
/**
 * Batch scrape/import script for lessons.
 *
 * Usage (write to DB):
 *  npx ts-node -r dotenv/config src/scripts/batch_scrape_courses.ts urls.txt --delayMs=1200 --randomize --crawl
 *
 * Usage (post to running server):
 *  npx ts-node -r dotenv/config src/scripts/batch_scrape_courses.ts urls.txt --post=http://localhost:4000 --delayMs=800
 *
 * The file `urls.txt` is a newline-separated list of seed URLs (or pass URLs as CLI args).
 *
 * Behavior:
 *  - fetch & extract using scraper_puppeteer (puppeteer fallback)
 *  - extract license via extractLicenseFromText and set metadata.licenseText
 *  - optional --post=SERVER_BASE_URL will POST payload to SERVER_BASE_URL/api/scrape
 */

import fs from "fs";
import path from "path";
import axios from "axios";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { load } from "cheerio";
import fetchFromUtils from "../utils/scraper.js";
import { extractLicenseFromText } from "../utils/extract_license.js";
import { RawCourse } from "../models/RawCourse.js";
dotenv.config();

const args = process.argv.slice(2);
if (!args.length) {
  console.error("Usage: ts-node src/scripts/batch_scrape_courses.ts <urls.txt|url1 url2 ...> [--post=http://localhost:4000] [--out=./out.json] [--delayMs=1000] [--randomize] [--crawl]");
  process.exit(2);
}

const opts: any = {
  delayMs: 1000,
  randomize: false,
  post: null,
  out: null,
  crawl: false,
};

const positional: string[] = [];
for (const a of args) {
  if (a.startsWith("--post=")) opts.post = a.replace("--post=", "");
  else if (a.startsWith("--out=")) opts.out = a.replace("--out=", "");
  else if (a.startsWith("--delayMs=")) opts.delayMs = Number(a.replace("--delayMs=", ""));
  else if (a === "--randomize") opts.randomize = true;
  else if (a === "--crawl") opts.crawl = true;
  else positional.push(a);
}

async function loadUrlsFromFileOrArgs(items: string[]) {
  if (items.length === 1) {
    const p = path.resolve(items[0]);
    if (fs.existsSync(p) && fs.statSync(p).isFile()) {
      const content = fs.readFileSync(p, "utf8");
      return content.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    }
  }
  return items;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function jitter(ms: number) {
  return Math.floor(Math.random() * ms);
}

async function ensureDbConnected() {
  if (mongoose.connection.readyState === 1) return;
  const uri = process.env.MONGO_URI ?? process.env.MONGODB_URI ?? "";
  if (!uri) {
    console.error("MONGO_URI not set in env; cannot write to DB.");
    process.exit(1);
  }
  await mongoose.connect(uri, {});
  console.log("Connected to MongoDB for batch script.");
}

async function doFetch(url: string, usePuppeteer = true) {
  try {
    const res = await fetchFromUtils(url, { usePuppeteer });
    return res;
  } catch (err) {
    try {
      const axiosRes = await axios.get(url, { timeout: 15_000, headers: { "User-Agent": "batch-scraper/1.0" } });
      const html = axiosRes.data;
      return { url, title: (html.match(/<title>(.*?)<\/title>/i) || ["", ""])[1] || url, text: (html.replace(/<[^>]+>/g, " ") || "").slice(0, 200000), contentHtml: html, sections: [] };
    } catch (err2) {
      throw err2 || err;
    }
  }
}

async function main() {
  const urls = await loadUrlsFromFileOrArgs(positional);
  if (!urls.length) {
    console.error("No URLs provided.");
    process.exit(2);
  }

  if (opts.post) {
    try {
      new URL(opts.post);
    } catch {
      console.error("Invalid --post URL:", opts.post);
      process.exit(2);
    }
    console.log("Posting to server instead of writing to DB:", opts.post);
  } else {
    await ensureDbConnected();
  }

  const results: any[] = [];

  for (const u of urls) {
    try {
      const wait = opts.delayMs + (opts.randomize ? jitter(opts.delayMs) : 0);
      if (wait > 0) await sleep(wait);

      console.log("Fetching:", u);
      const fetched = await doFetch(u, true);

      const licenseFromText = extractLicenseFromText(String(fetched.text || ""));
      const licenseFromHtml =
        !licenseFromText && fetched.contentHtml
          ? extractLicenseFromText((fetched.contentHtml || "").replace(/<[^>]+>/g, " "))
          : null;
      const licenseText = licenseFromText || licenseFromHtml || null;

      const doc = {
        title: (fetched.title || u).slice(0, 300),
        url: u,
        fetchedAt: new Date(),
        fetchedBy: "batch_scrape_courses.ts",
        contentHtml: fetched.contentHtml || null,
        text: fetched.text || null,
        sections: fetched.sections || [],
        metadata: {
          scraped: true,
          usePuppeteer: true,
          sourceTool: "batch_script",
          licenseCaptured: !!licenseText,
          licenseText: licenseText,
        },
      };

      if (opts.post) {
        const postBase = (opts.post || "").replace(/\/$/, "");
        const resp = await axios.post(`${postBase}/api/scrape`, { links: [{ url: u, title: doc.title }], crawl: opts.crawl, usePuppeteer: true, delayMs: opts.delayMs, randomize: opts.randomize }, { timeout: 120000 });
        results.push({ url: u, posted: true, serverResp: resp.data });
        console.log("Posted:", u, "server replied:", resp.status);
      } else {
        try {
          const created = await RawCourse.create(doc);
          results.push({ url: u, saved: true, id: created._id });
          console.log("Saved to DB:", u);
        } catch (err: any) {
          if ((err as any)?.code === 11000 || (err as any)?.message?.includes?.("E11000")) {
            console.warn("Duplicate found — merging metadata for:", u);
            const existing = await RawCourse.findOne({ url: u }).exec();
            if (existing) {
              existing.title = existing.title || doc.title;
              existing.contentHtml = existing.contentHtml || doc.contentHtml;
              existing.text = existing.text || doc.text;
              existing.sections = (existing.sections && existing.sections.length) ? existing.sections : doc.sections;
              existing.metadata = {
                ...(existing.metadata || {}),
                ...(doc.metadata || {}),
                lastImportedAt: new Date().toISOString(),
              };
              await existing.save();
              results.push({ url: u, merged: true, id: existing._id });
              console.log("Merged metadata for:", u);
            } else {
              results.push({ url: u, error: "duplicate_but_not_found_postmortem" });
            }
          } else {
            console.error("DB save error for", u, (err as any)?.message ?? err);
            results.push({ url: u, error: String((err as any)?.message ?? err) });
          }
        }
      }

      if (opts.crawl) {
        const htmlToScan = fetched.contentHtml || fetched.html || String(fetched.text || "");
        if (htmlToScan) {
          // cheerio-based discovery
          const root = load(htmlToScan);
          const hrefs: string[] = [];
          root("a[href]").each((i, el) => {
            const href = root(el).attr("href");
            if (href) hrefs.push(href);
          });

          const unique = new Set<string>();
          for (const href of hrefs) {
            if (!href) continue;
            if (/^(mailto|tel|javascript):/i.test(href)) continue;
            try {
              const abs = new URL(href, u).toString();
              if (new URL(abs).hostname === new URL(u).hostname) unique.add(abs.split("#")[0]);
              if (unique.size >= 25) break;
            } catch {
              // ignore malformed
            }
          }

          if (unique.size) {
            const discovered = Array.from(unique).map((x) => ({ url: x }));
            if (opts.post) {
              const postBase = (opts.post || "").replace(/\/$/, "");
              const resp = await axios.post(`${postBase}/api/scrape`, { links: discovered.map((d) => ({ url: d.url })), crawl: false, usePuppeteer: true }, { timeout: 120000 });
              results.push({ url: u, discoveredPosted: discovered.length, serverResp: resp.data });
              console.log(`Posted ${discovered.length} discovered links for ${u}`);
            } else {
              for (const d of discovered) {
                try {
                  const created = await RawCourse.create({
                    title: d.url,
                    url: d.url,
                    fetchedAt: new Date(),
                    fetchedBy: "batch_scrape_courses:discover",
                    metadata: { discoveredFrom: u, scraped: false },
                  });
                  results.push({ discoveredSaved: d.url, id: created._id });
                } catch (err2: any) {
                  if ((err2 as any)?.code === 11000 || (err2 as any)?.message?.includes?.("E11000")) {
                    // ignore duplicate
                  } else {
                    console.warn("Error saving discovered url", d.url, (err2 as any)?.message ?? err2);
                  }
                }
                await sleep(100 + jitter(150));
              }
            }
          }
        }
      }
    } catch (err: any) {
      console.error("Fetch error for", u, (err as any)?.message ?? err);
      results.push({ url: u, error: String((err as any)?.message ?? err) });
    }
  }

  if (opts.out) {
    fs.writeFileSync(path.resolve(opts.out), JSON.stringify(results, null, 2), "utf8");
    console.log("Wrote results to", opts.out);
  } else {
    console.log("Results summary:", JSON.stringify(results, null, 2));
  }

  if (!opts.post) {
    try {
      await mongoose.disconnect();
    } catch {}
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("Batch script failed:", err);
  process.exit(1);
});
