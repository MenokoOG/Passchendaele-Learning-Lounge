// server/src/routes/users.ts
import express from "express";
import { User } from "../models/User.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import bcrypt from "bcryptjs";

const router = express.Router();

/**
 * Admin-only: list users
 */
router.get("/", requireAuth, requireRole("admin"), async (req, res) => {
  const users = await User.find().select("-passwordHash").lean();
  return res.json(users);
});

/**
 * Admin-only: get user by id
 */
router.get("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const u = await User.findById(req.params.id).select("-passwordHash").lean();
  if (!u) return res.status(404).json({ error: "Not found" });
  return res.json(u);
});

/**
 * Admin-only: update user (role, username, email, or forcePasswordChange)
 * body: { username?, email?, role?, forcePasswordChange?, password? } - if password provided it will be hashed
 */
router.put("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const data: any = {};
  const { username, email, role, forcePasswordChange, password } =
    req.body ?? {};
  if (username) data.username = username;
  if (email) data.email = email;
  if (role) data.role = role;
  if (typeof forcePasswordChange === "boolean")
    data.forcePasswordChange = forcePasswordChange;
  if (password) {
    const salt = await bcrypt.genSalt(10);
    data.passwordHash = await bcrypt.hash(String(password), salt);
  }
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, data, {
      new: true,
    })
      .select("-passwordHash")
      .lean();
    if (!updated) return res.status(404).json({ error: "Not found" });
    return res.json(updated);
  } catch (err: any) {
    console.error("users.update error:", err);
    return res.status(500).json({ error: "Update failed" });
  }
});

/**
 * Admin-only: delete user
 */
router.delete("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  return res.json({ ok: true });
});

/**
 * PUT /api/users/me
 * Body: { username?, email?, password?, preferences? }
 * Updates the authenticated user's profile; returns updated user (without passwordHash).
 */
router.put("/me", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { username, email, password, preferences } = req.body ?? {};
    const data: any = {};
    if (typeof username === "string") data.username = username;
    if (typeof email === "string") data.email = email;
    if (typeof preferences === "object") data.preferences = preferences;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      data.passwordHash = await bcrypt.hash(String(password), salt);
    }

    const updated = await User.findByIdAndUpdate(userId, data, {
      new: true,
    }).select("-passwordHash");

    if (!updated) return res.status(404).json({ error: "Not found" });
    return res.json(updated);
  } catch (err: any) {
    console.error("users.me.update error:", err);
    return res.status(500).json({ error: "Update failed" });
  }
});

export default router;
