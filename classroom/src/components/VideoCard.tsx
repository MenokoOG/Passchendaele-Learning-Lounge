import React, { useState } from "react";
import { Link } from "react-router-dom";
import { rewriteRaw } from "../api/api";
import { useAuth } from "../auth/AuthProvider";

export default function VideoCard({
  lesson,
  onOpenReader,
}: {
  lesson: any;
  onOpenReader?: (lesson: any) => void;
}) {
  const { user } = useAuth();
  const canRewrite =
    user && (user.role === "instructor" || user.role === "admin");

  const [rewriting, setRewriting] = useState(false);

  const handleRewrite = async () => {
    if (!lesson?._id) {
      alert("No id available for rewrite.");
      return;
    }
    if (!canRewrite) {
      alert("Permission denied: requires instructor role.");
      return;
    }
    setRewriting(true);
    try {
      const res = await rewriteRaw(lesson._id);
      console.log("rewrite result:", res);
      alert("Rewrite finished. Inspect console for rewritten content.");
    } catch (err) {
      console.error("rewrite failed", err);
      alert("Rewrite failed — check console for details.");
    } finally {
      setRewriting(false);
    }
  };

  return (
    <article className="card-surface border border-surface-border p-3 rounded flex items-start gap-3">
      <div className="flex-1">
        <Link
          to={`/lesson/${lesson._id || lesson.id}`}
          className="font-semibold block"
        >
          {lesson.title || lesson.name || "Untitled"}
        </Link>
        <div className="text-sm text-classroom-muted mt-1">
          {lesson.summary || lesson.metadata?.ogDescription}
        </div>
      </div>

      <div className="flex flex-col gap-2 items-end">
        {onOpenReader && (
          <button
            onClick={() => onOpenReader(lesson)}
            className="px-2 py-1 text-xs rounded bg-indigo-600 text-white"
            title="Open reader"
          >
            Open reader
          </button>
        )}

        {canRewrite && (
          <button
            onClick={handleRewrite}
            disabled={rewriting}
            className="px-2 py-1 text-xs rounded bg-amber-600 text-white"
            title="Rewrite (instructor only)"
          >
            {rewriting ? "Rewriting…" : "Rewrite"}
          </button>
        )}

        <Link
          to={`/lesson/${lesson._id || lesson.id}`}
          className="text-xs text-classroom-muted"
        >
          Open
        </Link>
      </div>
    </article>
  );
}
