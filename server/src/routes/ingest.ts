// server/src/routes/ingest.ts
import express from "express";
import { RawCourse } from "../models/RawCourse.js";
import { extractLicenseFromContent } from "../utils/extract_license.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

/**
 * POST /api/ingest  (instructor or admin only)
 * Accepts a lesson JSON (title, url, contentHtml, text, sections, metadata)
 * If body._id provided -> update, otherwise insert new doc.
 */
router.post(
  "/",
  requireAuth,
  requireRole("instructor", "admin"),
  async (req, res) => {
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
    // Extract license from text or HTML
    const { licenseText, licenseCaptured } = extractLicenseFromContent({
      text: payload.text,
      contentHtml: payload.contentHtml,
    });

    // preserve incoming metadata but add details
    const incomingMeta = payload.metadata || {};
    const finalMeta = {
      ...incomingMeta,
      licenseCaptured,
      licenseText,
      originalPayloadSource:
        payload.fetchedBy || incomingMeta.fetchedBy || "ingest",
      ingestedAt: new Date(),
    };

    let doc;
    if (payload._id) {
      doc = await RawCourse.findByIdAndUpdate(
        payload._id,
        { ...payload, fetchedAt: new Date(), metadata: finalMeta },
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
        metadata: finalMeta,
      });
      await doc.save();
    }

    res.json({
      ok: true,
      id: doc._id,
      message: "raw saved",
      licenseCaptured,
    });
  } catch (err: any) {
    console.error("ingest error", err);
    res.status(500).json({ error: String(err.message || err) });
  }
  }
);

export default router;
