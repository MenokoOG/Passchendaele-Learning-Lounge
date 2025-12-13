// src/pages/Accessibility.tsx
import React, { useEffect, useState } from "react";
import { applyPalette, loadSavedPalette, PALETTES } from "../utils/palettes";
import { useToast } from "../context/ToastContext";

const STORAGE_KEY = "menoko_reader_settings_v1";

type ReaderSettings = {
  fontScale: number; // 100..160
  lineHeight: number; // 130..200 %
  palette: string;
  dyslexicFont: boolean;
  reduceMotion: boolean;
  easyReadingMode: boolean;
};

const DEFAULT: ReaderSettings = {
  fontScale: 110,
  lineHeight: 160,
  palette: "hippy",
  dyslexicFont: false,
  reduceMotion: true,
  easyReadingMode: true,
};

function saveSettings(s: ReaderSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {}
}

function loadSettings(): ReaderSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...(JSON.parse(raw) || {}) };
  } catch {
    return DEFAULT;
  }
}

export default function AccessibilityPage() {
  const toast = useToast();
  const [settings, setSettings] = useState<ReaderSettings>(loadSettings);

  useEffect(() => {
    // apply palette on mount
    loadSavedPalette(); // ensure previously chosen palette applies
    applyPalette(settings.palette);
    applyRuntimeSettings(settings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyRuntimeSettings(s: ReaderSettings) {
    const root = document.documentElement;
    root.style.setProperty("--type-base", `${(s.fontScale / 100) * 1}rem`);
    // set a CSS var for line height multiplier used by .prose
    root.style.setProperty("--reader-line-height", `${s.lineHeight}%`);
    root.style.setProperty("--reader-easy", s.easyReadingMode ? "1" : "0");

    // dyslexic font toggle (uses system fallback or configured font)
    if (s.dyslexicFont) {
      root.style.setProperty(
        "--reader-font-family",
        `'OpenDyslexic', 'Trebuchet MS', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial`
      );
    } else {
      root.style.removeProperty("--reader-font-family");
    }

    // reduced motion
    if (s.reduceMotion) {
      root.style.setProperty("transition", "none");
    } else {
      root.style.removeProperty("transition");
    }

    // "easyReadingMode" toggles extra spacing + simplified contrast via class
    document.documentElement.classList.toggle(
      "easy-reading",
      s.easyReadingMode
    );
  }

  function update<K extends keyof ReaderSettings>(k: K, v: ReaderSettings[K]) {
    const updated = { ...settings, [k]: v };
    setSettings(updated);
    saveSettings(updated);
    applyPalette(updated.palette);
    applyRuntimeSettings(updated);
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-2">Accessibility & Reader</h2>
      <p className="text-classroom-muted mb-4">
        Adjust reading settings to improve clarity and comfort. Settings persist
        in your browser.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card-surface p-4">
          <h3 className="font-semibold mb-2">Font scale</h3>
          <p className="text-sm text-classroom-muted mb-3">
            Increase text size for easier reading.
          </p>
          <input
            type="range"
            min={100}
            max={160}
            value={settings.fontScale}
            onChange={(e) => update("fontScale", Number(e.target.value))}
            aria-label="Font scale"
          />
          <div className="mt-2 text-sm">{settings.fontScale}%</div>
        </div>

        <div className="card-surface p-4">
          <h3 className="font-semibold mb-2">Line height</h3>
          <p className="text-sm text-classroom-muted mb-3">
            More line spacing reduces visual blurring for readers with
            nystagmus.
          </p>
          <input
            type="range"
            min={130}
            max={200}
            value={settings.lineHeight}
            onChange={(e) => update("lineHeight", Number(e.target.value))}
            aria-label="Line height"
          />
          <div className="mt-2 text-sm">{settings.lineHeight}%</div>
        </div>

        <div className="card-surface p-4">
          <h3 className="font-semibold mb-2">Palette</h3>
          <p className="text-sm text-classroom-muted mb-3">
            Pick a gentle palette. "Hippy" is soft, pastel and easy on the eyes.
          </p>
          <div className="flex gap-2 flex-wrap">
            {Object.keys(PALETTES).map((name) => (
              <button
                key={name}
                onClick={() => {
                  update("palette", name);
                  toast.show(`Palette set: ${name}`, "success", 1800);
                }}
                className={`px-3 py-1 rounded border ${
                  settings.palette === name
                    ? "bg-classroom text-white"
                    : "btn-surface text-classroom-muted"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <div className="card-surface p-4">
          <h3 className="font-semibold mb-2">Reading helpers</h3>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.dyslexicFont}
                onChange={(e) => update("dyslexicFont", e.target.checked)}
              />
              <span className="text-sm">
                Use dyslexia-friendly font (if available)
              </span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.reduceMotion}
                onChange={(e) => update("reduceMotion", e.target.checked)}
              />
              <span className="text-sm">Reduce motion & transitions</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.easyReadingMode}
                onChange={(e) => update("easyReadingMode", e.target.checked)}
              />
              <span className="text-sm">Enable simple reading layout</span>
            </label>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={() => {
            saveSettings(DEFAULT);
            setSettings(DEFAULT);
            applyPalette(DEFAULT.palette);
            applyRuntimeSettings(DEFAULT);
            toast.show("Reader settings reset to defaults", "success");
          }}
          className="btn-surface"
        >
          Reset to defaults
        </button>
      </div>
    </div>
  );
}
