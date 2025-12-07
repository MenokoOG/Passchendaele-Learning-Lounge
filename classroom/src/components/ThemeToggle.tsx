// src/components/ThemeToggle.tsx
import React from "react";
import useTheme from "../hooks/useTheme";

export default function ThemeToggle() {
  const { theme, setLight, setDark, setSystem, toggle } = useTheme();

  return (
    <div className="flex items-center gap-3">
      {/* Segmented control (theme-aware surface + border) */}
      <div className="inline-flex rounded-md p-0.5 border border-surface-border bg-classroom-surface-2">
        <button
          onClick={setLight}
          className={`px-3 py-1 text-sm rounded-md transition-flex ${
            theme === "light"
              ? "bg-classroom text-white shadow-sm"
              : "btn-surface text-classroom-muted"
          }`}
          aria-pressed={theme === "light"}
          title="Light theme"
        >
          Light
        </button>

        <button
          onClick={setDark}
          className={`px-3 py-1 text-sm rounded-md transition-flex ${
            theme === "dark"
              ? "bg-classroom text-white shadow-sm"
              : "btn-surface text-classroom-muted"
          }`}
          aria-pressed={theme === "dark"}
          title="Dark theme"
        >
          Dark
        </button>

        <button
          onClick={setSystem}
          className={`px-3 py-1 text-sm rounded-md transition-flex ${
            theme === "system"
              ? "ring-1 ring-surface-border bg-classroom-surface-2 text-classroom shadow-sm"
              : "btn-surface text-classroom-muted"
          }`}
          aria-pressed={theme === "system"}
          title="Follow system"
        >
          System
        </button>
      </div>

      {/* Small quick toggle button (keeps a compact, theme-aware look) */}
      <button
        onClick={toggle}
        title="Toggle theme"
        className="ml-2 p-1 rounded-md text-sm btn-surface border border-surface-border"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? "🌙" : theme === "light" ? "☀️" : "🖥️"}
      </button>
    </div>
  );
}
