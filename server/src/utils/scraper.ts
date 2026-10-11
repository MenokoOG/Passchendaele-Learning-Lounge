import axios from "axios";
import { load } from "cheerio";
import fetchWithPuppeteer from "./scraper_puppeteer.js";
import { splitIntoSections } from "./splitter.js";
import { SCRAPER_USER_AGENT } from "./scraper_identity.js";

export async function fetchHtml(url: string) {
  const res = await axios.get(url, {
    timeout: 20000,
    maxRedirects: 5,
    headers: {
      "User-Agent": SCRAPER_USER_AGENT,
      Accept: "text/html,application/xhtml+xml",
    },
  });
  return res.data as string;
}

/** Containers tried in order when looking for the main article body. */
const CONTENT_SELECTORS = [
  "article",
  "main",
  "[role=main]",
  "#main-content",
  "#content",
  "#mw-content-text", // Wikipedia
  ".mw-parser-output",
  ".article-content",
  ".entry-content",
  ".content",
  "#main",
];

/** Elements that are never lesson content (and some are unsafe to render). */
const STRIP_SELECTORS = [
  "script",
  "style",
  "noscript",
  "iframe",
  "object",
  "embed",
  "form",
  "nav",
  "header",
  "footer",
  "aside",
  "svg",
  "button",
  ".navbox",
  ".mw-editsection",
  ".reference",
  ".cookie",
  "[class*=cookie]",
  "[id*=cookie]",
];

/**
 * Pull the main content out of a page as *sanitized* HTML plus plain text.
 * The classroom renders contentHtml with dangerouslySetInnerHTML, so everything
 * executable is removed here: scripts, iframes, inline handlers, javascript: URLs.
 */
export function extractMainContent(html: string, baseUrl?: string) {
  const $ = load(html);
  STRIP_SELECTORS.forEach((s) => $(s).remove());

  let root = $("body");
  for (const sel of CONTENT_SELECTORS) {
    const el = $(sel).first();
    if (el.length && el.text().trim().length > 200) {
      root = el;
      break;
    }
  }

  root.find("*").each((_, el) => {
    const attribs = (el as any).attribs || {};
    for (const name of Object.keys(attribs)) {
      const val = String(attribs[name] || "");
      if (/^on/i.test(name) || /^\s*javascript:/i.test(val)) {
        $(el).removeAttr(name);
      }
    }
  });

  // absolutise links and images so they keep working outside the source site
  if (baseUrl) {
    root.find("a[href]").each((_, el) => {
      try {
        $(el).attr("href", new URL($(el).attr("href")!, baseUrl).toString());
        $(el).attr("rel", "noopener noreferrer");
        $(el).attr("target", "_blank");
      } catch {
        $(el).removeAttr("href");
      }
    });
    root.find("img[src]").each((_, el) => {
      try {
        $(el).attr("src", new URL($(el).attr("src")!, baseUrl).toString());
      } catch {
        $(el).remove();
      }
    });
  }

  const contentHtml = (root.html() || "").trim();
  const text = root.text().replace(/\s{2,}/g, " ").trim().slice(0, 200000);
  return { contentHtml, text };
}

export function extractTextFromHtml(html: string) {
  return extractMainContent(html).text;
}

function extractTitle(html: string) {
  const $ = load(html);
  const og = $('meta[property="og:title"]').attr("content");
  const h1 = $("h1").first().text();
  const t = $("title").first().text();
  return (og || h1 || t || "").replace(/\s+/g, " ").trim();
}

export async function fetchAndExtract(
  url: string,
  options: { usePuppeteer?: boolean } = {}
) {
  if (options.usePuppeteer) {
    return fetchWithPuppeteer(url, options);
  }

  try {
    const html = await fetchHtml(url);
    const title = extractTitle(html);
    const { contentHtml, text } = extractMainContent(html, url);
    const sections = splitIntoSections(contentHtml, text, title);
    return {
      ok: true,
      url,
      html,
      title,
      text,
      contentHtml,
      sections,
      metadata: { fetchedBy: "http", fetchedAt: new Date().toISOString() },
    };
  } catch (err) {
    try {
      return await fetchWithPuppeteer(url, options);
    } catch (err2) {
      // surface the original HTTP error: it is the actionable one (403, 404, timeout)
      throw err ?? err2;
    }
  }
}

export default fetchAndExtract;
