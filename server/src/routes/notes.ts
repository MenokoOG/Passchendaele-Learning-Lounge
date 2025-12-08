// server/src/routes/notes.ts
import express from "express";
import { Note } from "../models/Note.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// List notes for current user
router.get("/", requireAuth, async (req, res) => {
  const notes = await Note.find({ user: req.user.id }).sort({ updatedAt: -1 });
  res.json(notes);
});

router.post("/", requireAuth, async (req, res) => {
  const { title, content } = req.body || {};
  const n = new Note({
    user: req.user.id,
    title: title || "Untitled",
    content: content || "",
  });
  await n.save();
  res.json({ ok: true, note: n });
});

router.put("/:id", requireAuth, async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note) return res.status(404).json({ error: "Not found" });
  if (String(note.user) !== String(req.user.id))
    return res.status(403).json({ error: "Forbidden" });
  note.title = req.body.title ?? note.title;
  note.content = req.body.content ?? note.content;
  await note.save();
  res.json({ ok: true, note });
});

router.delete("/:id", requireAuth, async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note) return res.status(404).json({ error: "Not found" });
  if (String(note.user) !== String(req.user.id))
    return res.status(403).json({ error: "Forbidden" });
  await note.deleteOne();
  res.json({ ok: true });
});

export default router;
