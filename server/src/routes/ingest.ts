// server/src/routes/ingest.ts
import express from "express";
import { RawCourse } from "../models/RawCourse.js";

const router = express.Router();

/**
 * POST /api/raw
 * Accepts a lesson JSON (title, url, contentHtml, text, sections, metadata)
 * If body._id provided -> update, otherwise insert new doc.
 */
router.post("/", async (req, res) => {
  const payload = req.body;
  if (
    !payload ||
    (!payload.text && !payload.contentHtml && !payload.sections)
  ) {
    return res
      .status(400)
      .json({ error: "Missing content (text/contentHtml/sections)" });
  }

  try {
    let doc;
    if (payload._id) {
      doc = await RawCourse.findByIdAndUpdate(
        payload._id,
        { ...payload, fetchedAt: new Date() },
        { new: true, upsert: true }
      );
    } else {
      doc = new RawCourse({
        title: payload.title || payload.url || "untitled",
        url: payload.url,
        fetchedAt: payload.fetchedAt || new Date(),
        fetchedBy: payload.fetchedBy || "ingest",
        contentHtml: payload.contentHtml,
        text: payload.text,
        sections: payload.sections || [],
        metadata: payload.metadata || {},
      });
      await doc.save();
    }
    res.json({ ok: true, id: doc._id, message: "raw saved" });
  } catch (err: any) {
    console.error("ingest error", err);
    res.status(500).json({ error: String(err.message || err) });
  }
});

export default router;
