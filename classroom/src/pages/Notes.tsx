// src/pages/Notes.tsx
import React, { useEffect, useState } from "react";
import {
  apiCreateNote,
  apiListNotes,
  apiDeleteNote,
  apiUpdateNote,
  NoteShape,
} from "../api/notes";

export default function NotesPage() {
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
      setNotes(Array.isArray(r) ? r : []);
    } catch (err: any) {
      console.error("apiListNotes error", err);
      setError("Failed to load notes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    // basic validation
    if (!title.trim() && !body.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const created = await apiCreateNote({
        title: title.trim(),
        body: body.trim(),
      });
      // created is a note object
      setNotes((s) => [created, ...s]);
      setTitle("");
      setBody("");
    } catch (err) {
      console.error("create note failed", err);
      setError("Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(noteId?: string) {
    if (!noteId) return;
    // optimistic remove
    const prev = notes;
    setNotes((s) => s.filter((n) => String(n._id) !== String(noteId)));
    try {
      await apiDeleteNote(String(noteId));
    } catch (err) {
      console.error("delete failed", err);
      setNotes(prev);
      setError("Delete failed");
    }
  }

  // simple inline edit: toggles a note into editable state
  async function onSaveEdit(id: string, newTitle: string, newContent: string) {
    try {
      const updated = await apiUpdateNote(id, {
        title: newTitle,
        body: newContent,
      });
      setNotes((s) =>
        s.map((n) => (String(n._id) === String(id) ? updated : n))
      );
    } catch (err) {
      console.error("update failed", err);
      setError("Update failed");
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
          aria-label="Note title"
        />
        <textarea
          className="w-full p-2 rounded border border-surface-border mb-2"
          placeholder="Write a quick note..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          aria-label="Note body"
        />
        <div className="text-right">
          <button
            className="btn-classroom"
            type="submit"
            disabled={saving || (!title.trim() && !body.trim())}
          >
            {saving ? "Saving…" : "Save Note"}
          </button>
        </div>

        {error && <div className="text-sm text-red-500 mt-2">{error}</div>}
      </form>

      <div className="space-y-3">
        {loading ? (
          <div>Loading notes...</div>
        ) : notes.length === 0 ? (
          <div className="text-classroom-muted">
            No notes yet — start writing.
          </div>
        ) : (
          notes.map((n) => (
            <NoteCard
              key={n._id || (n as any).id}
              note={n}
              onDelete={() => onDelete(n._id)}
              onSave={(t, c) => onSaveEdit(String(n._id), t, c)}
            />
          ))
        )}
      </div>
    </div>
  );
}

/**
 * Small inline card component for each note that supports edit/delete.
 * Keep this local to the page for easy copying; it's minimal and accessible.
 */
function NoteCard({
  note,
  onDelete,
  onSave,
}: {
  note: NoteShape;
  onDelete?: () => void;
  onSave?: (title: string, content: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [t, setT] = useState(note.title ?? "");
  const [c, setC] = useState(note.content ?? "");

  useEffect(() => {
    setT(note.title ?? "");
    setC(note.content ?? "");
  }, [note._id]);

  return (
    <div className="card-surface border border-surface-border p-3 rounded">
      {!editing ? (
        <>
          <div className="flex items-start justify-between">
            <div>
              <div className="font-semibold">{note.title || "Untitled"}</div>
              <div className="text-sm text-classroom-muted mt-1 whitespace-pre-wrap">
                {note.content || ""}
              </div>
            </div>

            <div className="ml-4 text-right flex flex-col gap-2">
              <div className="text-xs text-classroom-muted">
                {note.updatedAt
                  ? new Date(note.updatedAt).toLocaleString()
                  : ""}
              </div>
              <div className="flex gap-2">
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
          </div>
        </>
      ) : (
        <>
          <input
            className="w-full p-2 rounded border border-surface-border mb-2"
            value={t}
            onChange={(e) => setT(e.target.value)}
          />
          <textarea
            className="w-full p-2 rounded border border-surface-border mb-2"
            rows={4}
            value={c}
            onChange={(e) => setC(e.target.value)}
          />
          <div className="flex gap-2 justify-end">
            <button
              className="btn-classroom text-sm px-3 py-1"
              onClick={() => {
                setEditing(false);
                onSave?.(t, c);
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
        </>
      )}
    </div>
  );
}
