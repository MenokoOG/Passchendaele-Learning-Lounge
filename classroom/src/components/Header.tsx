// src/components/Header.tsx
import React, { JSX, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../auth/AuthProvider";
import { IconArrowRight, IconClose, IconMenu } from "./Icons";

const NAV_LINKS: Array<{ to: string; label: string; end?: boolean }> = [
  { to: "/", label: "Home", end: true },
  { to: "/sources", label: "Sources" },
  { to: "/lessons", label: "Lessons" },
  { to: "/videos", label: "Film & Voices" },
  { to: "/dashboard", label: "Dashboard" },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 text-sm whitespace-nowrap a11y-focus cursor-pointer transition-colors border-b-2 ${
    isActive
      ? "border-[var(--ochre)] font-bold text-[var(--text-default)]"
      : "border-transparent text-classroom-muted hover:text-[var(--text-default)] hover:border-[var(--dark-red)]"
  }`;

export default function Header(): JSX.Element {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (open) setTimeout(() => firstLinkRef.current?.focus(), 40);
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header
      className="w-full bg-[var(--surface-bg)] sticky top-0"
      style={{ zIndex: 100, borderBottom: "var(--border-accent)" }}
    >
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 a11y-focus cursor-pointer">
          <span
            aria-hidden
            className="relative w-11 h-11 shrink-0 flex items-center justify-center text-white font-black"
            style={{
              background: "var(--dark-red)",
              fontFamily: "var(--font-serif)",
              transform: "skewX(-2deg)",
              boxShadow: "4px 4px 0 var(--ochre)",
            }}
          >
            P
          </span>
          <span className="leading-tight">
            <span
              className="block text-base font-black whitespace-nowrap"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Passchendaele Learning Lounge
            </span>
            <span className="hidden 2xl:block text-xs mono text-classroom-muted whitespace-nowrap">
              Third Ypres &middot; 1917 &middot; primary sources
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden 2xl:flex items-center gap-2" aria-label="Main">
          <ul className="flex items-center">
            {NAV_LINKS.map((l) => (
              <li key={l.to}>
                <NavLink to={l.to} end={l.end} className={linkClass}>
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3 ml-3">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-2 text-sm text-classroom-muted">
                <span className="hidden lg:inline">{user.username}</span>
                <button
                  onClick={() => logout()}
                  className="btn-surface text-sm"
                  aria-label="Sign out"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-surface text-sm whitespace-nowrap">
                  Sign in
                </Link>
                <Link to="/sources" className="btn-classroom text-sm hidden 2xl:inline-flex whitespace-nowrap">
                  Open the sources
                  <IconArrowRight size={16} />
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Mobile actions */}
        <div className="flex items-center gap-2 2xl:hidden">
          <button
            onClick={() => setOpen((s) => !s)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="p-2 a11y-focus btn-surface cursor-pointer"
          >
            {open ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        hidden={!open}
        className="2xl:hidden border-t border-surface-border bg-[var(--surface-contrast)]"
      >
        <div className="p-4">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((l, idx) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  ref={idx === 0 ? firstLinkRef : undefined}
                  className="block w-full px-3 py-3 a11y-focus text-sm font-medium border-l-4 border-[var(--dark-red)] bg-[var(--surface-bg)] cursor-pointer"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-4 pt-4 border-t border-surface-border flex flex-col gap-3">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold">{user.username}</div>
                  <div className="text-xs mono text-classroom-muted">{user.role}</div>
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
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-surface flex-1 text-center">
                  Sign in
                </Link>
                <Link to="/register" className="btn-classroom flex-1 text-center">
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
