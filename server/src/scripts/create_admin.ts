// server/src/scripts/create_admin.ts
/**
 * create_admin.ts
 *
 * Usage:
 *   # using defaults (ensure MONGO_URI and JWT_SECRET present)
 *   npx ts-node ./src/scripts/create_admin.ts
 *
 * Flags:
 *   --username=admin
 *   --email=admin@example.com
 *   --password=SuperSecret123
 *   --adminSecret=THE_ADMIN_SECRET   (optional; for safety you can require ADMIN_SECRET to match)
 *
 * Notes:
 * - If no password provided, a weak default is used — change it after creation.
 * - The script will print the created user's id and basic info.
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { MONGO_URI, ADMIN_SECRET } from "../config.js";

function flag(name: string) {
  const a = process.argv.find((p) => p.startsWith(`--${name}=`));
  return a ? a.replace(`--${name}=`, "") : null;
}

async function main() {
  if (!MONGO_URI) {
    console.error("MONGO_URI not set; set in .env and retry.");
    process.exit(2);
  }

  // Optional admin-secret safety check (if provided)
  const providedSecret = flag("adminSecret") || process.env.ADMIN_SECRET;
  if (typeof ADMIN_SECRET === "string" && ADMIN_SECRET.length && providedSecret && providedSecret !== ADMIN_SECRET) {
    console.error("Provided adminSecret does not match server ADMIN_SECRET. Aborting for safety.");
    process.exit(3);
  }

  const username = flag("username") || process.env.ADMIN_USERNAME || "admin";
  const email = flag("email") || process.env.ADMIN_EMAIL || "admin@example.com";
  const password = flag("password") || process.env.ADMIN_PASSWORD || "password123";

  if (password.length < 8) {
    console.warn("WARNING: Provided password is short. Consider using a stronger password.");
  }

  await mongoose.connect(MONGO_URI, {});
  console.log("Connected to MongoDB.");

  // check existing by email or username
  const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
  if (existing) {
    console.log("Admin user already exists:");
    console.log({ id: existing._id.toString(), username: existing.username, email: existing.email, role: existing.role });
    await mongoose.disconnect();
    process.exit(0);
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(String(password), salt);

  const u = new User({
    username,
    email: String(email).toLowerCase(),
    passwordHash,
    role: "admin",
    preferences: {},
  });

  await u.save();

  console.log("Created admin user:");
  console.log({ id: u._id.toString(), username: u.username, email: u.email });

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("create_admin error:", err?.message ?? err);
  try { mongoose.disconnect(); } catch {}
  process.exit(1);
});