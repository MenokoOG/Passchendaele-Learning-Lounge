// server/scripts/seedAdmin.js
// Usage: from project root: node server/scripts/seedAdmin.js
// (Ensure NODE_ENV env + .env are available; script reads process.env.MONGO_URI and process.env.JWT_SECRET)

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_USERNAME = process.env.SEED_ADMIN_USERNAME || "admin";
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@example.test";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Admin123!"; // change immediately

if (!MONGO_URI) {
  console.error("MONGO_URI not set in environment. Aborting.");
  process.exit(1);
}
if (!JWT_SECRET || JWT_SECRET.length < 8) {
  console.error("JWT_SECRET missing/short. Aborting. Set JWT_SECRET in .env");
  process.exit(1);
}

async function main() {
  console.log("Connecting to", MONGO_URI);
  await mongoose.connect(MONGO_URI, {});

  const userSchema = new mongoose.Schema(
    {
      username: { type: String, required: true, unique: true },
      email: { type: String, required: true, unique: true, lowercase: true },
      passwordHash: { type: String, required: true },
      role: {
        type: String,
        enum: ["admin", "instructor", "student"],
        default: "student",
      },
      preferences: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    { timestamps: true }
  );
  const User = mongoose.models.User || mongoose.model("User", userSchema);

  const existing = await User.findOne({
    $or: [{ username: ADMIN_USERNAME }, { email: ADMIN_EMAIL }],
  }).lean();

  const hash = await bcrypt.hash(String(ADMIN_PASSWORD), 10);

  let user;
  if (existing) {
    console.log("Updating existing user:", existing.username || existing.email);
    user = await User.findByIdAndUpdate(
      existing._id,
      {
        username: ADMIN_USERNAME,
        email: ADMIN_EMAIL.toLowerCase(),
        passwordHash: hash,
        role: "admin",
      },
      { new: true }
    );
  } else {
    console.log("Creating admin user:", ADMIN_USERNAME);
    user = await User.create({
      username: ADMIN_USERNAME,
      email: ADMIN_EMAIL.toLowerCase(),
      passwordHash: hash,
      role: "admin",
    });
  }

  // Create token payload (match your server payload shape)
  const payload = { id: String(user._id), role: "admin", u: user.username };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });

  console.log("=== SEED COMPLETE ===");
  console.log("Admin credentials:");
  console.log("  username:", ADMIN_USERNAME);
  console.log("  email:", ADMIN_EMAIL);
  console.log("  password:", ADMIN_PASSWORD);
  console.log("");
  console.log(
    "Paste this token into browser localStorage (localStorage.setItem('token', '<token>')):"
  );
  console.log(token);
  console.log("");
  console.log("Quick curl test (replace <TOKEN> with the printed token):");
  console.log(
    `curl -H "Authorization: Bearer ${token}" ${
      process.env.VITE_API_URL || "http://localhost:4000"
    }/api/auth/me`
  );
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(2);
});
