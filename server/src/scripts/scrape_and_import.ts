// server/src/scripts/scrape_and_import.ts
import fetchAndExtract from "../utils/scraper_puppeteer.js";
import axios from "axios";
import fs from "fs";
import path from "path";

async function main() {
  const args = process.argv.slice(2);
  if (!args.length) {
    console.error(
      "Usage: ts-node src/scripts/scrape_and_import.ts <url> [--post=http://localhost:4000/api/raw] [--out=./out.json]"
    );
    process.exit(2);
  }
  const urlArg = args.find((a) => !a.startsWith("--"))!;
  const postArg = (args.find((a) => a.startsWith("--post=")) || "").replace(
    "--post=",
    ""
  );
  const outArg = (args.find((a) => a.startsWith("--out=")) || "").replace(
    "--out=",
    ""
  );

  console.log("Fetching", urlArg);
  const res = await fetchAndExtract(urlArg);
  const lesson = {
    title: res.title || urlArg,
    url: urlArg,
    fetchedAt: new Date().toISOString(),
    fetchedBy: "scrape_and_import.ts",
    contentHtml: res.contentHtml,
    text: res.text,
    sections: res.sections,
    metadata: { scraped: true },
  };

  if (outArg) {
    const p = path.resolve(outArg);
    fs.writeFileSync(p, JSON.stringify(lesson, null, 2), "utf8");
    console.log("Saved to", p);
  }

  if (postArg) {
    console.log("Posting to", postArg);
    const r = await axios.post(postArg, lesson, { timeout: 120000 });
    console.log(
      "Server response:",
      r.status,
      r.data?.message || "(no message)"
    );
  } else {
    console.log(JSON.stringify(lesson, null, 2).slice(0, 2000));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
