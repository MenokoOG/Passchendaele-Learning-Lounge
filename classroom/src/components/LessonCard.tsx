// src/components/LessonCard.tsx
import React from "react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";

export default function LessonCard({
  lesson,
  loading = false,
}: {
  lesson?: any;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="animate-pulse bg-slate-800 p-4 rounded border border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <div className="h-5 bg-slate-700 rounded w-2/3" />
          <div className="h-4 bg-slate-700 rounded w-20" />
        </div>
        <div className="h-3 bg-slate-700 rounded w-1/2 mb-2" />
        <div className="h-3 bg-slate-700 rounded w-3/4" />
      </div>
    );
  }

  if (!lesson) return null;
  const title = lesson.title || lesson.metadata?.ogTitle || lesson.url;
  const when = lesson.fetchedAt
    ? dayjs(lesson.fetchedAt).format("MMM D, YYYY HH:mm")
    : "Unknown";
  return (
    <div className="bg-slate-800 p-4 rounded border border-slate-700">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <Link
            to={`/lesson/${lesson._id}`}
            className="text-lg font-medium text-slate-100 hover:underline block truncate"
          >
            {title}
          </Link>
          <div className="text-sm text-slate-400 mt-1">
            {lesson.type} • {when}
          </div>
        </div>
        <div className="ml-4 flex-shrink-0">
          <a
            href={lesson.url}
            target="_blank"
            rel="noreferrer"
            className="text-xs px-2 py-1 bg-slate-700 rounded"
          >
            Open
          </a>
        </div>
      </div>
      <p className="mt-3 text-slate-300 text-sm line-clamp-3">
        {(lesson.text || "").slice(0, 300) || "No preview available."}
      </p>
    </div>
  );
}
