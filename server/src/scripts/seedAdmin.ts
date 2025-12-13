// server/src/scripts/seed_admin.ts
/**
 * Seed script to create an admin user (works even if project doesn't export a User model).
 *
 * Usage:
 *   npx ts-node -r dotenv/config src/scripts/seed_admin.ts
 *
 * Will insert into the 'users' collection with fields:
 *  { email, name, passwordHash, roles: ['admin'], createdAt }
 *
 * NOTE: Adjust email/password below or pass via env:
 *   SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD
 */
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGO_URI = process.env.MONGO_URI ?? process.env.MONGODB_URI ?? "";
const email = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
const password = process.env.SEED_ADMIN_PASSWORD ?? "adminpass123";

async function main() {
  if (!MONGO_URI) {
    console.error("MONGO_URI not set.");
    process.exit(1);
  }
  await mongoose.connect(MONGO_URI, {});
  console.log("Connected to Mongo.");

  // use a flexible schema so we don't require the project's User model
  const UserModel = mongoose.models.User || mongoose.model("User", new mongoose.Schema({}, { strict: false }));

  const existing = await UserModel.findOne({ email }).lean();
  if (existing) {
    const id = Array.isArray(existing) ? existing[0]?._id : existing._id;
    console.log("Admin already exists:", id);
    process.exit(0);
  }

  const hash = await bcrypt.hash(password, 10);
  const u = await UserModel.create({
    email,
    name: "Admin",
    passwordHash: hash,
    roles: ["admin"],
    createdAt: new Date(),
  });

  console.log("Created admin user:", { email, id: u._id, password });
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});