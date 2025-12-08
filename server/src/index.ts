// server/src/index.ts
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import cors from "cors";
import { MONGO_URI, PORT } from "./config.js";
import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";
import rawRouter from "./routes/raw.js"; // keep your existing raw routes if present
import scrapeRouter from "./routes/scrape.js"; // keep existing
import ingestRouter from "./routes/ingest.js"; // keep existing

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

  // keep existing scrapers/raw endpoints
  app.use("/api/scrape", scrapeRouter);
  app.use("/api/raw", rawRouter);
  app.use("/api/ingest", ingestRouter);

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
