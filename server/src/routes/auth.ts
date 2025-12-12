// server/src/routes/auth.ts
import express from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { createTokenForUser } from "../utils/auth.js";
import { requireAuth } from "../middleware/auth.js"; // make sure this exists and sets req.user

const router = express.Router();

/**
 * Register (keeps simple — used mostly for manual testing)
 * body: { username, email, password, role? }
 */
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, role } = req.body || {};
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "username, email and password required" });
    }

    const existing = await User.findOne({
      $or: [{ email: String(email).toLowerCase() }, { username }],
    });
    if (existing) {
      return res.status(409).json({ error: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);
    const user = await User.create({
      username,
      email: String(email).toLowerCase(),
      passwordHash,
      role: role || "student",
    });

    const token = createTokenForUser(user);
    return res.json({
      ok: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err: any) {
    console.error("register error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * Login
 * Accepts { email, username, emailOrUsername, password } - we prefer emailOrUsername.
 */
router.post("/login", async (req, res) => {
  try {
    const { email, username, emailOrUsername, password } = req.body || {};

    if (!password || (!email && !username && !emailOrUsername)) {
      return res
        .status(400)
        .json({ error: "Provide email/username and password" });
    }

    const lookup = (email || username || emailOrUsername)
      .toString()
      .toLowerCase();

    const user = await User.findOne({
      $or: [{ email: lookup }, { username: lookup }],
    }).lean();
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!user.passwordHash) {
      return res
        .status(500)
        .json({ error: "Account not configured for password login" });
    }

    const ok = await bcrypt.compare(
      String(password),
      String(user.passwordHash)
    );
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = createTokenForUser({
      _id: (user as any)._id,
      username: (user as any).username,
      role: (user as any).role,
    });

    return res.json({
      ok: true,
      token,
      user: {
        _id: (user as any)._id,
        username: (user as any).username,
        email: (user as any).email,
        role: (user as any).role,
        preferences: (user as any).preferences ?? {},
      },
    });
  } catch (err: any) {
    console.error("login error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /api/auth/me
 * Returns the authenticated user's public info (no passwordHash)
 */
router.get("/me", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const u = await User.findById(userId).select("-passwordHash").lean();
    if (!u) return res.status(404).json({ error: "Not found" });

    return res.json({ user: u });
  } catch (err) {
    console.error("auth.me error:", err);
    return res.status(500).json({ error: "Failed to fetch user" });
  }
});

/**
 * PUT /api/auth/profile
 * Update current user's profile (convenience for client).
 * Accepts partial user fields (username, email, preferences, password)
 */
router.put("/profile", requireAuth, async (req, res) => {
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

    const updated = await User.findByIdAndUpdate(userId, data, { new: true })
      .select("-passwordHash")
      .lean();
    if (!updated) return res.status(404).json({ error: "Not found" });

    return res.json({ ok: true, user: updated });
  } catch (err) {
    console.error("auth.profile.update error:", err);
    return res.status(500).json({ error: "Update failed" });
  }
});

export default router;
