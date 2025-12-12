// server/src/scripts/seed_users.ts
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI ?? "";
if (!MONGO_URI) {
  console.error("Please set MONGO_URI in .env");
  process.exit(1);
}

const seed = [
  {
    username: "M3n0koOg",
    email: "lawrence+admin@example.com",
    password: "AdminPassword123!",
    role: "admin",
  },
  {
    username: "LuxGir1",
    email: "luxgir1@example.com",
    password: "Student1Pass!",
    role: "student",
  },
  {
    username: "BDB03",
    email: "bdb03@example.com",
    password: "Student2Pass!",
    role: "student",
  },
  {
    username: "TestInstructor",
    email: "instructor@example.com",
    password: "InstructorPass1!",
    role: "instructor",
  },
];

async function run() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI, {});

  for (const u of seed) {
    try {
      const existing = await User.findOne({ username: u.username });
      if (existing) {
        console.log(`${u.username} already exists (skipping)`);
        continue;
      }
      // ensure email uniqueness; if email exists, append suffix to avoid collision
      let email = u.email;
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        let i = 1;
        while (await User.findOne({ email: `${u.username}-${i}@example.com` }))
          i++;
        email = `${u.username}-${i}@example.com`;
        console.log(`email collision, using fallback ${email}`);
      }

      const passwordHash = await bcrypt.hash(u.password, 10);
      const created = await User.create({
        username: u.username,
        email: email.toLowerCase(),
        passwordHash,
        role: u.role,
      });

      console.log(
        `Created: ${u.username} (${u.role}) — email: ${created.email} — password: ${u.password}`
      );
    } catch (err) {
      console.error("Seed error for", u.username, err);
    }
  }

  console.log("Done seeding.");
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error("Seeding failed:", e);
  process.exit(1);
});
