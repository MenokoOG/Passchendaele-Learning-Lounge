// server/src/scripts/seed_admin.ts
/**
 * Creates an admin user (one-off seed).
 *
 * Usage:
 *   npx ts-node src/scripts/seed_admin.ts --username=admin --email=admin@example.com --password=supersecret --adminSecret=optional_secret
 *
 * If ADMIN_SECRET is configured in .env, the script requires the same secret to run.
 */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { MONGO_URI, ADMIN_SECRET } from "../config.js";

function parseFlag(name: string) {
  const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
  return arg ? arg.replace(`--${name}=`, "") : null;
}

async function main() {
  const username = parseFlag("username") || "admin";
  const email = parseFlag("email") || "admin@example.com";
  const password = parseFlag("password") || "admin-password-CHANGE_ME!";
  const secretArg = parseFlag("adminSecret");

  if (ADMIN_SECRET && ADMIN_SECRET !== (secretArg ?? ADMIN_SECRET)) {
    console.error("ADMIN_SECRET is set in environment. Provide matching --adminSecret to run script.");
    process.exit(2);
  }

  if (!MONGO_URI) {
    console.error("MONGO_URI is not set. Set MONGO_URI in .env and retry.");
    process.exit(2);
  }

  await mongoose.connect(MONGO_URI, {});
  console.log("Connected to MongoDB.");

  // check for existing admin
  const existing = await User.findOne({ $or: [{ username }, { email: email.toLowerCase() }] }).lean();
  if (existing) {
    console.log("User already exists:", existing._id, existing.username, existing.email);
    await mongoose.disconnect();
    process.exit(0);
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(String(password), salt);

  const u = new User({
    username,
    email: String(email).toLowerCase(),
    passwordHash: hash,
    role: "admin",
    preferences: {},
  });

  await u.save();
  console.log("Created admin user:", { id: u._id.toString(), username: u.username, email: u.email });
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed to create admin:", err?.message ?? err);
  try { mongoose.disconnect(); } catch {}
  process.exit(1);
});