// src/api/index.ts
import axios from "axios";

const API = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(
  /\/$/,
  ""
);

const client = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
});

// attach token automatically if present in localStorage
client.interceptors.request.use((cfg) => {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      cfg.headers = cfg.headers || {};
      (cfg.headers as any).Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore
  }
  return cfg;
});

export default client;

/* ----------------- Auth ----------------- */
export async function apiLogin(email: string, password: string) {
  const r = await client.post("/api/auth/login", { email, password });
  return r.data; // { user, token }
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
// These hit the server stubs implemented on server side
export async function apiListNotes() {
  const r = await client.get("/api/notes");
  return r.data;
}
export async function apiCreateNote(payload: { title: string; body: string }) {
  const r = await client.post("/api/notes", payload);
  return r.data;
}

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
