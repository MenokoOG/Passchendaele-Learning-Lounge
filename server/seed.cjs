#!/usr/bin/env node
// server/seed.cjs
// Run: node server/seed.cjs
// This script requires a valid MONGO_URI environment variable (no fallback to localhost).

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGO_URI = (process.env.MONGO_URI || "").trim();

if (!MONGO_URI) {
  console.error(
    "ERROR: MONGO_URI not set. Set MONGO_URI in your environment or in a .env file and retry.\n" +
      'Example .env: MONGO_URI="mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/mydb?retryWrites=true&w=majority"'
  );
  process.exit(1);
}

function maskUri(uri) {
  try {
    return uri.replace(/\/\/(.*?):(.*?)@/, "//<user>:<password>@");
  } catch {
    return uri;
  }
}

async function connect() {
  console.log("Connecting to MongoDB:", maskUri(MONGO_URI));
  // use default options compatible with mongoose latest versions
  await mongoose.connect(MONGO_URI, {
    // serverSelectionTimeoutMS helps fail fast if Atlas is unreachable
    serverSelectionTimeoutMS: 10000,
  });
  console.log("Connected to MongoDB.");
}

/* --- Minimal inline schemas to avoid coupling to other project files --- */

// Users
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

// Notes
const NoteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, default: "Untitled" },
    content: { type: String, default: "" },
  },
  { timestamps: true }
);
const Note = mongoose.models.Note || mongoose.model("Note", NoteSchema);

// Kanban board
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

// Lessons
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

/* --- Seed logic --- */
async function seed() {
  try {
    await connect();

    const passwordPlain = "password"; // change this after initial run
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
        title: "Why Flanders, 1917: the road to Third Ypres",
        slug: "why-flanders-1917",
        summary: "Why the Allies attacked out of the Ypres salient in the summer of 1917.",
        contentHtml:
          "<article><h2>Why Flanders, 1917</h2><p>The British had held the Ypres salient since 1914, overlooked on three sides by German-held ridges. In 1917 the Allied plan was to break out of it, clear the ridge running from Passchendaele towards Gheluvelt, and open a way towards the Belgian coast and its German naval bases.</p><p>It was also a question of the coalition: after the failed French offensive of April 1917 and the army mutinies that followed, the British took the lead on the Western Front. The offensive was prepared by the capture of the Messines Ridge on 7 June 1917.</p><h3>Questions to ask</h3><ul><li>Which aims were stated at the time, and which were added afterwards?</li><li>What did the ground look like before the bombardment began?</li></ul></article>",
        owner: instructor._id,
        published: true,
      },
      {
        title: "Timeline: 31 July - 10 November 1917",
        slug: "timeline-third-ypres",
        summary: "The phases of the offensive in order, from Pilckem Ridge to the capture of Passchendaele village.",
        contentHtml:
          "<article><h2>Timeline of Third Ypres</h2><ol><li><strong>31 Jul - 2 Aug</strong> Battle of Pilckem Ridge</li><li><strong>16 - 18 Aug</strong> Battle of Langemarck</li><li><strong>20 - 25 Sep</strong> Battle of the Menin Road Ridge</li><li><strong>26 Sep - 3 Oct</strong> Battle of Polygon Wood</li><li><strong>4 Oct</strong> Battle of Broodseinde</li><li><strong>9 Oct</strong> Battle of Poelcappelle</li><li><strong>12 Oct</strong> First Battle of Passchendaele</li><li><strong>26 Oct - 10 Nov</strong> Second Battle of Passchendaele; the Canadian Corps takes the village on 6 November</li></ol><p>Battle names and boundaries were fixed by the Battles Nomenclature Committee after the war. Compare them with the dates your sources use.</p></article>",
        owner: instructor._id,
        published: true,
      },
      {
        title: "A coalition on one ridge",
        slug: "coalition-on-one-ridge",
        summary: "British, Canadian, Australian, New Zealand, South African, French and Belgian troops, and the German Fourth Army opposite them.",
        contentHtml:
          "<article><h2>Who fought</h2><p>Third Ypres was fought by a coalition. British divisions carried most of the offensive, with Australian and New Zealand divisions prominent in September and October, and the Canadian Corps taking over the final phase. French and Belgian forces held the northern flank. Opposite them stood the German Fourth Army.</p><p>Each nation keeps its own archive of the same days: unit war diaries, photographs and official histories. That is why the Sources page groups material by country.</p></article>",
        owner: instructor._id,
        published: true,
      },
      {
        title: "Reading the evidence: primary and secondary sources",
        slug: "reading-the-evidence",
        summary: "How to work with a war diary, a trench map, an aerial photograph and a veteran's testimony.",
        contentHtml:
          "<article><h2>Reading the evidence</h2><p>A <strong>unit war diary</strong> records what a battalion's staff thought worth writing down that day. A <strong>trench map</strong> shows what was known, not what was true. An <strong>aerial photograph</strong> shows ground, not intent. <strong>Testimony</strong> recorded decades later carries memory as well as fact.</p><h3>Three checks</h3><ol><li>Who made this, and when?</li><li>What could they not have known?</li><li>Which other source confirms or contradicts it?</li></ol></article>",
        owner: instructor._id,
        published: true,
      },
    ];

    for (const l of lessons) {
      await Lesson.findOneAndUpdate({ slug: l.slug }, l, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      });
    }
    console.log("Lessons seeded.");

    // Note for student
    await Note.findOneAndUpdate(
      { user: student._id, title: "Welcome note" },
      {
        user: student._id,
        title: "Welcome note",
        content: "This is your first note. Record questions about sources, dates and units here.",
      },
      { upsert: true, new: true }
    );
    console.log("Notes seeded.");

    // Kanban board owned by instructor
    const boardDoc = await Board.findOneAndUpdate(
      { title: "Research Sprint 1: Reading the Ridge" },
      {
        title: "Research Sprint 1: Reading the Ridge",
        owner: instructor._id,
        columns: [
          {
            name: "To do",
            tasks: [
              {
                title: "Compare casualty estimates from three institutions",
                description: "Note where the figures differ and why; cite each source",
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
    process.exitCode = 1;
  } finally {
    try {
      await mongoose.disconnect();
    } catch (e) {
      // ignore
    }
    process.exit(process.exitCode === 1 ? 1 : 0);
  }
}

seed();
