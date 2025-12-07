import React from "react";
import useTheme from "../hooks/useTheme";

export default function ThemeToggle() {
  const { theme, setLight, setDark, setSystem, toggle } = useTheme();

  return (
    <div className="flex items-center gap-3">
      {/* Segmented control */}
      <div className="inline-flex rounded-md bg-white/60 dark:bg-slate-800/60 p-0.5 border border-slate-200 dark:border-slate-700">
        <button
          onClick={setLight}
          className={`px-3 py-1 text-sm rounded-md transition ${
            theme === "light"
              ? "bg-white dark:bg-transparent text-slate-900 shadow-sm"
              : "text-slate-700 dark:text-slate-300"
          }`}
          aria-pressed={theme === "light"}
          title="Light theme"
        >
          Light
        </button>

        <button
          onClick={setDark}
          className={`px-3 py-1 text-sm rounded-md transition ${
            theme === "dark"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-700 dark:text-slate-300"
          }`}
          aria-pressed={theme === "dark"}
          title="Dark theme"
        >
          Dark
        </button>

        <button
          onClick={setSystem}
          className={`px-3 py-1 text-sm rounded-md transition ${
            theme === "system"
              ? "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
              : "text-slate-700 dark:text-slate-300"
          }`}
          aria-pressed={theme === "system"}
          title="Follow system"
        >
          System
        </button>
      </div>

      {/* Small toggle button — also keep the old quick toggle */}
      <button
        onClick={toggle}
        title="Toggle theme"
        className="ml-2 p-1 rounded-md text-sm bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? "🌙" : theme === "light" ? "☀️" : "🖥️"}
      </button>
    </div>
  );
}
