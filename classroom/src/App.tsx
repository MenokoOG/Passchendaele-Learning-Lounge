// src/App.tsx
import React from "react";
import { Link, Routes, Route } from "react-router-dom";
import Lessons from "./pages/Lessons";
import ThemeToggle from "./components/ThemeToggle";
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

function Header() {
  const { user, logout } = useAuth();

  // route dashboard link according to role so "Dashboard" always goes where it should
  const dashboardPath = React.useMemo(() => {
    const role = user?.role ?? "";
    if (role === "admin") return "/dashboard/admin";
    if (role === "instructor") return "/dashboard/instructor";
    if (role === "student") return "/dashboard/student";
    return "/dashboard";
  }, [user]);

  return (
    <header className="max-w-6xl mx-auto p-6 flex items-center justify-between">
      <div>
        <Link to="/" className="flex items-start gap-3">
          <div
            className="w-8 h-8 rounded flex items-center justify-center bg-classroom"
            aria-hidden
          >
            <span className="text-white font-bold text-sm">M</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold">M3n0koOg Learning Lounge</h1>
            <div className="text-sm text-slate-600 dark:text-slate-300">
              Instructor: Senior Software Engineer M3n0koOg
            </div>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <nav className="hidden sm:flex gap-3">
          <Link
            to="/"
            className="text-sm text-classroom-muted hover:text-classroom"
          >
            Home
          </Link>
          <Link
            to="/lessons"
            className="text-sm text-classroom-muted hover:text-classroom"
          >
            Lessons
          </Link>
          <Link
            to="/videos"
            className="text-sm text-classroom-muted hover:text-classroom"
          >
            Videos
          </Link>
          <Link
            to={dashboardPath}
            className="text-sm text-classroom-muted hover:text-classroom"
          >
            Dashboard
          </Link>
        </nav>

        {user ? (
          <div className="text-sm text-classroom-muted flex items-center gap-3">
            <div>
              {user.username} ({user.role})
            </div>
            <button onClick={() => logout()} className="btn-surface">
              Sign out
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn-surface">
            Sign in
          </Link>
        )}

        <ThemeToggle />
      </div>
    </header>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="w-full branding-strip">
        <div className="max-w-6xl mx-auto px-6 py-2 flex items-center gap-3">
          <div
            className="w-8 h-8 rounded flex items-center justify-center bg-classroom"
            aria-hidden
          >
            <span className="text-white font-bold text-sm">M</span>
          </div>

          <div className="text-xs text-slate-700 dark:text-slate-200">
            <strong className="block">M3n0koOg Learning Lounge</strong>
            <span className="opacity-80">Comfortable learning, quick code</span>
          </div>
          <div className="ml-auto text-xs text-slate-600 dark:text-slate-300">
            <em>Instructor: Senior Software Engineer M3n0koOg</em>
          </div>
        </div>
      </div>

      <Header />

      <main className="max-w-6xl mx-auto p-6">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/lesson/:id" element={<LessonPage />} />

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

          {/* Dashboard top-level route. Protected: require auth */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardStudent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardAdmin />
              </ProtectedRoute>
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

          {/* Dashboard sub-pages (also available via top-level aliases) */}
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
        </Routes>
      </main>

      <footer className="max-w-6xl mx-auto p-6 text-sm text-center text-slate-600 dark:text-slate-300">
        Built for internal training — use responsibly.
      </footer>
    </div>
  );
}
