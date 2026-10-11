// server/src/scripts/scrape_links.ts
/**
 * Scrape the whole Passchendaele source catalog through the running API.
 *
 *   pnpm --filter ./server run scrape:links
 *   SERVER_HOST=http://localhost:4000 ... (override host)
 *   SCRAPE_TOKEN, or SCRAPE_USERNAME + SCRAPE_PASSWORD (instructor/admin account)
 *
 * Each page is fetched with robots.txt honoured and a delay between requests,
 * then upserted as a RawCourse with institution / nation / rights attribution.
 */
import axios from "axios";
import { scrapeLinksFromCatalog } from "../data/passchendaele_sources.js";
import { getAuthHeaders } from "./auth_header.js";

(async () => {
  try {
    const host = process.env.SERVER_HOST || "http://localhost:4000";
    const links = scrapeLinksFromCatalog();
    console.log(`Scraping ${links.length} Passchendaele sources via ${host} ...`);
    const resp = await axios.post(
      `${host}/api/scrape`,
      { links, processNow: true, delayMs: 1500, randomize: true },
      { timeout: 900000, headers: await getAuthHeaders(host) }
    );
    const rows: any[] = resp.data?.results ?? [];
    for (const r of rows) {
      console.log(`${String(r.status).padEnd(18)} ${r.url}${r.error ? "  -> " + r.error : ""}`);
    }
    const ok = rows.filter((r) => r.status === "saved").length;
    console.log(`\n${ok}/${rows.length} saved.`);
  } catch (err: any) {
    console.error("Error scraping:", err.message || err);
    process.exitCode = 1;
  }
})();
