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

export type ApiType = {
  apiListFiles: () => Promise<FileMeta[]>;
  apiPresignUpload: (opts: { filename: string; contentType?: string }) => Promise<PresignResult>;
  // ... other methods ...
  apiCreateKanban: (payload: Record<string, any>) => Promise<any>;
  apiListNotes: () => Promise<NoteMeta[]>; // <-- Add this line
};

export async function apiListNotes(): Promise<NoteShape[]> {
  const notes = await client.apiListNotes();
  return Array.isArray(notes) ? notes : notes?.notes ?? [];
}

export async function apiCreateNote(payload: {
  title: string;
  body: string;
}): Promise<NoteShape> {
  const note = await client.apiCreateNote({
    title: payload.title,
    content: payload.body,
  });
  return note as NoteShape;
}

export async function apiUpdateNote(
  id: string,
  payload: { title?: string; body?: string }
): Promise<NoteShape> {
  const note = await client.apiUpdateNote(id, {
    title: payload.title,
    content: payload.body,
  });
  return note as NoteShape;
}

export async function apiDeleteNote(id: string): Promise<any> {
  return client.apiDeleteNote(id);
}

export const api: ApiType = {
  apiListFiles: async () => { /* ... */ },
  apiPresignUpload: async (opts) => { /* ... */ },
  // ... other methods ...
  apiCreateKanban: async (payload) => { /* ... */ },
  apiListNotes: async () => {
    // Implement your logic here
    // Example:
    return fetch('/api/notes').then(res => res.json());
  },
};
