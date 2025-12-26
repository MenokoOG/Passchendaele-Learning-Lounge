// server/src/routes/users.ts
import express from "express";
import { User } from "../models/User.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { hashPassword } from "../utils/auth.js";

const router = express.Router();

/**
 * Admin-only: create user
 * POST /
 * body: { username, email, password, role? }
 */
router.post("/", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { username, email, password, role } = req.body ?? {};
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "username, email and password required" });
    }

    // check uniqueness
    const existing = await User.findOne({
      $or: [{ email: String(email).toLowerCase() }, { username }],
    });
    if (existing) {
      return res.status(409).json({ error: "User already exists" });
    }

    const passwordHash = await hashPassword(String(password));

    const u = new User({
      username,
      email: String(email).toLowerCase(),
      passwordHash,
      role: role || "student",
    });

    await u.save();

    // return created user without passwordHash
    const out = await User.findById(u._id).select("-passwordHash").lean();
    return res.status(201).json(out);
  } catch (err: any) {
    console.error("users.create error:", err);
    return res.status(500).json({ error: "Failed to create user" });
  }
});

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
    data.passwordHash = await hashPassword(String(password));
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
      data.passwordHash = await hashPassword(String(password));
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
