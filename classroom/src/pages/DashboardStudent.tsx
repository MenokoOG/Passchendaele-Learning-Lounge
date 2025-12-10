// src/pages/DashboardStudent.tsx
import React from "react";
import { Link } from "react-router-dom";
import NotesWidget from "../components/NotesWidget";

export default function DashboardStudent() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Student Dashboard</h2>
      <p className="text-classroom-muted">
        Your lessons, notes and learning tasks.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card-surface border border-surface-border p-4 rounded">
          <h3 className="font-semibold">Lessons</h3>
          <p className="text-sm text-classroom-muted">Continue your course.</p>
          <Link to="/" className="btn-surface mt-3 inline-block">
            Browse lessons
          </Link>
        </div>

        <div className="card-surface border border-surface-border p-4 rounded">
          <h3 className="font-semibold">Notes</h3>
          <p className="text-sm text-classroom-muted">
            Personal notes & study plan.
          </p>
          <Link to="/notes" className="btn-surface mt-3 inline-block">
            Notes
          </Link>
        </div>
      </div>

      <div className="mt-4">
        <NotesWidget />
      </div>
    </div>
  );
}
