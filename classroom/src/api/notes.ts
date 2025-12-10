// src/api/notes.ts
import client from "./index";

export type NoteShape = {
  _id?: string;
  user?: string;
  title?: string;
  content?: string;
  createdAt?: string;
  updatedAt?: string;
  [k: string]: any;
};

export async function apiListNotes(): Promise<NoteShape[]> {
  const r = await client.get("/api/notes");
  return Array.isArray(r.data) ? r.data : r.data?.notes ?? [];
}

export async function apiCreateNote(payload: {
  title: string;
  body: string;
}): Promise<NoteShape> {
  const r = await client.post("/api/notes", {
    title: payload.title,
    content: payload.body,
  });
  if (r.data && r.data.note) return r.data.note as NoteShape;
  return r.data as NoteShape;
}

export async function apiUpdateNote(
  id: string,
  payload: { title?: string; body?: string }
): Promise<NoteShape> {
  const r = await client.put(`/api/notes/${id}`, {
    title: payload.title,
    content: payload.body,
  });
  if (r.data && r.data.note) return r.data.note as NoteShape;
  return r.data as NoteShape;
}

export async function apiDeleteNote(id: string): Promise<any> {
  const r = await client.delete(`/api/notes/${id}`);
  return r.data;
}
