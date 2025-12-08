// server/src/routes/kanban.ts
import express from "express";
import { Board } from "../models/Board.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  const boards = await Board.find({ owner: req.user.id }).sort({
    createdAt: -1,
  });
  res.json(boards);
});

router.post("/", requireAuth, async (req, res) => {
  const { title } = req.body || {};
  if (!title) return res.status(400).json({ error: "title required" });
  const b = new Board({
    title,
    owner: req.user.id,
    columns: [
      { name: "To do", tasks: [] },
      { name: "In progress", tasks: [] },
      { name: "Done", tasks: [] },
    ],
  });
  await b.save();
  res.json({ ok: true, board: b });
});

router.get("/:id", requireAuth, async (req, res) => {
  const b = await Board.findById(req.params.id);
  if (!b) return res.status(404).json({ error: "Not found" });
  if (String(b.owner) !== String(req.user.id))
    return res.status(403).json({ error: "Forbidden" });
  res.json(b);
});

router.put("/:id", requireAuth, async (req, res) => {
  const b = await Board.findById(req.params.id);
  if (!b) return res.status(404).json({ error: "Not found" });
  if (String(b.owner) !== String(req.user.id))
    return res.status(403).json({ error: "Forbidden" });
  if (Array.isArray(req.body.columns)) b.columns = req.body.columns;
  if (req.body.title) b.title = req.body.title;
  await b.save();
  res.json({ ok: true, board: b });
});

router.delete("/:id", requireAuth, async (req, res) => {
  const b = await Board.findById(req.params.id);
  if (!b) return res.status(404).json({ error: "Not found" });
  if (String(b.owner) !== String(req.user.id))
    return res.status(403).json({ error: "Forbidden" });
  await b.deleteOne();
  res.json({ ok: true });
});

export default router;
