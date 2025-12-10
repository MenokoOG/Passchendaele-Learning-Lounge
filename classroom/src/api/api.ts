// classroom/src/api/api.ts
import client from "./client";

/* ---------------- Raw / Scrape / Lessons ---------------- */
export async function listRaw() {
  const r = await client.get("/api/raw");
  return r.data as any[];
}

export async function getRaw(id: string) {
  const r = await client.get(`/api/raw/${id}`);
  return r.data;
}

/**
 * POST /api/raw/:id/rewrite
 * Body: { style?: string, voiceSample?: string, force?: boolean }
 * Returns rewritten content (or fallback mode)
 */
export async function rewriteRaw(
  id: string,
  style?: string,
  voiceSample?: string,
  force: boolean = false
) {
  const r = await client.post(`/api/raw/${id}/rewrite`, {
    style,
    voiceSample,
    force,
  });
  return r.data;
}

/**
 * POST /api/scrape
 * Body: { links: [{ title, url, usePuppeteer? }], usePuppeteer?: boolean }
 */
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

/* ---------------- Lessons (client expects these names) ----------------
   NOTE: if your server doesn't yet implement /api/lessons you'll need to add
   those endpoints or point these helpers at a different route (e.g. /api/ingest).
*/
export async function listLessons() {
  const r = await client.get("/api/lessons");
  return r.data;
}
export async function createLesson(payload: any) {
  const r = await client.post("/api/lessons", payload);
  return r.data;
}
export async function getLesson(id: string) {
  const r = await client.get(`/api/lessons/${id}`);
  return r.data;
}
export async function updateLesson(id: string, patch: any) {
  const r = await client.put(`/api/lessons/${id}`, patch);
  return r.data;
}

/* ----------------- Notes / Events / Files / Kanban ----------------- */
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

/* ----------------- Admin system helpers ----------------- */
export async function adminGetSystemStatus() {
  const r = await client.get("/api/admin/system/status");
  return r.data;
}
export async function adminTriggerBackup() {
  const r = await client.post("/api/admin/system/backup");
  return r.data;
}
