// src/pages/Landing.tsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

const SectionTile: React.FC<{
  to: string;
  title: string;
  desc: string;
  icon?: React.ReactNode;
  badge?: string | null;
}> = ({ to, title, desc, icon, badge }) => {
  return (
    <Link
      to={to}
      className="block card-surface hover:shadow-lg transition-shadow p-4 rounded-lg h-full focus:outline-none a11y-focus"
      aria-label={`Open ${title}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-md flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-lg font-semibold">
          {icon ?? title[0]}
        </div>
        <div className="flex-1">
          <div className="flex items-start gap-2">
            <h3 className="text-lg font-semibold">{title}</h3>
            {badge && (
              <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-md ml-auto">
                {badge}
              </span>
            )}
          </div>
          <p className="text-sm text-classroom-muted mt-1">{desc}</p>
        </div>
      </div>
    </Link>
  );
};

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="rounded-lg p-8 bg-gradient-to-r from-white/60 to-slate-50/40 dark:from-slate-900/40 dark:to-slate-800/40 border border-surface-border">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <div>
            <div className="inline-flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded bg-classroom flex items-center justify-center text-white font-bold">
                M
              </div>
              <div>
                <div className="text-xs text-classroom-muted">Welcome to</div>
                <h1 className="text-3xl md:text-4xl font-bold">
                  M3n0koOg Learning Lounge
                </h1>
              </div>
            </div>

            <p className="text-classroom-muted max-w-xl">
              Structured lessons, helpful videos, personal notes, and instructor
              tools — all in one place. Jump into a lesson, take notes, or open
              the dashboard to manage courses and students.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/lessons"
                className="btn-classroom inline-flex items-center gap-2"
              >
                Browse lessons
              </Link>

              <Link
                to="/videos"
                className="btn-surface inline-flex items-center gap-2"
              >
                Watch videos
              </Link>

              <Link
                to="/dashboard"
                className="btn-surface inline-flex items-center gap-2"
              >
                Open dashboard
              </Link>
            </div>

            <div className="mt-6 text-sm text-classroom-muted">
              Tip: open <strong>Accessibility</strong> (top-right) to set font
              scale and theme for the reader.
            </div>
          </div>

          <div className="hidden md:block">
            <div className="rounded-lg border border-surface-border p-4 bg-white/60 dark:bg-slate-900/60">
              <h4 className="text-sm font-medium mb-3">Quick start</h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded bg-slate-50 dark:bg-slate-800">
                  <div className="text-xs text-classroom-muted">Lessons</div>
                  <div className="font-semibold mt-1">Start a course</div>
                </div>
                <div className="p-3 rounded bg-slate-50 dark:bg-slate-800">
                  <div className="text-xs text-classroom-muted">Notes</div>
                  <div className="font-semibold mt-1">Take notes</div>
                </div>
                <div className="p-3 rounded bg-slate-50 dark:bg-slate-800">
                  <div className="text-xs text-classroom-muted">Instructor</div>
                  <div className="font-semibold mt-1">Create lesson</div>
                </div>
                <div className="p-3 rounded bg-slate-50 dark:bg-slate-800">
                  <div className="text-xs text-classroom-muted">Kanban</div>
                  <div className="font-semibold mt-1">Sprint board</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tiles */}
      <section>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-semibold mb-4">Explore</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <SectionTile
              to="/lessons"
              title="Lessons"
              desc="Browse course lessons, read notes, and continue learning."
              icon="📚"
            />
            <SectionTile
              to="/videos"
              title="Videos"
              desc="Video walkthroughs and screencasts for key lessons."
              icon="🎥"
            />
            <SectionTile
              to="/notes"
              title="Notes"
              desc="Personal notes—quickly save and review study items."
              icon="📝"
            />
            <SectionTile
              to="/dashboard"
              title="Dashboard"
              desc="Student & instructor dashboards, role-aware."
              icon="📊"
            />
            <SectionTile
              to="/dashboard/kanban"
              title="Kanban / Sprints"
              desc="Practice sprints and tasks for instructors and students."
              icon="🗂️"
            />
            <SectionTile
              to="/dashboard/calendar"
              title="Calendar"
              desc="Events, office hours, and class schedules."
              icon="📆"
            />
            <SectionTile
              to="/dashboard/files"
              title="Files"
              desc="Course assets such as notebooks and attachments."
              icon="📁"
            />
            <SectionTile
              to="/videos"
              title="Transcripts & Reader"
              desc="Open a readable transcript for videos and lessons."
              icon="📖"
            />
            <SectionTile
              to="/dashboard/admin"
              title="Admin / System"
              desc="System status, backup tools, and user management."
              icon="🛠️"
              badge={user?.role === "admin" ? "Admin" : null}
            />
          </div>
        </div>
      </section>

      {/* Footer / small credits */}
      <section>
        <div className="max-w-6xl mx-auto text-sm text-classroom-muted">
          <div className="flex items-center justify-between gap-4">
            <div>
              <strong>M3n0koOg Learning Lounge</strong> — built for private
              training and classroom-style learning.
            </div>
            <div className="hidden sm:block">
              Instructor: Senior Software Engineer M3n0koOg
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
