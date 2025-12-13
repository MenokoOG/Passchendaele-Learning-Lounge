// server/src/routes/calendar.ts
import express from "express";
import { Event } from "../models/Event.js";
import { requireAuth } from "../middleware/auth.js";
import {
  requireUser,
  verifyOwnership,
  sendError,
  sendSuccess,
} from "../utils/helpers.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  const userId = requireUser(req, res);
  if (!userId) return;

  const evts = await Event.find({ owner: userId }).sort({ start: 1 });
  sendSuccess(res, evts);
});

router.post("/", requireAuth, async (req, res) => {
  const userId = requireUser(req, res);
  if (!userId) return;

  const { title, description, start, end, allDay } = req.body || {};
  if (!title || !start) return sendError(res, 400, "title and start required");

  const e = new Event({
    title,
    description,
    start: new Date(start),
    end: end ? new Date(end) : null,
    allDay: !!allDay,
    owner: userId,
  });
  await e.save();
  sendSuccess(res, { ok: true, event: e });
});

router.put("/:id", requireAuth, async (req, res) => {
  const userId = requireUser(req, res);
  if (!userId) return;

  const e = await Event.findById(req.params.id);
  if (!e) return sendError(res, 404, "Not found");
  if (!verifyOwnership(req, res, e.owner)) return;

  ["title", "description", "start", "end", "allDay"].forEach((k) => {
    if (req.body[k] !== undefined)
      (e as any)[k] =
        k === "start" || k === "end" ? new Date(req.body[k]) : req.body[k];
  });
  await e.save();
  sendSuccess(res, { ok: true, event: e });
});

router.delete("/:id", requireAuth, async (req, res) => {
  const userId = requireUser(req, res);
  if (!userId) return;

  const e = await Event.findById(req.params.id);
  if (!e) return sendError(res, 404, "Not found");
  if (!verifyOwnership(req, res, e.owner)) return;

  await e.deleteOne();
  sendSuccess(res, { ok: true });
});

export default router;
