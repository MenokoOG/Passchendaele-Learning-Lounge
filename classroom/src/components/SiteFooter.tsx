// src/components/SiteFooter.tsx
import React from "react";
import { Link } from "react-router-dom";
import { IconGithub } from "./Icons";

const COLS: Array<{ title: string; links: Array<{ to: string; label: string }> }> = [
  {
    title: "Read",
    links: [
      { to: "/sources", label: "Source catalogue" },
      { to: "/lessons", label: "Lessons" },
      { to: "/videos", label: "Film & voices" },
    ],
  },
  {
    title: "Study",
    links: [
      { to: "/accessibility", label: "Reader preferences" },
      { to: "/notes", label: "Notes" },
      { to: "/kanban", label: "Research sprints" },
    ],
  },
  {
    title: "Lounge",
    links: [
      { to: "/privacy", label: "Privacy policy" },
      { to: "/terms", label: "Terms of use" },
      { to: "/login", label: "Sign in" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer
      className="mt-16 bg-[var(--black-bg)] text-white"
      style={{ borderTop: "var(--border-accent)" }}
    >
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-5">
          <div className="text-xl font-black" style={{ fontFamily: "var(--font-serif)" }}>
            Passchendaele Learning Lounge
          </div>
          <p className="mt-3 text-sm opacity-80 max-w-[40ch]">
            A free reading room for the Third Battle of Ypres, 1917. Sources
            are credited to, and linked from, the institutions that hold them.
          </p>
          <div className="mt-5 flex gap-3">
            <a
              href="https://github.com/MenokoOG"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="MenokoOG on GitHub"
              className="inline-flex items-center justify-center w-11 h-11 border border-white/40 cursor-pointer transition-colors hover:bg-white hover:text-[var(--black-bg)]"
              style={{ borderRadius: "var(--radius)" }}
            >
              <IconGithub />
            </a>
          </div>
        </div>

        <nav
          aria-label="Footer"
          className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8"
        >
          {COLS.map((c) => (
            <div key={c.title}>
              <div className="mono text-xs uppercase tracking-widest" style={{ color: "var(--ochre)" }}>
                {c.title}
              </div>
              <ul className="mt-3 space-y-2">
                {c.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-sm opacity-90 hover:opacity-100 cursor-pointer a11y-focus">
                      <span className="reveal-text">{l.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="border-t border-white/15">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap gap-2 justify-between text-xs opacity-80">
          <span>&copy; 2026 Passchendaele Learning Lounge. Source material &copy; its holders.</span>
          <span className="mono">Built by M3n0koOg</span>
        </div>
      </div>
    </footer>
  );
}
