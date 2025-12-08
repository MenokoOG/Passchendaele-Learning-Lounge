// server/src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_EXPIRES, JWT_SECRET } from "../config.js";
import { User } from "../models/User.js";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const JWT_SECRET_STRING = String(JWT_SECRET ?? "").trim();
const JWT_SECRET_BUFFER = Buffer.from(JWT_SECRET_STRING, "utf8");
const JWT_EXPIRES_STRING = String(JWT_EXPIRES ?? "7d");

if (!JWT_SECRET_STRING || JWT_SECRET_STRING.length < 8) {
  console.warn(
    "Warning: JWT_SECRET is missing or short. Use a secure 32+ char secret in production."
  );
}

/**
 * Create a JWT for a user.
 */
export function createTokenForUser(user: {
  _id: any;
  username: string;
  role: string;
}): string {
  const payload = { id: String(user._id), role: user.role, u: user.username };

  // cast expiresIn to avoid type mismatch with older @types/jsonwebtoken
  const opts: jwt.SignOptions = {
    expiresIn: JWT_EXPIRES_STRING as unknown as jwt.SignOptions["expiresIn"],
  };

  const token = jwt.sign(payload as any, JWT_SECRET_BUFFER as jwt.Secret, opts);
  if (typeof token !== "string") {
    throw new Error("Failed to create JWT token");
  }
  return token;
}

/**
 * Express middleware: require a valid JWT, attach user to req.
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const header = String(req.headers.authorization || "");
  const m = header.match(/^Bearer (.+)$/i);
  if (!m) return res.status(401).json({ error: "Missing token" });

  const token = m[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET_BUFFER as jwt.Secret) as any;
    if (!payload?.id) return res.status(401).json({ error: "Invalid token" });

    const user = await User.findById(payload.id).select("-passwordHash").lean();
    if (!user) return res.status(401).json({ error: "User not found" });

    req.user = user;
    next();
  } catch (err: any) {
    console.error(
      "requireAuth: token verification failed:",
      err?.message ?? err
    );
    return res.status(401).json({ error: "Invalid token" });
  }
}

/**
 * Role guard middleware factory.
 */
export function requireRole(...allowed: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    if (!allowed.includes(req.user.role))
      return res.status(403).json({ error: "Forbidden - insufficient role" });
    next();
  };
}
