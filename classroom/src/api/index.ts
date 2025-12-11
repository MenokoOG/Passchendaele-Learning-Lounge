// src/api/index.ts
import axios, { AxiosRequestConfig } from "axios";

/**
 * Single API client used across the app.
 * VITE_API_URL can be set in .env (Vite uses import.meta.env).
 */
const API = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(
  /\/$/,
  ""
);

const client = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
});

// token key used by your AuthProvider/tokenStorage
const TOKEN_KEY = "token";

// attach token automatically if present in localStorage
client.interceptors.request.use((cfg: AxiosRequestConfig | any) => {
  try {
    const t = localStorage.getItem(TOKEN_KEY);
    if (t) {
      cfg.headers = cfg.headers || {};
      (cfg.headers as any).Authorization = `Bearer ${t}`;
    }
  } catch (e) {
    // ignore
  }
  return cfg;
});

// optional: handle 401 globally (client-side logout)
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

export default client;

/* ----------------- Auth ----------------- */
export async function apiLogin(emailOrUsername: string, password: string) {
  const r = await client.post("/api/auth/login", {
    email: emailOrUsername,
    username: emailOrUsername,
    emailOrUsername,
    password,
  });
  return r.data; // { ok, token, user } or { user, token } depending on server
}

export async function apiRegister(
  username: string,
  email: string,
  password: string
) {
  const r = await client.post("/api/auth/register", {
    username,
    email,
    password,
  });
  return r.data;
}

export async function apiGetMe() {
  const r = await client.get("/api/auth/me");
  return r.data;
}

export async function apiChangePassword(
  oldPassword: string | undefined,
  newPassword: string
) {
  const r = await client.post("/api/auth/change-password", {
    oldPassword,
    newPassword,
  });
  return r.data;
}

/* ----------------- Notes / Events / Files / Kanban ----------------- */
export async function apiListNotes() {
  const r = await client.get("/api/notes");
  return r.data;
}

export async function apiCreateNote(note: {
  title: string;
  body?: string;
  content?: string;
}) {
  const r = await client.post("/api/notes", {
    title: note.title,
    content: note.body ?? note.content ?? "",
  });
  if (r.data?.note) return r.data.note;
  return r.data;
}

export async function apiUpdateNote(
  id: string,
  payload: { title?: string; body?: string }
) {
  const r = await client.put(`/api/notes/${id}`, {
    title: payload.title,
    content: payload.body,
  });
  if (r.data?.note) return r.data.note;
  return r.data;
}

export async function apiDeleteNote(id: string) {
  const r = await client.delete(`/api/notes/${id}`);
  return r.data;
}

/**
 * IMPORTANT: this is the function your Calendar.tsx expects.
 * Make sure Calendar.tsx imports: `import { apiListEvents } from "../api";`
 */
export async function apiListEvents() {
  const r = await client.get("/api/events");
  return r.data;
}

export async function apiListFiles() {
  const r = await client.get("/api/files");
  return r.data;
}

export async function apiListKanban() {
  const r = await client.get("/api/kanban");
  return r.data;
}

/* ----------------- Admin / Users ----------------- */
export async function apiListUsers() {
  const r = await client.get("/api/users");
  return r.data;
}
export async function apiUpdateUserRole(id: string, role: string) {
  const r = await client.put(`/api/users/${id}`, { role });
  return r.data;
}
export async function apiDeleteUser(id: string) {
  const r = await client.delete(`/api/users/${id}`);
  return r.data;
}

/* Profile update used by AuthProvider */
export async function updateProfileApi(profile: any) {
  const r = await client.put("/api/auth/profile", profile);
  return r.data.user ?? r.data;
}

/* System admin helpers (optional) */
export async function apiSystemStatus() {
  const r = await client.get("/api/admin/system/status");
  return r.data;
}
export async function apiSystemBackup() {
  const r = await client.post("/api/admin/system/backup");
  return r.data;
}

/* Lessons & raw endpoints */
export async function listLessons() {
  const r = await client.get("/api/lessons");
  return r.data;
}
export async function getLesson(id: string) {
  const r = await client.get(`/api/lessons/${id}`);
  return r.data.lesson ?? r.data;
}
export async function createLesson(payload: any) {
  const r = await client.post("/api/lessons", payload);
  return r.data;
}
export async function updateLesson(id: string, payload: any) {
  const r = await client.put(`/api/lessons/${id}`, payload);
  return r.data;
}
export async function listRaw() {
  const r = await client.get("/api/raw");
  return r.data;
}
