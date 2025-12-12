import React from "react";
import { Link } from "react-router-dom";

export default function DashboardAdmin() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Admin Dashboard</h2>
      <p className="text-classroom-muted">
        Administrative tools and user management.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-surface border border-surface-border p-4 rounded">
          <h3 className="font-semibold">Users</h3>
          <p className="text-sm text-classroom-muted">
            Manage users and roles.
          </p>
          <Link
            to="/dashboard/admin/users"
            className="btn-surface mt-3 inline-block"
          >
            Manage users
          </Link>
        </div>

        <div className="card-surface border border-surface-border p-4 rounded">
          <h3 className="font-semibold">Ingest / Dashboard</h3>
          <p className="text-sm text-classroom-muted">
            Inspect ingestion widgets, re-run jobs, and view ingest stats.
          </p>
          <Link
            to="/dashboard/admin/ingest"
            className="btn-surface mt-3 inline-block"
          >
            Ingest dashboard
          </Link>
        </div>

        <div className="card-surface border border-surface-border p-4 rounded">
          <h3 className="font-semibold">System</h3>
          <p className="text-sm text-classroom-muted">
            Logs, backups, and system actions.
          </p>
          <Link
            to="/dashboard/admin/system"
            className="btn-surface mt-3 inline-block"
          >
            System status
          </Link>
        </div>
      </div>

      {/* Instructor tools: admins should have everything instructor does */}
      <h3 className="text-xl font-semibold mt-6">
        Instructor tools (also available)
      </h3>
      <p className="text-sm text-classroom-muted">
        Admins have access to instructor features — quick links below.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
        <div className="card-surface border border-surface-border p-4 rounded">
          <h3 className="font-semibold">Lessons</h3>
          <p className="text-sm text-classroom-muted">
            Create or edit lessons.
          </p>
          <Link to="/lessons" className="btn-surface mt-3 inline-block">
            Lessons
          </Link>
        </div>

        <div className="card-surface border border-surface-border p-4 rounded">
          <h3 className="font-semibold">Kanban</h3>
          <p className="text-sm text-classroom-muted">
            Manage classroom sprints and tasks.
          </p>
          <Link to="/kanban" className="btn-surface mt-3 inline-block">
            Kanban
          </Link>
        </div>

        <div className="card-surface border border-surface-border p-4 rounded">
          <h3 className="font-semibold">Notes</h3>
          <p className="text-sm text-classroom-muted">
            Personal notes and student notes.
          </p>
          <Link to="/notes" className="btn-surface mt-3 inline-block">
            Notes
          </Link>
        </div>

        <div className="card-surface border border-surface-border p-4 rounded">
          <h3 className="font-semibold">Files</h3>
          <p className="text-sm text-classroom-muted">
            Uploaded resources and assets.
          </p>
          <Link to="/files" className="btn-surface mt-3 inline-block">
            Files
          </Link>
        </div>

        <div className="card-surface border border-surface-border p-4 rounded">
          <h3 className="font-semibold">Calendar</h3>
          <p className="text-sm text-classroom-muted">
            Schedule events and class sessions.
          </p>
          <Link to="/calendar" className="btn-surface mt-3 inline-block">
            Calendar
          </Link>
        </div>
      </div>
    </div>
  );
}
