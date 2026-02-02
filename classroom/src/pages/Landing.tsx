// src/pages/Landing.tsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

const SectionTile: React.FC<{
  to?: string;
  title: string;
  desc: string;
  icon?: React.ReactNode;
  badge?: string | null;
  disabled?: boolean;
}> = ({ to, title, desc, icon, badge, disabled }) => {
  const content = (
    <div
      className={`card-surface hover:shadow-lg transition-shadow p-4 rounded-lg h-full focus:outline-none a11y-focus ${
        disabled ? "opacity-60 pointer-events-none" : ""
      }`}
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
    </div>
  );

  return to && !disabled ? (
    <Link to={to} className="block">
      {content}
    </Link>
  ) : (
    <div>{content}</div>
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
                  M3n0ko0g Learning Lounge-MVP-Beta Test
                </h1>
              </div>
            </div>

            <p className="text-classroom-muted max-w-xl">
              Hi — I’m Lawrence (M3n0ko0g). This is a friendly space where I
              share free software and cybersecurity lessons. The Learning Lounge
              is built to be easy on the eyes, accessible, and practical: short
              lessons, simple examples, and tools you can run locally. RIght now
              we have Python lessons courtesy of Goolge and Geek for Geek.
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
              Our mission: make high-quality tech training available to people
              who are under-served, neurodivergent, or learning with vision
              impairments. Use <strong>Accessibility</strong> (top-right) to set
              reader preferences — font scale, spacing, color palette, and a
              simplified reader that explains lessons in plain language.
            </div>
          </div>

          <div className="hidden md:block">
            <div className="rounded-lg border border-surface-border p-4 bg-white/60 dark:bg-slate-900/60">
              <h4 className="text-sm font-medium mb-3">Quick start</h4>

              <div className="grid grid-cols-1 gap-3">
                <Link
                  to="/lessons"
                  className="p-3 rounded bg-slate-50 dark:bg-slate-800 a11y-focus"
                >
                  <div className="text-xs text-classroom-muted">Lessons</div>
                  <div className="font-semibold mt-1">
                    Jump into the latest course
                  </div>
                </Link>

                <Link
                  to="/notes"
                  className="p-3 rounded bg-slate-50 dark:bg-slate-800 a11y-focus"
                >
                  <div className="text-xs text-classroom-muted">Notes</div>
                  <div className="font-semibold mt-1">Open your notes</div>
                </Link>

                <Link
                  to="/dashboard/kanban"
                  className="p-3 rounded bg-slate-50 dark:bg-slate-800 a11y-focus"
                >
                  <div className="text-xs text-classroom-muted">Practice</div>
                  <div className="font-semibold mt-1">
                    Open practice sprints
                  </div>
                </Link>

                <Link
                  to="/accessibility"
                  className="p-3 rounded bg-slate-50 dark:bg-slate-800 a11y-focus"
                >
                  <div className="text-xs text-classroom-muted">
                    Accessibility
                  </div>
                  <div className="font-semibold mt-1">
                    Set reader preferences
                  </div>
                </Link>
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

            {/* Admin tile */}
            {user?.role === "admin" ? (
              <SectionTile
                to="/dashboard/admin/users"
                title="Admin / System"
                desc="System status, backup tools, and user management."
                icon="🛠️"
                badge="Admin"
              />
            ) : (
              <SectionTile
                title="Admin / System"
                desc="Admin tools are restricted. Request access from an instructor."
                icon="🔒"
                disabled={true}
              />
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <section>
        <div className="max-w-6xl mx-auto text-sm text-classroom-muted">
          <div className="flex items-center justify-between gap-4">
            <div>
              <strong>M3n0ko0g Learning Lounge</strong> — built for private
              training and classroom-style learning.
            </div>
            <div className="hidden sm:block">
              Endorsed Source of Truth Software: Crimson Obsidian Industries and
              Labs
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
