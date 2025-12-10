// server/src/routes/kanban.ts
import express from "express";
import { Board } from "../models/Board.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/**
 * GET /api/kanban
 * List boards owned by current user
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const boards = await Board.find({ owner: req.user.id }).sort({
      createdAt: -1,
    });
    return res.json(boards);
  } catch (err) {
    console.error("kanban.list error:", err);
    return res.status(500).json({ error: "Failed to list boards" });
  }
});

/**
 * POST /api/kanban
 * Create new board { title }
 */
router.post("/", requireAuth, async (req, res) => {
  try {
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
    return res.json({ ok: true, board: b });
  } catch (err) {
    console.error("kanban.create error:", err);
    return res.status(500).json({ error: "Failed to create board" });
  }
});

/**
 * GET /api/kanban/:id
 */
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const b = await Board.findById(req.params.id);
    if (!b) return res.status(404).json({ error: "Not found" });
    if (String(b.owner) !== String(req.user.id))
      return res.status(403).json({ error: "Forbidden" });
    return res.json(b);
  } catch (err) {
    console.error("kanban.get error:", err);
    return res.status(500).json({ error: "Failed to get board" });
  }
});

/**
 * PUT /api/kanban/:id
 * Update title or columns array
 */
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const b = await Board.findById(req.params.id);
    if (!b) return res.status(404).json({ error: "Not found" });
    if (String(b.owner) !== String(req.user.id))
      return res.status(403).json({ error: "Forbidden" });

    if (req.body.title) b.title = req.body.title;
    if (Array.isArray(req.body.columns)) b.columns = req.body.columns;
    await b.save();
    return res.json({ ok: true, board: b });
  } catch (err) {
    console.error("kanban.update error:", err);
    return res.status(500).json({ error: "Failed to update board" });
  }
});

/**
 * DELETE /api/kanban/:id
 */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const b = await Board.findById(req.params.id);
    if (!b) return res.status(404).json({ error: "Not found" });
    if (String(b.owner) !== String(req.user.id))
      return res.status(403).json({ error: "Forbidden" });
    await b.deleteOne();
    return res.json({ ok: true });
  } catch (err) {
    console.error("kanban.delete error:", err);
    return res.status(500).json({ error: "Failed to delete board" });
  }
});

export default router;
