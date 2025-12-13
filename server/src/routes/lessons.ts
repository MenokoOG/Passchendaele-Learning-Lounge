// server/src/routes/lessons.ts
import express from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { Lesson } from "../models/Lesson.js";
import {
  getUserId,
  hasRole,
  isOwnerOrHasRole,
  sendError,
  sendSuccess,
} from "../utils/helpers.js";

const router = express.Router();

/**
 * GET /api/lessons
 * - if authenticated and role is instructor/admin -> return all
 * - otherwise return only published lessons
 */
router.get("/", async (req, res) => {
  try {
    // if no auth, show published only
    const authUser = (req as any).user;
    if (authUser && hasRole(req, "admin", "instructor")) {
      const all = await Lesson.find().sort({ createdAt: -1 }).lean();
      return sendSuccess(res, all);
    }
    const published = await Lesson.find({ published: true })
      .sort({ createdAt: -1 })
      .lean();
    return sendSuccess(res, published);
  } catch (err) {
    console.error("lessons.list error:", err);
    return sendError(res, 500, "Failed to list lessons");
  }
});

/**
 * GET /api/lessons/:id
 */
router.get("/:id", async (req, res) => {
  try {
    const l = await Lesson.findById(req.params.id).lean();
    if (!l || Array.isArray(l)) return sendError(res, 404, "Not found");

    if (!l.published) {
      // if not published require owner or instructor/admin
      const userId = getUserId(req);
      if (!userId || (!hasRole(req, "admin", "instructor") && String(l.owner) !== userId)) {
        return sendError(res, 403, "Forbidden");
      }
    }
    return sendSuccess(res, l);
  } catch (err) {
    console.error("lessons.get error:", err);
    return sendError(res, 500, "Failed to get lesson");
  }
});

/**
 * POST /api/lessons
 * Create lesson (instructor or admin)
 * Body: { title, slug, summary, contentHtml, published }
 */
router.post("/", requireAuth, requireRole("instructor"), async (req, res) => {
  try {
    const { title, slug, summary, contentHtml, published } = req.body || {};
    if (!title) return sendError(res, 400, "title required");

    const ownerId = getUserId(req);
    const l = new Lesson({
      title,
      slug,
      summary,
      contentHtml,
      published: !!published,
      owner: ownerId,
    });
    await l.save();
    return sendSuccess(res, { ok: true, lesson: l });
  } catch (err) {
    console.error("lessons.create error:", err);
    return sendError(res, 500, "Failed to create lesson");
  }
});

/**
 * PUT /api/lessons/:id
 * Update lesson (owner or instructor/admin)
 */
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const l = await Lesson.findById(req.params.id);
    if (!l) return sendError(res, 404, "Not found");

    if (!isOwnerOrHasRole(req, l.owner, "admin", "instructor")) {
      return sendError(res, 403, "Forbidden");
    }

    ["title", "slug", "summary", "contentHtml", "published"].forEach((k) => {
      if (req.body[k] !== undefined) (l as any)[k] = req.body[k];
    });
    await l.save();
    return sendSuccess(res, { ok: true, lesson: l });
  } catch (err) {
    console.error("lessons.update error:", err);
    return sendError(res, 500, "Failed to update lesson");
  }
});

/**
 * DELETE /api/lessons/:id
 */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const l = await Lesson.findById(req.params.id);
    if (!l) return sendError(res, 404, "Not found");

    if (!isOwnerOrHasRole(req, l.owner, "admin")) {
      return sendError(res, 403, "Forbidden");
    }

    await l.deleteOne();
    return sendSuccess(res, { ok: true });
  } catch (err) {
    console.error("lessons.delete error:", err);
    return sendError(res, 500, "Failed to delete lesson");
  }
});

export default router;
