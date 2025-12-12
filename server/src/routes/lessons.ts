// server/src/routes/lessons.ts
import express from "express";
import mongoose from "mongoose";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

/**
 * Minimal Lesson schema (keeps compatible shape with frontend)
 * If you already have a Lesson model in /models, you can swap to import it instead.
 */
const LessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, index: true, unique: true, sparse: true },
    summary: String,
    contentHtml: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Lesson = mongoose.models.Lesson || mongoose.model("Lesson", LessonSchema);

/**
 * GET /api/lessons
 * - if authenticated and role is instructor/admin -> return all
 * - otherwise return only published lessons
 */
router.get("/", async (req, res) => {
  try {
    // if no auth, show published only
    const authUser = (req as any).user;
    if (
      authUser &&
      (authUser.role === "admin" || authUser.role === "instructor")
    ) {
      const all = await Lesson.find().sort({ createdAt: -1 }).lean();
      return res.json(all);
    }
    const published = await Lesson.find({ published: true })
      .sort({ createdAt: -1 })
      .lean();
    return res.json(published);
  } catch (err) {
    console.error("lessons.list error:", err);
    return res.status(500).json({ error: "Failed to list lessons" });
  }
});

/**
 * GET /api/lessons/:id
 */
router.get("/:id", async (req, res) => {
  try {
    const l = await Lesson.findById(req.params.id).lean();
    if (!l || Array.isArray(l))
      return res.status(404).json({ error: "Not found" });
    if (!l.published) {
      // if not published require owner or instructor/admin
      const u = (req as any).user;
      if (
        !u ||
        (u.role !== "admin" &&
          u.role !== "instructor" &&
          String(l.owner) !== String(u.id))
      ) {
        return res.status(403).json({ error: "Forbidden" });
      }
    }
    return res.json(l);
  } catch (err) {
    console.error("lessons.get error:", err);
    return res.status(500).json({ error: "Failed to get lesson" });
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
    if (!title) return res.status(400).json({ error: "title required" });
    const ownerId = (req as any).user.id;
    const l = new Lesson({
      title,
      slug,
      summary,
      contentHtml,
      published: !!published,
      owner: ownerId,
    });
    await l.save();
    return res.json({ ok: true, lesson: l });
  } catch (err) {
    console.error("lessons.create error:", err);
    return res.status(500).json({ error: "Failed to create lesson" });
  }
});

/**
 * PUT /api/lessons/:id
 * Update lesson (owner or instructor/admin)
 */
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const l = await Lesson.findById(req.params.id);
    if (!l) return res.status(404).json({ error: "Not found" });
    const u = (req as any).user;
    if (!u) return res.status(401).json({ error: "Unauthorized" });
    const isOwner = String(l.owner) === String(u.id);
    if (!(isOwner || u.role === "admin" || u.role === "instructor")) {
      return res.status(403).json({ error: "Forbidden" });
    }
    ["title", "slug", "summary", "contentHtml", "published"].forEach((k) => {
      if (req.body[k] !== undefined) (l as any)[k] = req.body[k];
    });
    await l.save();
    return res.json({ ok: true, lesson: l });
  } catch (err) {
    console.error("lessons.update error:", err);
    return res.status(500).json({ error: "Failed to update lesson" });
  }
});

/**
 * DELETE /api/lessons/:id
 */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const l = await Lesson.findById(req.params.id);
    if (!l) return res.status(404).json({ error: "Not found" });
    const u = (req as any).user;
    if (!u) return res.status(401).json({ error: "Unauthorized" });
    const isOwner = String(l.owner) === String(u.id);
    if (!(isOwner || u.role === "admin")) {
      return res.status(403).json({ error: "Forbidden" });
    }
    await l.deleteOne();
    return res.json({ ok: true });
  } catch (err) {
    console.error("lessons.delete error:", err);
    return res.status(500).json({ error: "Failed to delete lesson" });
  }
});

export default router;
