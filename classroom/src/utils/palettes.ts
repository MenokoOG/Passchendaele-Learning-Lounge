// src/utils/palettes.ts
export const STORAGE_KEY = "menoko_learning_palette_v1";

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

/**
 * Palettes: gentle, soft palettes for accessibility.
 * Add new palettes here and they'll be selectable in the Accessibility page.
 */
export const PALETTES: Record<string, Record<string, string>> = {
  hippy: {
    "classroom-primary": "#7AA3A1", // soft teal
    "classroom-primary-600": "#5E8B89",
    "classroom-strip": "#E6D6FF",
    "classroom-strip-600": "#D3C2FF",
    "classroom-logo": "#7AA3A1",
    "surface-bg": "#FEFEFB",
    "surface-contrast": "#FBFBF8",
    "surface-border": "rgba(86,97,97,0.06)",
    "text-default": "#122028",
    "text-muted": "#4b6162",
    success: "#6CC7A1",
    "shimmer-light": "#f3f6f5",
    "shimmer-dark": "#dfe9e8",
    "toast-info-bg": "rgba(18,32,40,0.92)",
    "toast-success-bg": "rgba(108,199,161,0.95)",
    "toast-error-bg": "rgba(239,68,68,0.95)",
  },

  cool: {
    "classroom-primary": "#0EA5A4",
    "classroom-primary-600": "#0B9A94",
    "classroom-strip": "#7C9CF5",
    "classroom-strip-600": "#5C7BE6",
    "classroom-logo": "#60A5FA",
    "surface-bg": "#ffffff",
    "surface-contrast": "#f8fafc",
    "surface-border": "rgba(15,23,42,0.06)",
    "text-default": "#0f172a",
    "text-muted": "#64748b",
    success: "#10b981",
    "shimmer-light": "#eef2f7",
    "shimmer-dark": "#1f2937",
    "toast-info-bg": "rgba(15,23,42,0.92)",
    "toast-success-bg": "rgba(16,185,129,0.95)",
    "toast-error-bg": "rgba(239,68,68,0.95)",
  },

  warm: {
    "classroom-primary": "#E76F51",
    "classroom-primary-600": "#C6553F",
    "classroom-strip": "#F6A386",
    "classroom-strip-600": "#F28B66",
    "classroom-logo": "#FF8364",
    "surface-bg": "#fffaf8",
    "surface-contrast": "#fff5f2",
    "surface-border": "rgba(36,27,26,0.06)",
    "text-default": "#241B1A",
    "text-muted": "#6B6B6B",
    success: "#34d399",
    "shimmer-light": "#fff2ee",
    "shimmer-dark": "#2b1f1e",
    "toast-info-bg": "rgba(36,27,26,0.92)",
    "toast-success-bg": "rgba(52,211,153,0.95)",
    "toast-error-bg": "rgba(239,68,68,0.95)",
  },

  neutral: {
    "classroom-primary": "#6B7B8C",
    "classroom-primary-600": "#55707F",
    "classroom-strip": "#BFC9D9",
    "classroom-strip-600": "#9FB0C8",
    "classroom-logo": "#9FB0C8",
    "surface-bg": "#f7f9fb",
    "surface-contrast": "#f2f5f8",
    "surface-border": "rgba(100,110,120,0.06)",
    "text-default": "#0f172a",
    "text-muted": "#6b7280",
    success: "#16a34a",
    "shimmer-light": "#eef3f8",
    "shimmer-dark": "#e6eef8",
    "toast-info-bg": "rgba(15,23,42,0.88)",
    "toast-success-bg": "rgba(16,185,129,0.16)",
    "toast-error-bg": "rgba(239,68,68,0.16)",
  },
};
