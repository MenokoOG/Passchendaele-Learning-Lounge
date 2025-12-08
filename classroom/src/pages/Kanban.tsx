// src/pages/Kanban.tsx
import React, { useEffect, useState } from "react";
import { apiListKanban } from "../api";

export default function KanbanPage() {
  const [boards, setBoards] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const r = await apiListKanban();
        setBoards(Array.isArray(r) ? r : []);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Kanban</h2>
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
