import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "menoko_learning_theme_v1";

export default function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) as Theme | null;
      return raw || "system";
    } catch {
      return "system";
    }
  });

  const apply = useCallback((t: Theme) => {
    const root = document.documentElement;
    if (t === "system") {
      // Remove forced class so OS preference applies
      root.classList.remove("dark");
      // Immediately add dark class if system prefers dark so visuals match right away
      try {
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        if (prefersDark) root.classList.add("dark");
        else root.classList.remove("dark");
      } catch {
        // ignore
      }
      return;
    }
    // force theme
    root.classList.toggle("dark", t === "dark");
  }, []);

  // Apply when theme changes
  useEffect(() => {
    apply(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {}
  }, [theme, apply]);

  // Keep system setting in sync when theme === 'system'
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mq) return;
    const handler = () => {
      if (theme === "system") apply("system");
    };
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, [theme, apply]);

  const setLight = () => setTheme("light");
  const setDark = () => setTheme("dark");
  const setSystem = () => setTheme("system");
  const toggle = () => {
    setTheme((prev) => {
      if (prev === "dark") return "light";
      if (prev === "light") return "system";
      return "dark";
    });
  };

  return { theme, setTheme, setLight, setDark, setSystem, toggle };
}
