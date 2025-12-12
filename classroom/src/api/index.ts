// src/api/index.ts
import axios, { AxiosInstance } from "axios";

/**
 * Central API entrypoint for frontend.
 * - Safe environment access (no `process` reference at runtime in browser).
 * - Exports axios instance augmented with api* helpers.
 *
 * Important: set VITE_API_URL (Vite) or REACT_APP_API_URL (Create-React-App envs)
 * if your API is external. Otherwise leave blank to use relative paths.
 */

const TOKEN_KEY = "token";

/* --- Resolve API base safely --- */
function resolveApiBase(): string {
  try {
    // Vite: import.meta.env.VITE_API_URL
    if (typeof import.meta !== "undefined" && typeof import.meta.env !== "undefined" && import.meta.env.VITE_API_URL) {
      return String(import.meta.env.VITE_API_URL).replace(/\/$/, "");
    }
  } catch {
    // ignore
  }

  // If `process` exists (e.g. in some builds / node) use it safely
  try {
    if (typeof process !== "undefined" && process.env) {
      const val =
        (process.env as any).VITE_API_URL ||
        (process.env as any).REACT_APP_API_URL ||
        (process.env as any).API_BASE;
      if (val) return String(val).replace(/\/$/, "");
    }
  } catch {
    // ignore
  }

  // default: relative (same host)
  return "";
}

const API_BASE = resolveApiBase();

/* --- axios client --- */
const client: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

/* attach auth header automatically from localStorage */
client.interceptors.request.use(
  (cfg) => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        cfg.headers = cfg.headers || {};
        (cfg.headers as any).Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // ignore localStorage errors
    }
    return cfg;
  },
  (err) => Promise.reject(err)
);

/* on 401, clear local token and rethrow */
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem("user");
      } catch {}
    }
    return Promise.reject(err);
  }
);

/* --- types --- */
export type FileMeta = {
  _id?: string;
  id?: string;
  originalName?: string;
  mimeType?: string;
  size?: number;
  path?: string;
  publicUrl?: string;
  createdAt?: string;
  [k: string]: any;
};

export type PresignResult = {
  url: string;
  key?: string;
  id?: string;
};

export type NoteShape = {
  _id?: string;
  user?: string;
  title?: string;
  content?: string;
  createdAt?: string;
  updatedAt?: string;
  [k: string]: any;
};

/* ----------------- API wrappers ----------------- */

/* Files */
export async function apiListFiles(): Promise<FileMeta[]> {
  const r = await client.get("/api/files");
  return r.data;
}

export async function apiPresignUpload(opts: {
  filename: string;
  contentType?: string;
}): Promise<PresignResult> {
  const r = await client.post("/api/files/presign", {
    filename: opts.filename,
    contentType: opts.contentType,
  });
  return r.data;
}

export async function apiConfirmUpload(id: string, payload: { size?: number; key?: string }) {
  const r = await client.post(`/api/files/confirm/${encodeURIComponent(id)}`, payload);
  return r.data;
}

export async function apiGetDownloadUrl(id: string): Promise<{ url?: string } | null> {
  const r = await client.get(`/api/files/download/${encodeURIComponent(id)}`);
  return r.data ?? null;
}

export async function apiDeleteFile(id: string) {
  const r = await client.delete(`/api/files/${encodeURIComponent(id)}`);
  return r.data;
}

/* Events / Calendar */
export async function apiListEvents(): Promise<any[]> {
  const r = await client.get("/api/events");
  return r.data;
}
export async function apiCreateEvent(payload: Record<string, any>) {
  const r = await client.post("/api/events", payload);
  return r.data;
}

/* Kanban */
export async function apiListKanban(): Promise<any[]> {
  const r = await client.get("/api/kanban");
  return r.data;
}
export async function apiCreateKanban(payload: Record<string, any>) {
  const r = await client.post("/api/kanban", payload);
  return r.data;
}

/* Notes */
export async function apiListNotes(): Promise<NoteShape[]> {
  const r = await client.get("/api/notes");
  return r.data ?? [];
}
export async function apiCreateNote(payload: { title: string; body?: string; content?: string }) {
  const body = { title: payload.title, content: payload.body ?? payload.content ?? "" };
  const r = await client.post("/api/notes", body);
  return r.data;
}
export async function apiUpdateNote(id: string, payload: { title?: string; body?: string; content?: string }) {
  const body = { title: payload.title, content: payload.body ?? payload.content };
  const r = await client.put(`/api/notes/${encodeURIComponent(id)}`, body);
  return r.data;
}
export async function apiDeleteNote(id: string) {
  const r = await client.delete(`/api/notes/${encodeURIComponent(id)}`);
  return r.data;
}

/* Auth helpers */
export async function apiRegister(username: string, email: string, password: string) {
  const r = await client.post("/api/auth/register", { username, email, password });
  return r.data;
}

export async function apiLogin(emailOrUsername: string, password: string) {
  const r = await client.post("/api/auth/login", {
    email: emailOrUsername,
    username: emailOrUsername,
    emailOrUsername,
    password,
  });
  return r.data;
}

export async function apiMe() {
  const r = await client.get("/api/auth/me");
  return r.data;
}

export async function apiUpdateProfile(profile: any) {
  const r = await client.put("/api/auth/profile", profile);
  return r.data;
}

export async function apiLogout() {
  try {
    const r = await client.post("/api/auth/logout");
    return r.data;
  } catch {
    return null;
  }
}

/* --- Aggregate and export --- */
const apiObject = {
  apiListFiles,
  apiPresignUpload,
  apiConfirmUpload,
  apiGetDownloadUrl,
  apiDeleteFile,

  apiListEvents,
  apiCreateEvent,

  apiListKanban,
  apiCreateKanban,

  apiListNotes,
  apiCreateNote,
  apiUpdateNote,
  apiDeleteNote,

  apiRegister,
  apiLogin,
  apiMe,
  apiUpdateProfile,
  apiLogout,
};

const exported: any = Object.assign(client, apiObject);

try {
  (globalThis as any).__APP_API__ = exported;
} catch (e) {
  /* ignore */
}

export default exported;
