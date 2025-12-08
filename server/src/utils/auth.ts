// server/src/utils/auth.ts
import jwt from "jsonwebtoken";

const JWT_SECRET_STRING = String(process.env.JWT_SECRET ?? "").trim();
if (!JWT_SECRET_STRING || JWT_SECRET_STRING.length < 16) {
  throw new Error(
    "Missing or too-short JWT_SECRET environment variable. Set JWT_SECRET (>=16 chars) and restart."
  );
}
const JWT_EXPIRES = String(process.env.JWT_EXPIRES ?? "7d"); // e.g. "7d", "1h"

export interface TokenPayload {
  id: string;
  role: "admin" | "instructor" | "student";
  u?: string;
}

export function createTokenForUser(user: {
  _id: any;
  username?: string;
  role: string;
}): string {
  const payload: TokenPayload = {
    id: String(user._id),
    role: user.role as TokenPayload["role"],
    u: user.username,
  };

  // cast expiresIn to any to satisfy types (avoids StringValue import issues)
  const token = jwt.sign(payload, JWT_SECRET_STRING as jwt.Secret, {
    expiresIn: JWT_EXPIRES as any,
  });
  if (typeof token !== "string") throw new Error("Failed to create JWT token");
  return token;
}

export function verifyToken<T extends TokenPayload = TokenPayload>(
  token: string
): T {
  const decoded = jwt.verify(token, JWT_SECRET_STRING as jwt.Secret) as unknown;
  return decoded as T;
}
