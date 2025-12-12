import React, { JSX } from "react";
import useTheme from "../hooks/useTheme";

export default function ThemeToggle(): JSX.Element {
  const { theme, setLight, setDark, setSystem, toggle } = useTheme();

  return (
    <div className="flex items-center gap-3">
      <div
        className="inline-flex rounded-md p-0.5 border border-surface-border bg-classroom-surface-2"
        role="tablist"
        aria-label="Theme"
      >
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
          title="Follow system theme"
        >
          System
        </button>
      </div>

      <button
        onClick={toggle}
        title="Toggle theme"
        className="ml-2 p-1 rounded-md text-sm btn-surface border border-surface-border a11y-focus"
        aria-label="Toggle theme"
      >
        {/* accessible icons: simple svg sun / moon */}
        {theme === "dark" ? (
          <svg
            aria-hidden
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
              fill="currentColor"
            />
          </svg>
        ) : theme === "light" ? (
          <svg
            aria-hidden
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M12 3v2M12 19v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="3" fill="currentColor" />
          </svg>
        ) : (
          <svg
            aria-hidden
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
          >
            <rect
              x="3"
              y="3"
              width="18"
              height="18"
              rx="4"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M9 12h6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
