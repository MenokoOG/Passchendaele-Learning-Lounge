import puppeteer from "puppeteer";
import { splitIntoSections } from "./splitter.js";
import { SCRAPER_USER_AGENT } from "./scraper_identity.js";
import { JSDOM } from "jsdom";
import { PUPPETEER_SKIP_CHROMIUM_DOWNLOAD } from "../config.js";

let _browser: puppeteer.Browser | null = null;

async function getBrowser() {
  if (_browser) return _browser;
  const launchArgs: any = {};
  if (process.env.PUPPETEER_EXECUTABLE_PATH)
    launchArgs.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;

  // Launch once and reuse
  _browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    ...launchArgs,
  });

  // optional: handle process exit to close browser
  const cleanup = async () => {
    try {
      if (_browser) await _browser.close();
    } catch {}
    _browser = null;
  };
  process.on("exit", cleanup);
  process.on("SIGINT", () => {
    cleanup().finally(() => process.exit(0));
  });

  return _browser;
}

/**
 * fetchAndExtract(url) -> { url, title, contentHtml, text, sections }
 * - reuses a single browser instance
 */
export default async function fetchAndExtract(
  url: string,
  options: { waitUntil?: string; usePuppeteer?: boolean }
): Promise<any> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  // smaller timeouts and sensible defaults
  page.setDefaultNavigationTimeout(60_000); // 60s nav timeout
  page.setDefaultTimeout(60_000);

  try {
    await page.setUserAgent(
      SCRAPER_USER_AGENT
    );

    await page.goto(url, {
      waitUntil: (options.waitUntil as any) || "networkidle2",
      timeout: 60_000,
    });

    // small deterministic pause to allow JS-rendered bits to settle (uses any cast to satisfy TS where waitForTimeout may not exist)
    await (page as any).waitForTimeout?.(250);

    // trim UI / noise (keeps content)
    await page.evaluate(() => {
      const removeSelectors = [
        "nav",
        "footer",
        ".site-footer",
        "script",
        "style",
      ];
      removeSelectors.forEach((s) => {
        document.querySelectorAll(s).forEach((el) => el.remove());
      });
    });

    const title = (await page.title()) || "";

    const contentHtml = await page.evaluate(() => {
      const selectors = [
        "article",
        "main",
        "#content",
        ".article",
        ".blog-post",
      ];
      for (const s of selectors) {
        const el = document.querySelector(s);
        if (
          el &&
          el.innerHTML &&
          (el as HTMLElement).innerText.trim().length > 20
        )
          return el.innerHTML;
      }
      // fallback to body
      return document.body ? document.body.innerHTML : "";
    });

    const dom = new JSDOM(contentHtml || "<body></body>");
    const text = dom.window.document.body.textContent?.trim() || "";

    const sections = splitIntoSections(contentHtml || "", text, title);

    await page.close();
    return { url, title, contentHtml, text, sections };
  } catch (err) {
    try {
      if (!page.isClosed()) await page.close();
    } catch {}
    throw err;
  }
}
