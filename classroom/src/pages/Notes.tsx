// src/pages/Notes.tsx
import React, { useEffect, useState } from "react";
import { apiCreateNote, apiListNotes } from "../api";

export default function NotesPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  async function load() {
    setLoading(true);
    try {
      const r = await apiListNotes();
      setNotes(Array.isArray(r) ? r : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const created = await apiCreateNote({ title, body });
      setTitle("");
      setBody("");
      setNotes((s) => [created, ...s]);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Notes</h2>

      <form
        onSubmit={onCreate}
        className="card-surface border border-surface-border p-4 rounded"
      >
        <input
          className="w-full p-2 rounded border border-surface-border mb-2"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          className="w-full p-2 rounded border border-surface-border mb-2"
          placeholder="Note"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          required
        />
        <div className="text-right">
          <button className="btn-classroom" type="submit">
            Save Note
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {loading ? (
          <div>Loading notes...</div>
        ) : (
          notes.map((n) => (
            <div
              key={n._id || n.id}
              className="card-surface border border-surface-border p-3 rounded"
            >
              <div className="font-semibold">{n.title}</div>
              <div className="text-sm text-classroom-muted mt-1">{n.body}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
