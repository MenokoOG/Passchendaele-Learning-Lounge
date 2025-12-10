// src/pages/DashboardAdmin.tsx
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
    </div>
  );
}
