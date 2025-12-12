// server/src/index.ts
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import { MONGO_URI, PORT } from "./config.js";

// routers
import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";
import rawRouter from "./routes/raw.js";
import scrapeRouter from "./routes/scrape.js";
import ingestRouter from "./routes/ingest.js";
import adminSystemRouter from "./routes/adminSystem.js";
import notesRouter from "./routes/notes.js";
import kanbanRouter from "./routes/kanban.js";
import calendarRouter from "./routes/calendar.js";
import filesRouter from "./routes/files.js";
import dashboardRouter from "./routes/dashboard.js";

async function main() {
  if (!MONGO_URI) {
    console.error("MONGO_URI not set; set in .env");
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI, {});
  const app = express();

  app.use(morgan("dev"));
  app.use(cors());
  app.use(express.json({ limit: "20mb" }));

  // auth + user management
  app.use("/api/auth", authRouter);
  app.use("/api/users", usersRouter);

  // also expose admin-friendly path for user management so frontend can call /api/admin/users
  // usersRouter already enforces requireRole("admin") on endpoints, so security is preserved.
  app.use("/api/admin/users", usersRouter);

  // core features
  app.use("/api/raw", rawRouter);
  app.use("/api/scrape", scrapeRouter);
  app.use("/api/ingest", ingestRouter);
  app.use("/api/notes", notesRouter);
  app.use("/api/kanban", kanbanRouter);

  // calendar router: support both /api/calendar and legacy /api/events
  app.use("/api/calendar", calendarRouter);
  app.use("/api/events", calendarRouter);

  app.use("/api/files", filesRouter);

  // admin endpoints (system) mounted at /api/admin/system
  app.use("/api/admin/system", adminSystemRouter);

  // expose admin-friendly dashboard path -> /api/admin/dashboard
  // dashboardRouter uses requireAuth and returns role-specific widgets; we mount it under both
  // /api/dashboard (existing) and /api/admin/dashboard so frontend admin calls succeed.
  app.use("/api/dashboard", dashboardRouter);
  app.use("/api/admin/dashboard", dashboardRouter);

  app.get("/", (_req, res) => res.json({ ok: true }));

  const port = Number(process.env.PORT || PORT || 4000);
  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

main().catch((err) => {
  console.error("Server failed:", err);
  process.exit(1);
});
