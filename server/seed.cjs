#!/usr/bin/env node
// server/seed.cjs
// Run: node seed.cjs
const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGO =
  process.env.MONGO_URI || "mongodb://localhost:27017/m3classroom_seed";

async function connect() {
  await mongoose.connect(MONGO, {});
  console.log("Connected to", MONGO);
}

/* --- Minimal inline schemas to avoid coupling to other project files --- */

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, index: true, unique: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
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
const User = mongoose.models.User || mongoose.model("User", UserSchema);

const NoteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, default: "Untitled" },
    content: { type: String, default: "" },
  },
  { timestamps: true }
);
const Note = mongoose.models.Note || mongoose.model("Note", NoteSchema);

const TaskSchema = new mongoose.Schema({
  title: String,
  description: String,
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  createdAt: { type: Date, default: () => new Date() },
  dueDate: Date,
});
const ColumnSchema = new mongoose.Schema({ name: String, tasks: [TaskSchema] });
const BoardSchema = new mongoose.Schema({
  title: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  columns: [ColumnSchema],
  createdAt: { type: Date, default: () => new Date() },
});
const Board = mongoose.models.Board || mongoose.model("Board", BoardSchema);

const LessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, index: true, unique: true, sparse: true },
    summary: String,
    contentHtml: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const Lesson = mongoose.models.Lesson || mongoose.model("Lesson", LessonSchema);

async function seed() {
  try {
    await connect();

    const passwordPlain = "password";
    const passwordHash = await bcrypt.hash(passwordPlain, 10);

    // Upsert admin / instructor / student
    const admin = await User.findOneAndUpdate(
      { username: "admin" },
      {
        username: "admin",
        email: "admin@example.com",
        passwordHash,
        role: "admin",
        preferences: { theme: "dark", fontSize: 16 },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const instructor = await User.findOneAndUpdate(
      { username: "instructor" },
      {
        username: "instructor",
        email: "instructor@example.com",
        passwordHash,
        role: "instructor",
        preferences: { theme: "light", fontSize: 16 },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const student = await User.findOneAndUpdate(
      { username: "student" },
      {
        username: "student",
        email: "student@example.com",
        passwordHash,
        role: "student",
        preferences: { theme: "light", fontSize: 18 },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log("Users seeded or present:", {
      admin: admin.username,
      instructor: instructor.username,
      student: student.username,
      password: passwordPlain,
    });

    // Lessons
    const lessons = [
      {
        title: "Intro to Python",
        slug: "intro-to-python",
        summary: "Python basics: variables, types, printing",
        contentHtml:
          "<article><h2>Intro to Python</h2><p>Variables, types, and print()</p></article>",
        owner: instructor._id,
        published: true,
      },
      {
        title: "Control Flow",
        slug: "control-flow",
        summary: "If/else and loops",
        contentHtml:
          "<article><h2>Control Flow</h2><p>if, for, while with examples.</p></article>",
        owner: instructor._id,
        published: true,
      },
    ];

    for (const l of lessons) {
      await Lesson.findOneAndUpdate({ slug: l.slug }, l, {
        upsert: true,
        new: true,
      });
    }
    console.log("Lessons seeded.");

    // Note for student
    await Note.findOneAndUpdate(
      { user: student._id, title: "Welcome note" },
      {
        user: student._id,
        title: "Welcome note",
        content: "This is your first note — edit or delete it.",
      },
      { upsert: true, new: true }
    );
    console.log("Notes seeded.");

    // Kanban board owned by instructor
    const boardDoc = await Board.findOneAndUpdate(
      { title: "Course Sprint 1" },
      {
        title: "Course Sprint 1",
        owner: instructor._id,
        columns: [
          {
            name: "To do",
            tasks: [
              {
                title: "Write lesson: Intro to Python",
                description: "Draft content and examples",
                createdAt: new Date(),
              },
            ],
          },
          { name: "In progress", tasks: [] },
          { name: "Done", tasks: [] },
        ],
      },
      { upsert: true, new: true }
    );

    console.log("Board seeded:", boardDoc.title);

    console.log("Seeding complete. Disconnecting...");
  } catch (err) {
    console.error("Seed error:", err);
  } finally {
    try {
      await mongoose.disconnect();
    } catch (e) {}
    process.exit(0);
  }
}

seed();
