// server/src/utils/auth.ts
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { JWT_EXPIRES, JWT_SECRET } from "../config.js";

/**
 * Ensure we read the same secret string everywhere and keep typing strict.
 */
const SECRET = String(JWT_SECRET ?? "").trim();
if (!SECRET || SECRET.length < 16) {
  throw new Error(
    "Missing or too-short JWT_SECRET environment variable. Set JWT_SECRET (>=16 chars) and restart."
  );
}

/**
 * JWT_EXPIRES may be string like "7d" or a number (seconds). Keep it typed as string | number.
 */
export const EXPIRES_IN: string | number = (() => {
  const v = process.env.JWT_EXPIRES ?? JWT_EXPIRES ?? "7d";
  // if numeric string -> number, otherwise string e.g. "7d"
  if (/^\d+$/.test(String(v))) return Number(v);
  return String(v);
})();

export interface TokenPayload {
  id: string;
  role: "admin" | "instructor" | "student" | string;
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

  const token = jwt.sign(payload, SECRET as jwt.Secret, {
    expiresIn: EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
  if (typeof token !== "string") throw new Error("Failed to create JWT token");
  return token;
}

export function verifyToken<T extends TokenPayload = TokenPayload>(
  token: string
): T {
  const decoded = jwt.verify(token, SECRET as jwt.Secret) as unknown;
  return decoded as T;
}

/**
 * Hash a password using bcrypt with salt rounds of 10
 * @param password - Plain text password to hash
 * @returns Promise resolving to hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(String(password), salt);
}

/**
 * Compare a plain text password with a hashed password
 * @param password - Plain text password
 * @param hash - Hashed password to compare against
 * @returns Promise resolving to true if passwords match
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(String(password), String(hash));
}
