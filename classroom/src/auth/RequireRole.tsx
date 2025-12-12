// src/auth/RequireRole.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function RequireRole({
  role,
  children,
  fallbackPath = "/",
}: {
  role: string;
  children: React.ReactElement;
  fallbackPath?: string;
}) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // While auth is resolving, render nothing or a loader
  if (loading) return <div className="text-classroom-muted">Loading…</div>;

  if (!user) {
    // not authenticated — redirect to login and preserve original location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if ((user.role ?? "student") !== role) {
    // authenticated but wrong role — send to fallback (landing), or show unauthorized
    return (
      <div className="max-w-xl mx-auto p-6 card-surface border border-surface-border rounded">
        <h3 className="text-lg font-semibold mb-2">Access denied</h3>
        <p className="text-sm text-classroom-muted mb-4">
          You do not have permission to view this page.
        </p>
        <div className="flex gap-2">
          <a href={fallbackPath} className="btn-surface">
            Return
          </a>
        </div>
      </div>
    );
  }

  return children;
}
