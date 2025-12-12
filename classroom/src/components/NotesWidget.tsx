// src/components/NotesWidget.tsx
import React, { useEffect, useState } from "react";
import {
  apiListNotes,
  apiCreateNote,
  apiDeleteNote,
  apiUpdateNote,
  NoteShape,
} from "../api/notes";

export default function NotesWidget({
  showHeader = true,
  limit = 6,
}: {
  showHeader?: boolean;
  limit?: number;
}) {
  const [notes, setNotes] = useState<NoteShape[]>([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const r = await apiListNotes();
      setNotes(Array.isArray(r) ? r.slice(0, limit) : []);
    } catch (err) {
      console.error("NotesWidget load error", err);
      setError("Failed to load notes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!title.trim() && !body.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const created = await apiCreateNote({
        title: title.trim() || "Untitled",
        body: body.trim(),
      });
      setNotes((s) => [created, ...s].slice(0, limit));
      setTitle("");
      setBody("");
    } catch (err) {
      console.error("create note failed", err);
      setError("Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id?: string) {
    if (!id) return;
    const prev = notes;
    setNotes((s) => s.filter((n) => String(n._id) !== String(id)));
    try {
      await apiDeleteNote(String(id));
    } catch (err) {
      console.error("delete note failed", err);
      setNotes(prev);
      setError("Delete failed");
    }
  }

  async function onEditSave(id: string, newTitle: string, newBody: string) {
    try {
      const updated = await apiUpdateNote(id, {
        title: newTitle,
        body: newBody,
      });
      setNotes((s) =>
        s.map((n) => (String(n._id) === String(id) ? updated : n))
      );
    } catch (err) {
      console.error("update note failed", err);
      setError("Update failed");
    }
  }

  return (
    <div className="card-surface border border-surface-border p-3 rounded">
      {showHeader && <h4 className="font-semibold mb-2">Notes</h4>}

      <form onSubmit={onCreate} className="mb-3">
        <input
          className="w-full p-2 rounded border border-surface-border mb-2 text-sm"
          placeholder="Quick title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="Note title"
        />
        <textarea
          className="w-full p-2 rounded border border-surface-border mb-2 text-sm"
          placeholder="Quick note..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
        />
        <div className="text-right">
          <button
            className="btn-classroom text-sm"
            type="submit"
            disabled={saving || (!title.trim() && !body.trim())}
          >
            {saving ? "Saving…" : "Add"}
          </button>
        </div>
      </form>

      <div className="space-y-2">
        {loading ? (
          <div className="text-sm text-classroom-muted">Loading...</div>
        ) : notes.length === 0 ? (
          <div className="text-sm text-classroom-muted">No notes yet.</div>
        ) : (
          notes.map((n) => (
            <NoteRow
              key={n._id || (n as any).id}
              note={n}
              onDelete={() => onDelete(n._id)}
              onSave={onEditSave}
            />
          ))
        )}
      </div>

      {error && <div className="text-sm text-red-500 mt-2">{error}</div>}
    </div>
  );
}

function NoteRow({
  note,
  onDelete,
  onSave,
}: {
  note: NoteShape;
  onDelete?: () => void;
  onSave?: (id: string, title: string, content: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [t, setT] = useState(note.title ?? "");
  const [c, setC] = useState(note.content ?? "");

  useEffect(() => {
    setT(note.title ?? "");
    setC(note.content ?? "");
  }, [note._id]);

  return (
    <div className="p-2 border border-surface-border rounded bg-classroom-surface-2">
      {!editing ? (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-medium truncate">
              {note.title || "Untitled"}
            </div>
            <div className="text-xs text-classroom-muted mt-1 whitespace-pre-wrap">
              {note.content}
            </div>
            <div className="text-xs text-classroom-muted mt-1">
              {note.updatedAt ? new Date(note.updatedAt).toLocaleString() : ""}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button
              className="btn-surface text-xs px-2 py-1"
              onClick={() => setEditing(true)}
            >
              Edit
            </button>
            <button
              className="btn-surface text-xs px-2 py-1"
              onClick={onDelete}
            >
              Delete
            </button>
          </div>
        </div>
      ) : (
        <div>
          <input
            value={t}
            onChange={(e) => setT(e.target.value)}
            className="w-full p-1 rounded border border-surface-border mb-2 text-sm"
          />
          <textarea
            value={c}
            onChange={(e) => setC(e.target.value)}
            rows={3}
            className="w-full p-1 rounded border border-surface-border mb-2 text-sm"
          />
          <div className="flex gap-2 justify-end">
            <button
              className="btn-classroom text-sm px-3 py-1"
              onClick={() => {
                setEditing(false);
                onSave?.(String(note._id), t, c);
              }}
            >
              Save
            </button>
            <button
              className="btn-surface text-sm px-3 py-1"
              onClick={() => {
                setEditing(false);
                setT(note.title ?? "");
                setC(note.content ?? "");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
