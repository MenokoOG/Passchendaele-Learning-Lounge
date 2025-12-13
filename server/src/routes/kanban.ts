// server/src/routes/kanban.ts
import express from "express";
import { Board } from "../models/Board.js";
import { requireAuth } from "../middleware/auth.js";
import {
  requireUser,
  verifyOwnership,
  sendError,
  sendSuccess,
} from "../utils/helpers.js";

const router = express.Router();

/**
 * GET /api/kanban
 * List boards owned by current user
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    const boards = await Board.find({ owner: userId }).sort({
      createdAt: -1,
    });
    return sendSuccess(res, boards);
  } catch (err) {
    console.error("kanban.list error:", err);
    return sendError(res, 500, "Failed to list boards");
  }
});

/**
 * POST /api/kanban
 * Create new board { title }
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    const { title } = req.body || {};
    if (!title) return sendError(res, 400, "title required");

    const b = new Board({
      title,
      owner: userId,
      columns: [
        { name: "To do", tasks: [] },
        { name: "In progress", tasks: [] },
        { name: "Done", tasks: [] },
      ],
    });
    await b.save();
    return sendSuccess(res, { ok: true, board: b });
  } catch (err) {
    console.error("kanban.create error:", err);
    return sendError(res, 500, "Failed to create board");
  }
});

/**
 * GET /api/kanban/:id
 */
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    const b = await Board.findById(req.params.id);
    if (!b) return sendError(res, 404, "Not found");
    if (!verifyOwnership(req, res, b.owner)) return;

    return sendSuccess(res, b);
  } catch (err) {
    console.error("kanban.get error:", err);
    return sendError(res, 500, "Failed to get board");
  }
});

/**
 * PUT /api/kanban/:id
 * Update title or columns array
 */
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    const b = await Board.findById(req.params.id);
    if (!b) return sendError(res, 404, "Not found");
    if (!verifyOwnership(req, res, b.owner)) return;

    if (req.body.title) b.title = req.body.title;
    if (Array.isArray(req.body.columns)) b.columns = req.body.columns;
    await b.save();
    return sendSuccess(res, { ok: true, board: b });
  } catch (err) {
    console.error("kanban.update error:", err);
    return sendError(res, 500, "Failed to update board");
  }
});

/**
 * DELETE /api/kanban/:id
 */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    const b = await Board.findById(req.params.id);
    if (!b) return sendError(res, 404, "Not found");
    if (!verifyOwnership(req, res, b.owner)) return;

    await b.deleteOne();
    return sendSuccess(res, { ok: true });
  } catch (err) {
    console.error("kanban.delete error:", err);
    return sendError(res, 500, "Failed to delete board");
  }
});

export default router;
