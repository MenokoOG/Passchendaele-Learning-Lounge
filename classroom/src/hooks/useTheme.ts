// src/hooks/useTheme.ts
import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "google_tee_theme_v1";

export default function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return (raw as Theme) || "system";
    } catch {
      return "system";
    }
  });

  const apply = useCallback((t: Theme) => {
    const root = document.documentElement;
    if (t === "system") {
      // follow prefers-color-scheme
      const prefersDark = window.matchMedia?.(
        "(prefers-color-scheme: dark)"
      ).matches;
      root.classList.toggle("dark", prefersDark);
    } else {
      root.classList.toggle("dark", t === "dark");
    }
  }, []);

  useEffect(() => {
    apply(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {}
  }, [theme, apply]);

  // if theme=system and user changes OS setting, keep in sync
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    function handler() {
      if (theme === "system") apply("system");
    }
    mq?.addEventListener?.("change", handler);
    return () => mq?.removeEventListener?.("change", handler);
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
