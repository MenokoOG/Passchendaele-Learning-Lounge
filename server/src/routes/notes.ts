// server/src/routes/notes.ts
import express from "express";
import { Note } from "../models/Note.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/**
 * GET /api/notes
 * List notes for current user (most recent first)
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    if (!req.user || !req.user.id)
      return res.status(401).json({ error: "Unauthorized" });
    const notes = await Note.find({ user: req.user.id })
      .sort({ updatedAt: -1 })
      .lean();
    return res.json(notes);
  } catch (err) {
    console.error("notes.list error:", err);
    return res.status(500).json({ error: "Failed to list notes" });
  }
});

/**
 * POST /api/notes
 * Create a new note: { title, body or content }
 * returns { ok: true, note }
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    if (!req.user || !req.user.id)
      return res.status(401).json({ error: "Unauthorized" });

    const { title, body, content } = req.body || {};
    const n = new Note({
      user: req.user.id,
      title: title || "Untitled",
      content: content ?? body ?? "",
    });
    await n.save();
    return res.json({ ok: true, note: n });
  } catch (err) {
    console.error("notes.create error:", err);
    return res.status(500).json({ error: "Failed to create note" });
  }
});

/**
 * PUT /api/notes/:id
 * Update note content/title
 */
router.put("/:id", requireAuth, async (req, res) => {
  try {
    if (!req.user || !req.user.id)
      return res.status(401).json({ error: "Unauthorized" });

    const n = await Note.findById(req.params.id);
    if (!n) return res.status(404).json({ error: "Not found" });
    if (String(n.user) !== String(req.user.id))
      return res.status(403).json({ error: "Forbidden" });

    n.title = req.body.title ?? n.title;
    n.content = req.body.content ?? req.body.body ?? n.content;
    await n.save();
    return res.json({ ok: true, note: n });
  } catch (err) {
    console.error("notes.update error:", err);
    return res.status(500).json({ error: "Failed to update note" });
  }
});

/**
 * DELETE /api/notes/:id
 */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    if (!req.user || !req.user.id)
      return res.status(401).json({ error: "Unauthorized" });

    const n = await Note.findById(req.params.id);
    if (!n) return res.status(404).json({ error: "Not found" });
    if (String(n.user) !== String(req.user.id))
      return res.status(403).json({ error: "Forbidden" });
    await n.deleteOne();
    return res.json({ ok: true });
  } catch (err) {
    console.error("notes.delete error:", err);
    return res.status(500).json({ error: "Failed to delete note" });
  }
});

export default router;
