// src/pages/Kanban.tsx
import React, { JSX, useEffect, useState } from "react";

/**
 * Kanban page with list of boards and a small "Create board" form.
 * Expects:
 *  - GET  /api/kanban  -> [boards]
 *  - POST /api/kanban  -> created board object
 *
 * Falls back to fetch if ../api helpers are not present.
 */

type KanbanBoard = {
  _id?: string;
  id?: string;
  title: string;
  columns?: Array<{ id?: string; title: string; cards?: any[] }>;
  description?: string;
  createdAt?: string;
};

export default function KanbanPage(): JSX.Element {
  const [boards, setBoards] = useState<KanbanBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const api: any = (globalThis as any).__APP_API__ || null;

  async function load() {
    setLoading(true);
    setError(null);
    try {
      let r: any;
      if (api?.apiListKanban) {
        r = await api.apiListKanban();
      } else {
        const res = await fetch("/api/kanban");
        if (!res.ok) throw new Error("Failed to load boards");
        r = await res.json();
      }
      setBoards(Array.isArray(r) ? r : []);
    } catch (err: any) {
      console.error("load kanban", err);
      setError(err?.message ?? "Failed to load boards");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreateBoard(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    if (!title.trim()) {
      setError("Title required");
      setBusy(false);
      return;
    }
    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      // default starter column(s) could be added on server; keeping payload small
    };
    try {
      let created: any;
      if (api?.apiCreateKanban) {
        created = await api.apiCreateKanban(payload);
      } else {
        const res = await fetch("/api/kanban", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Create failed");
        }
        created = await res.json();
      }
      // refresh list
      await load();
      setTitle("");
      setDescription("");
    } catch (err: any) {
      console.error("create board error", err);
      setError(err?.message ?? "Failed to create board");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-3">Kanban</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <form
          onSubmit={handleCreateBoard}
          className="card-surface border border-surface-border p-4 rounded space-y-3"
        >
          <h3 className="font-semibold">Create board</h3>

          <div>
            <label className="block text-sm mb-1">Board title</label>
            <input
              className="w-full p-2 rounded border border-surface-border"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Description (optional)</label>
            <textarea
              rows={3}
              className="w-full p-2 rounded border border-surface-border"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex items-center justify-end">
            <button className="btn-classroom" type="submit" disabled={busy}>
              {busy ? "Creating…" : "Create board"}
            </button>
          </div>
        </form>

        <div className="lg:col-span-2">
          {loading && <div className="text-classroom-muted">Loading…</div>}

          {!loading && boards.length === 0 && (
            <div className="text-classroom-muted">
              No boards found. Instructor can create boards.
            </div>
          )}

          <div className="space-y-3">
            {boards.map((b) => (
              <div
                key={b._id ?? b.id}
                className="card-surface border border-surface-border p-3 rounded"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="font-semibold">{b.title}</div>
                    <div className="text-sm text-classroom-muted mt-1">
                      {b.description}
                    </div>
                  </div>
                  <div className="text-xs text-classroom-muted">
                    {b.columns?.length ?? 0} columns
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
