// src/App.tsx
import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Lessons from "./pages/Lessons";
import Header from "./components/Header";
import SiteFooter from "./components/SiteFooter";
import SourcesPage from "./pages/Sources";
import { PrivacyPage, TermsPage } from "./pages/Legal";
import { useAuth } from "./auth/AuthProvider";
import LoginPage from "./pages/Login";
import LessonPage from "./pages/Lesson";
import Videos from "./pages/Videos";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardAdmin from "./pages/DashboardAdmin";
import DashboardInstructor from "./pages/DashboardInstructor";
import DashboardStudent from "./pages/DashboardStudent";
import NotesPage from "./pages/Notes";
import CalendarPage from "./pages/Calendar";
import FilesPage from "./pages/Files";
import KanbanPage from "./pages/Kanban";
import Landing from "./pages/Landing";
import RegisterPage from "./pages/Register";
import AccessibilityPage from "./pages/Accessibility"; // NEW

// admin pages (explicit)
import AdminIngestPage from "./pages/admin/Ingest";
import AdminSystemPage from "./pages/admin/SystemStatus";
import AdminUsersPage from "./pages/admin/Users";

// new role guard (from the changes we made)
import RequireRole from "./auth/RequireRole";

/**
 * DashboardRedirect
 * Redirects authenticated users to the dashboard path appropriate to their role.
 * If no user, sends to /login.
 */
function DashboardRedirect() {
  const { user, loading } = useAuth();

  // while auth resolving, render a small loader text so route stays stable
  if (loading) return <div className="text-classroom-muted">Loading…</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = (user.role ?? "student").toString();

  if (role === "admin") return <Navigate to="/dashboard/admin" replace />;
  if (role === "instructor")
    return <Navigate to="/dashboard/instructor" replace />;
  // default to student dashboard
  return <Navigate to="/dashboard/student" replace />;
}

export default function App() {
  const location = useLocation();
  return (
    <div className="min-h-[100dvh] bg-[var(--bg)] text-[var(--text-default)] transition-colors">
      {/* abstract page-turn: re-mounts per route so the leaf sweeps away */}
      <div key={location.pathname} className="page-turn-effect" aria-hidden />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 btn-classroom"
        style={{ zIndex: 300 }}
      >
        Skip to content
      </a>

      <Header />

      <main id="main" className="max-w-6xl mx-auto px-6 py-8">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/sources" element={<SourcesPage />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/lesson/:id" element={<LessonPage />} />

          {/* Accessibility route */}
          <Route path="/accessibility" element={<AccessibilityPage />} />

          {/* top-level aliases for convenience (tiles/links) */}
          <Route
            path="/notes"
            element={
              <ProtectedRoute>
                <NotesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <CalendarPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/files"
            element={
              <ProtectedRoute>
                <FilesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/kanban"
            element={
              <ProtectedRoute>
                <KanbanPage />
              </ProtectedRoute>
            }
          />

          {/* Dashboard top-level route: redirect users to role-specific dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            }
          />

          {/* Role-specific dashboards */}
          <Route
            path="/dashboard/admin"
            element={
              <RequireRole role="admin">
                <DashboardAdmin />
              </RequireRole>
            }
          />
          <Route
            path="/dashboard/instructor"
            element={
              <ProtectedRoute allowedRoles={["instructor", "admin"]}>
                <DashboardInstructor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/student"
            element={
              <ProtectedRoute allowedRoles={["student", "instructor", "admin"]}>
                <DashboardStudent />
              </ProtectedRoute>
            }
          />

          {/* Dashboard sub-pages (aliases) */}
          <Route
            path="/dashboard/notes"
            element={
              <ProtectedRoute>
                <NotesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/calendar"
            element={
              <ProtectedRoute>
                <CalendarPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/files"
            element={
              <ProtectedRoute>
                <FilesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/kanban"
            element={
              <ProtectedRoute>
                <KanbanPage />
              </ProtectedRoute>
            }
          />

          {/* admin sub-pages protected explicitly with RequireRole */}
          <Route
            path="/dashboard/admin/system"
            element={
              <RequireRole role="admin">
                <AdminSystemPage />
              </RequireRole>
            }
          />
          <Route
            path="/dashboard/admin/users"
            element={
              <RequireRole role="admin">
                <AdminUsersPage />
              </RequireRole>
            }
          />
          <Route
            path="/dashboard/admin/ingest"
            element={
              <RequireRole role="admin">
                <AdminIngestPage />
              </RequireRole>
            }
          />

          {/* fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <SiteFooter />
    </div>
  );
}
