// src/App.tsx
import React from "react";
import { Link } from "react-router-dom";
import Lessons from "./pages/Lessons";
import ThemeToggle from "./components/ThemeToggle";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="w-full branding-strip">
        <div className="max-w-6xl mx-auto px-6 py-2 flex items-center gap-3">
          <div
            className="w-8 h-8 rounded flex items-center justify-center bg-classroom"
            aria-hidden
          >
            <span className="text-white font-bold text-sm">G</span>
          </div>

          <div className="text-xs text-slate-700 dark:text-slate-200">
            <strong className="block">Google Python — Classroom</strong>
            <span className="opacity-80">
              Comfortable learning, quick scrapes
            </span>
          </div>

          <nav className="ml-6 hidden sm:flex gap-3 items-center">
            <Link
              to="/"
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
          </nav>

          <div className="ml-auto text-xs text-slate-600 dark:text-slate-300">
            <em>Instructor: Senior Software Engineer M3n0koOg</em>
          </div>
        </div>
      </div>

      <header className="max-w-6xl mx-auto p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Google Python — Classroom</h1>
          <div className="text-sm text-slate-600 dark:text-slate-300">
            Instructor: M3n0koOg
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-sm text-slate-600 dark:text-slate-300">
            Scraper Client
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <Lessons />
      </main>

      <footer className="max-w-6xl mx-auto p-6 text-sm text-center text-slate-600 dark:text-slate-300">
        Built for internal training — use responsibly.
      </footer>
    </div>
  );
}
