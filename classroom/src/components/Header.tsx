// src/components/Header.tsx
import React, { JSX, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../auth/AuthProvider";

const NAV_LINKS: Array<{ to: string; label: string }> = [
  { to: "/", label: "Home" },
  { to: "/lessons", label: "Lessons" },
  { to: "/videos", label: "Videos" },
  { to: "/dashboard", label: "Dashboard" },
];

export default function Header(): JSX.Element {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setTimeout(() => firstLinkRef.current?.focus(), 40);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="w-full border-b dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="max-w-6xl mx-auto p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3">
            <div
              aria-hidden
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0"
              style={{
                background:
                  "linear-gradient(135deg,var(--accent,#ff8c00),#7c3aed)",
              }}
            >
              ML
            </div>

            <div className="leading-tight">
              <span className="text-lg font-semibold block text-slate-900 dark:text-slate-100">
                M3n0ko0g Learning Lounge
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Practical, accessible learning for builders
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-4" aria-label="Main">
          <ul className="flex items-center gap-2">
            {NAV_LINKS.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="px-3 py-2 rounded a11y-focus text-sm text-classroom-muted hover:text-classroom"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3 ml-4">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-2 text-sm text-classroom-muted">
                <span className="hidden sm:inline">{user.username}</span>
                <button
                  onClick={() => logout()}
                  className="btn-surface text-sm"
                  aria-label="Sign out"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-surface text-sm">
                  Sign in
                </Link>
                {/* <-- Visible on desktop now */}
                <Link to="/register" className="btn-classroom text-sm">
                  Register
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile actions */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setOpen((s) => !s)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="p-2 rounded a11y-focus btn-surface border border-surface-border"
          >
            {open ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 18L18 6M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal={open}
        aria-hidden={!open}
        className={`md:hidden transition-max-h duration-200 ease-in-out overflow-hidden ${open ? "max-h-screen" : "max-h-0"}`}
      >
        <div className="p-4 border-t border-surface-border bg-surface-contrast dark:bg-surface-contrast">
          <ul className="flex flex-col gap-2">
            {NAV_LINKS.map((l, idx) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  ref={idx === 0 ? firstLinkRef : undefined}
                  className="block w-full text-left px-3 py-3 rounded a11y-focus text-sm text-classroom-muted hover:bg-surface-bg dark:hover:bg-surface-bg"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-4 border-t border-surface-border pt-4 flex flex-col gap-3">
            {user ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-800 dark:text-slate-100">
                      {user.username}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {user.role}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                    className="btn-surface"
                  >
                    Sign out
                  </button>
                </div>
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="btn-classroom mt-2 text-center"
                >
                  Open dashboard
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="btn-surface flex-1 text-center"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="btn-classroom flex-1 text-center"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
