// src/components/LessonCard.tsx
import React from "react";
import { Link } from "react-router-dom";

export default function LessonCard({
  lesson,
  onOpenReader,
}: {
  lesson: any;
  onOpenReader?: (lesson: any) => void;
}) {
  return (
    <article className="card-surface border border-surface-border p-3 rounded flex items-start gap-3">
      <div className="flex-1">
        <Link
          to={`/lesson/${lesson._id || lesson.id}`}
          className="font-semibold block"
        >
          {lesson.title || "Untitled"}
        </Link>
        <div className="text-sm text-classroom-muted mt-1">
          {lesson.summary}
        </div>
      </div>

      <div className="flex flex-col gap-2 items-end">
        {onOpenReader && (
          <button
            onClick={() => onOpenReader(lesson)}
            className="px-2 py-1 text-xs rounded bg-indigo-600 text-white"
          >
            Open reader
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
