// src/App.tsx
import React from "react";
import Lessons from "./pages/Lessons";
import ThemeToggle from "./components/ThemeToggle";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 text-slate-900 dark:text-slate-100 transition-colors">
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
