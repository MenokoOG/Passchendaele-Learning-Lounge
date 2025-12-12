// src/components/AccessibilityPanel.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthProvider";

const PREF_KEY = "m3n0koog_access_prefs_v1";

export type Prefs = {
  fontSize?: number;
  reducedMotion?: boolean;
  theme?: "light" | "dark";
  [k: string]: any;
};

const applyPrefsToDocument = (p: Prefs) => {
  try {
    if (p.theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
    }

    if (p.reducedMotion) {
      document.documentElement.classList.add("reduced-motion");
      document.documentElement.setAttribute("data-reduced-motion", "1");
    } else {
      document.documentElement.classList.remove("reduced-motion");
      document.documentElement.removeAttribute("data-reduced-motion");
    }

    if (typeof p.fontSize === "number") {
      document.documentElement.style.setProperty(
        "--global-font-size",
        `${p.fontSize}px`
      );
      // you can also set body font-size if desired:
      // document.body.style.fontSize = `${p.fontSize}px`;
    }
  } catch {}
};

const readPersistedPrefs = (): Prefs => {
  try {
    const raw = localStorage.getItem(PREF_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Prefs;
  } catch {
    return {};
  }
};

const persistPrefs = (p: Prefs) => {
  try {
    localStorage.setItem(PREF_KEY, JSON.stringify(p));
  } catch {}
};

const AccessibilityPanel: React.FC = () => {
  const auth = useAuth();
  const user = auth?.user;
  const updateProfile = auth?.updateProfile;
  const persisted = readPersistedPrefs();

  const [fontSize, setFontSize] = useState<number>(persisted.fontSize ?? 16);
  const [reducedMotion, setReducedMotion] = useState<boolean>(
    persisted.reducedMotion ?? false
  );
  const [prefersDark, setPrefersDark] = useState<boolean>(
    (persisted.theme ?? user?.preferences?.theme ?? "light") === "dark"
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    applyPrefsToDocument({
      fontSize,
      reducedMotion,
      theme: prefersDark ? "dark" : "light",
    });
  }, [fontSize, reducedMotion, prefersDark]);

  useEffect(() => {
    if (!user) return;
    try {
      const uPrefs = user?.preferences ?? {};
      if (typeof uPrefs.fontSize === "number") setFontSize(uPrefs.fontSize);
      if (typeof uPrefs.reducedMotion === "boolean")
        setReducedMotion(Boolean(uPrefs.reducedMotion));
      setPrefersDark(uPrefs.theme === "dark");
    } catch {}
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    const toSave: Prefs = {
      fontSize,
      reducedMotion,
      theme: prefersDark ? "dark" : "light",
    };
    persistPrefs(toSave);
    try {
      if (updateProfile) {
        // call updateProfile only if provided by AuthProvider (server sync)
        await updateProfile({
          preferences: toSave,
        });
      }
      setMessage("Saved.");
    } catch (err) {
      console.error("Failed to save preferences", err);
      setMessage("Save failed.");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 2500);
    }
  };

  return (
    <div className="p-3 border rounded bg-white dark:bg-slate-900">
      <h4 className="text-sm font-medium mb-2">Accessibility</h4>

      <label className="block text-xs mb-3" aria-hidden>
        Font size: <strong>{fontSize}px</strong>
        <input
          aria-label="Adjust font size"
          type="range"
          min={12}
          max={22}
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
          className="w-full mt-1"
        />
      </label>

      <label className="flex items-center gap-2 text-xs mb-2">
        <input
          aria-label="Reduce motion"
          type="checkbox"
          checked={reducedMotion}
          onChange={(e) => setReducedMotion(e.target.checked)}
        />
        Reduce motion (for vestibular / sensitivity)
      </label>

      <label className="flex items-center gap-2 text-xs mb-3">
        <input
          aria-label="Prefer dark theme"
          type="checkbox"
          checked={prefersDark}
          onChange={(e) => setPrefersDark(e.target.checked)}
        />
        Prefer dark theme
      </label>

      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-2 py-1 bg-indigo-600 text-white rounded a11y-focus text-sm"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {message && <div className="text-sm text-slate-500">{message}</div>}
      </div>
    </div>
  );
};

export default AccessibilityPanel;
