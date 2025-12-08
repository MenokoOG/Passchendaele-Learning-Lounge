// server/src/routes/dashboard.ts
import express from "express";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", requireAuth, (req, res) => {
  const role = req.user.role;
  if (role === "admin") {
    return res.json({
      role,
      widgets: [
        { name: "User management", link: "/admin/users" },
        { name: "Ingest stats", link: "/admin/ingest" },
        { name: "System status", ok: true },
      ],
    });
  }
  if (role === "instructor") {
    return res.json({
      role,
      widgets: [
        { name: "My courses", link: "/instructor/courses" },
        { name: "Student progress", link: "/instructor/progress" },
        { name: "Create lesson", link: "/ingest" },
      ],
    });
  }
  return res.json({
    role,
    widgets: [
      { name: "My lessons", link: "/" },
      { name: "My notes", link: "/notes" },
      { name: "Kanban / practice sprints", link: "/kanban" },
    ],
  });
});

export default router;
