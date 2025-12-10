// server/src/routes/adminSystem.ts
import express from "express";
import mongoose from "mongoose";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

/**
 * GET /api/admin/system/status
 * Returns basic status: uptime, mongo readyState, serverTime
 */
router.get("/status", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const uptime = process.uptime();
    const mongoState = mongoose.connection.readyState; // 0 disconnected, 1 connected
    return res.json({
      ok: true,
      serverTime: new Date().toISOString(),
      uptime,
      mongoState,
    });
  } catch (err) {
    console.error("adminSystem.status error:", err);
    return res.status(500).json({ error: "Failed to get status" });
  }
});

/**
 * POST /api/admin/system/backup
 * Simulated backup endpoint (returns placeholder). Admin-only.
 */
router.post("/backup", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    // in a real system you'd trigger DB dump / S3 upload / etc.
    // Here we just return a placeholder response for the UI to display
    const simulatedBackup = {
      startedAt: new Date().toISOString(),
      id: `backup-${Date.now()}`,
      status: "completed",
      files: [
        { name: "users.json", sizeBytes: 1024 * 23 },
        { name: "notes.json", sizeBytes: 1024 * 78 },
        { name: "boards.json", sizeBytes: 1024 * 48 },
      ],
    };

    // pretend some processing...
    return res.json({ ok: true, backup: simulatedBackup });
  } catch (err) {
    console.error("adminSystem.backup error:", err);
    return res.status(500).json({ error: "Backup failed" });
  }
});

export default router;
