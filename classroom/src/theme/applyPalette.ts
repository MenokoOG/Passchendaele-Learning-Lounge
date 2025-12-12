import { PALETTES } from "./palettes";

const STORAGE_KEY = "menoko_learning_palette_v1";

export function applyPalette(name: string) {
  const palette = (PALETTES as any)[name];
  if (!palette) {
    console.warn("Unknown palette", name);
    return;
  }
  const root = document.documentElement;
  Object.entries(palette).forEach(([k, v]) => {
    root.style.setProperty(`--${k}`, v as string);
  });
  try {
    localStorage.setItem(STORAGE_KEY, name);
  } catch {}
}

export function loadSavedPalette() {
  try {
    const p = localStorage.getItem(STORAGE_KEY);
    if (p && (PALETTES as any)[p]) applyPalette(p);
  } catch {
    /* ignore */
  }
}
