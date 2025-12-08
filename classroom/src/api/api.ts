// classroom/src/api/api.ts
import client from "./client";

/* raw / scraper endpoints */
export async function listRaw() {
  const r = await client.get("/api/raw");
  return r.data as any[];
}

export async function getRaw(id: string) {
  const r = await client.get(`/api/raw/${id}`);
  return r.data as any;
}

export async function rewriteRaw(
  id: string,
  style?: string,
  voiceSample?: string
) {
  const r = await client.post(`/api/raw/${id}/rewrite`, { style, voiceSample });
  return r.data;
}

export async function triggerScrape(
  links: Array<{ title: string; url: string }>,
  usePuppeteer = true
) {
  const r = await client.post(
    "/api/scrape",
    { links, usePuppeteer },
    { timeout: 600000 }
  );
  return r.data;
}

/* Notes / Events / Files / Kanban */
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

/* Admin / Users */
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
