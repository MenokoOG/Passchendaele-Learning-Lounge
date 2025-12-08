// src/pages/DashboardInstructor.tsx
import React from "react";
import { Link } from "react-router-dom";

export default function DashboardInstructor() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Instructor Dashboard</h2>
      <p className="text-classroom-muted">
        Create lessons, manage materials, and view student progress.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card-surface border border-surface-border p-4 rounded">
          <h3 className="font-semibold">Lessons</h3>
          <p className="text-sm text-classroom-muted">
            Create or edit lessons.
          </p>
          <Link to="/" className="btn-surface mt-3 inline-block">
            Lessons
          </Link>
        </div>

        <div className="card-surface border border-surface-border p-4 rounded">
          <h3 className="font-semibold">Kanban / Sprints</h3>
          <p className="text-sm text-classroom-muted">
            Manage classroom sprints and tasks.
          </p>
          <Link to="/kanban" className="btn-surface mt-3 inline-block">
            Kanban
          </Link>
        </div>
      </div>
    </div>
  );
}
