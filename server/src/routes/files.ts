// server/src/routes/files.ts
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { FileMeta } from "../models/File.js";
import { requireAuth } from "../middleware/auth.js";
import { UPLOAD_DIR } from "../config.js";
import { requireUser, sendError, sendSuccess } from "../utils/helpers.js";

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
  const userId = requireUser(req, res);
  if (!userId) return;

  if (!req.file) return sendError(res, 400, "File required");

  const meta = new FileMeta({
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
    path: `/uploads/${req.file.filename}`,
    uploader: userId,
  });
  await meta.save();
  sendSuccess(res, { ok: true, file: meta });
});

router.get("/", requireAuth, async (req, res) => {
  const userId = requireUser(req, res);
  if (!userId) return;

  const files = await FileMeta.find({ uploader: userId }).sort({
    createdAt: -1,
  });
  sendSuccess(res, files);
});

export default router;
