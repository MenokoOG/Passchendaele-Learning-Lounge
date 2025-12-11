// server/src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth.js";
import { User } from "../models/User.js";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * requireAuth - Express middleware that verifies a Bearer JWT and attaches the user
 * to req.user (without passwordHash). Returns 401 on missing/invalid token.
 *
 * Important: this middleware normalizes req.user.id as a string (copied from _id)
 * so downstream routes can safely reference req.user.id.
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const header = String(req.headers.authorization || "");
    const m = header.match(/^Bearer (.+)$/i);
    if (!m) {
      return res.status(401).json({ error: "Missing token" });
    }

    const token = m[1];
    let payload: any;
    try {
      payload = verifyToken(token);
    } catch (err: any) {
      console.error(
        "requireAuth: token verification failed:",
        err?.message ?? err
      );
      return res.status(401).json({ error: "Invalid token" });
    }

    if (!payload?.id) {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    // load user from DB (no password)
    const user = await User.findById(payload.id).select("-passwordHash").lean();
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Normalize common fields used throughout the codebase:
    // - ensure user.id is present (string)
    // - ensure user.role exists as string
    (user as any).id = String((user as any)._id ?? (user as any).id ?? "");
    (user as any).role = String((user as any).role ?? "");

    req.user = user;
    return next();
  } catch (err: any) {
    console.error("requireAuth error:", err?.message ?? err);
    return res.status(500).json({ error: "Server error" });
  }
}

/**
 * requireRole(...allowedRoles) - middleware factory
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const role = String(req.user.role ?? "");
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ error: "Forbidden - insufficient role" });
    }
    return next();
  };
}
