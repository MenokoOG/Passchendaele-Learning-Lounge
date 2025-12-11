// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: string[]; // if undefined => any authenticated user allowed
}) {
  const { user, loading } = useAuth();
  const loc = useLocation();

  if (loading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="p-4 text-sm text-classroom-muted"
      >
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: loc }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(String(user.role))) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
