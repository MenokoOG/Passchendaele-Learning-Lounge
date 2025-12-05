import express from "express";
import { fetchAndExtract } from "../utils/scraper.js";
import { RawCourse } from "../models/RawCourse.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { links } = req.body;
  if (!Array.isArray(links))
    return res.status(400).json({ error: "links array required" });

  const results: any[] = [];

  for (const item of links) {
    const url = item.url;
    const titleHint = item.title || "";
    const usePuppeteer = !!item.usePuppeteer || !!req.body.usePuppeteer;
    try {
      const extracted = await fetchAndExtract(url, { usePuppeteer });

      const ogTitle =
        "metadata" in extracted && extracted.metadata
          ? (extracted.metadata as any)?.ogTitle
          : undefined;
      const title = extracted.title || titleHint || ogTitle || "";

      const doc = await RawCourse.findOneAndUpdate(
        { url },
        {
          $set: {
            title,
            url,
            type: /youtube\.com|youtu\.be/.test(url) ? "youtube" : "page",
            fetchedAt: new Date(),
            html:
              "html" in extracted
                ? (extracted as any).html
                : extracted.contentHtml ?? null,
            text: extracted.text?.slice(0, 100000) ?? null,
            metadata: {
              ...(extracted && "metadata" in extracted
                ? (extracted as any).metadata
                : {}),
              sections: extracted.sections ?? [],
            },
          },
        },
        { upsert: true, new: true }
      );
      results.push({
        url,
        ok: true,
        id: doc._id,
        type: doc.type,
        sections: (extracted.sections || []).length,
      });
    } catch (err: any) {
      results.push({ url, ok: false, error: String(err?.message ?? err) });
    }
  }

  res.json({ results });
});

export default router;
