// src/aegps / Kanban.tsx(replace);
import React, { useEffect, useState } from "react";
import { apiListKanban } from "../api";
import { apiCreateBoard } from "../api";

export default function KanbanPage() {
  const [boards, setBoards] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const r = await apiListKanban();
      setBoards(Array.isArray(r) ? r : []);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      await apiCreateBoard({ title: title.trim() });
      setTitle("");
      await load();
    } catch (err: any) {
      console.error("create board failed", err);
      alert(err?.response?.data?.error ?? err?.message ?? "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Kanban</h2>

      <div className="card-surface border border-surface-border p-4 rounded mb-4">
        <form onSubmit={onCreate} className="flex gap-2 flex-wrap">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Board title"
            className="p-2 rounded border border-surface-border flex-1 min-w-[180px]"
          />
          <button className="btn-classroom" type="submit" disabled={busy}>
            {busy ? "Creating..." : "Create board"}
          </button>
        </form>
      </div>

      <div className="space-y-3">
        {boards.length === 0 ? (
          <div className="text-classroom-muted">
            No boards found. Instructor can create boards.
          </div>
        ) : (
          boards.map((b) => (
            <div
              key={b._id || b.id}
              className="card-surface border border-surface-border p-3 rounded"
            >
              <div className="font-semibold">{b.title}</div>
              <div className="text-sm text-classroom-muted">
                {(b.columns || []).length} columns
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
