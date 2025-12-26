// server/src/routes/notes.ts
import express from "express";
import { Note } from "../models/Note.js";
import { requireAuth } from "../middleware/auth.js";
import {
  requireUser,
  verifyOwnership,
  sendError,
  sendSuccess,
} from "../utils/helpers.js";

const router = express.Router();

/**
 * GET /api/notes
 * List notes for current user (most recent first)
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    const notes = await Note.find({ user: userId })
      .sort({ updatedAt: -1 })
      .lean();
    return sendSuccess(res, notes);
  } catch (err) {
    console.error("notes.list error:", err);
    return sendError(res, 500, "Failed to list notes");
  }
});

/**
 * POST /api/notes
 * Create a new note: { title, body or content }
 * returns { ok: true, note }
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    const { title, body, content } = req.body || {};
    const n = new Note({
      user: userId,
      title: title || "Untitled",
      content: content ?? body ?? "",
    });
    await n.save();
    return sendSuccess(res, { ok: true, note: n });
  } catch (err) {
    console.error("notes.create error:", err);
    return sendError(res, 500, "Failed to create note");
  }
});

/**
 * PUT /api/notes/:id
 * Update note content/title
 */
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    const n = await Note.findById(req.params.id);
    if (!n) return sendError(res, 404, "Not found");
    if (!verifyOwnership(req, res, n.user)) return;

    n.title = req.body.title ?? n.title;
    n.content = req.body.content ?? req.body.body ?? n.content;
    await n.save();
    return sendSuccess(res, { ok: true, note: n });
  } catch (err) {
    console.error("notes.update error:", err);
    return sendError(res, 500, "Failed to update note");
  }
});

/**
 * DELETE /api/notes/:id
 */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    const n = await Note.findById(req.params.id);
    if (!n) return sendError(res, 404, "Not found");
    if (!verifyOwnership(req, res, n.user)) return;

    await n.deleteOne();
    return sendSuccess(res, { ok: true });
  } catch (err) {
    console.error("notes.delete error:", err);
    return sendError(res, 500, "Failed to delete note");
  }
});

export default router;
