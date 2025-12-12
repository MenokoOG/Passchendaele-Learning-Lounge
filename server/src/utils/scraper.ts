import axios from "axios";
import { load } from "cheerio";
import fetchWithPuppeteer from "./scraper_puppeteer.js";
import { splitIntoSections } from "./splitter.js";

export async function fetchHtml(url: string) {
  const res = await axios.get(url, {
    timeout: 15000,
    headers: {
      "User-Agent":
        "google-tee-bot/1.0 (+https://ljefferson-menoko-site.netlify.app/)",
    },
  });
  return res.data as string;
}

export function extractTextFromHtml(html: string) {
  const $ = load(html);
  const selectors = [
    "main",
    "article",
    ".devsite-article-body",
    "#main",
    ".content",
    ".article",
  ];
  for (const sel of selectors) {
    const el = $(sel);
    if (el && el.text().trim().length > 200) {
      return el.text().trim();
    }
  }
  let text = $("body").text() || "";
  text = text.replace(/\s{2,}/g, " ").trim();
  return text.slice(0, 200000);
}

export async function fetchAndExtract(
  url: string,
  options: { usePuppeteer?: boolean } = {}
) {
  const useP = !!options.usePuppeteer;
  if (useP) {
    return fetchWithPuppeteer(url, options);
  }

  try {
    const html = await fetchHtml(url);
    let title = "";
    try {
      const m = html.match(/<title>(.*?)<\/title>/i);
      if (m) title = (m[1] || "").replace(/\s+/g, " ").trim();
    } catch {}
    const text = extractTextFromHtml(html);
    const sections = splitIntoSections(html, text, title);
    return {
      ok: true,
      html,
      title,
      text,
      contentHtml: null,
      sections,
      metadata: { fetchedBy: "http", fetchedAt: new Date().toISOString() },
    };
  } catch (err) {
    try {
      return await fetchWithPuppeteer(url, options);
    } catch (err2) {
      throw err2 ?? err;
    }
  }
}
