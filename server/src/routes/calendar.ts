// server/src/routes/calendar.ts
import express from "express";
import { Event } from "../models/Event.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  const evts = await Event.find({ owner: req.user.id }).sort({ start: 1 });
  res.json(evts);
});

router.post("/", requireAuth, async (req, res) => {
  const { title, description, start, end, allDay } = req.body || {};
  if (!title || !start)
    return res.status(400).json({ error: "title and start required" });
  const e = new Event({
    title,
    description,
    start: new Date(start),
    end: end ? new Date(end) : null,
    allDay: !!allDay,
    owner: req.user.id,
  });
  await e.save();
  res.json({ ok: true, event: e });
});

router.put("/:id", requireAuth, async (req, res) => {
  const e = await Event.findById(req.params.id);
  if (!e) return res.status(404).json({ error: "Not found" });
  if (String(e.owner) !== String(req.user.id))
    return res.status(403).json({ error: "Forbidden" });
  ["title", "description", "start", "end", "allDay"].forEach((k) => {
    if (req.body[k] !== undefined)
      (e as any)[k] =
        k === "start" || k === "end" ? new Date(req.body[k]) : req.body[k];
  });
  await e.save();
  res.json({ ok: true, event: e });
});

router.delete("/:id", requireAuth, async (req, res) => {
  const e = await Event.findById(req.params.id);
  if (!e) return res.status(404).json({ error: "Not found" });
  if (String(e.owner) !== String(req.user.id))
    return res.status(403).json({ error: "Forbidden" });
  await e.deleteOne();
  res.json({ ok: true });
});

export default router;
