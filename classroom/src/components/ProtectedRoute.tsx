// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactElement;
  allowedRoles?: string[]; // if undefined => any authenticated user allowed
}) {
  const { user, loading } = useAuth();
  const loc = useLocation();

  // still resolving initial auth (e.g., /auth/me) — show nothing (or a spinner)
  if (loading) return <div />;

  if (!user) {
    // not logged in -> redirect to login, preserve intended route
    return <Navigate to="/login" state={{ from: loc }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // unauthorized for this route — send to top-level dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
