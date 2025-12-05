// src/components/ThemeToggle.tsx
import React from "react";
import useTheme from "../hooks/useTheme";

export default function ThemeToggle() {
  const { theme, toggle, setLight, setDark, setSystem } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300">
        Theme:
        <select
          value={theme}
          onChange={(e) => {
            const v = e.target.value as "light" | "dark" | "system";
            if (v === "light") setLight();
            else if (v === "dark") setDark();
            else setSystem();
          }}
          className="bg-transparent border border-slate-300/20 dark:border-slate-700/60 text-slate-700 dark:text-slate-100 rounded px-2 py-1 text-xs"
        >
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <button
        aria-label="Toggle theme"
        onClick={toggle}
        className="p-2 rounded-md bg-slate-100/60 dark:bg-slate-800/60 hover:scale-105 transition-transform"
        title="Toggle theme"
      >
        {theme === "dark" ? (
          // sun icon
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <path
              d="M12 4V2M12 22v-2M4 12H2M22 12h-2M5 5l-1.5-1.5M20.5 20.5 19 19M19 5l1.5-1.5M4.5 19.5 6 18"
              stroke="#FBBF24"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="12"
              cy="12"
              r="3"
              stroke="#F59E0B"
              strokeWidth="1.5"
              fill="#FDE68A"
            />
          </svg>
        ) : (
          // moon icon
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <path
              d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
              stroke="#111827"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="#111827"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
