// server/src/routes/files.ts
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { FileMeta } from "../models/File.js";
import { requireAuth } from "../middleware/auth.js";
import { UPLOAD_DIR } from "../config.js";

const router = express.Router();

const uploadDir = path.resolve(process.cwd(), UPLOAD_DIR);
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const prefix = Date.now().toString(36);
    cb(null, `${prefix}-${file.originalname.replace(/\s+/g, "-")}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

router.post("/upload", requireAuth, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "File required" });
  const meta = new FileMeta({
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
    path: `/uploads/${req.file.filename}`,
    uploader: req.user.id,
  });
  await meta.save();
  res.json({ ok: true, file: meta });
});

router.get("/", requireAuth, async (req, res) => {
  const files = await FileMeta.find({ uploader: req.user.id }).sort({
    createdAt: -1,
  });
  res.json(files);
});

export default router;
