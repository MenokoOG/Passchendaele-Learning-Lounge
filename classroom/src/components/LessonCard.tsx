// src/components/LessonCard.tsx
import React from "react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";

export default function LessonCard({ lesson }: { lesson: any }) {
  const title = lesson.title || lesson.metadata?.ogTitle || lesson.url;
  const when = lesson.fetchedAt
    ? dayjs(lesson.fetchedAt).format("MMM D, YYYY HH:mm")
    : "Unknown";

  return (
    <article
      className="rounded-lg p-4 border bg-white dark:bg-slate-800 border-slate-200/60 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"
      aria-labelledby={`lesson-${lesson._id}-title`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            to={`/lesson/${lesson._id}`}
            id={`lesson-${lesson._id}-title`}
            className="text-lg font-semibold text-slate-900 dark:text-slate-100 hover:underline block truncate"
            title={title}
          >
            {title}
          </Link>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="capitalize">{lesson.type}</span>
            <span className="mx-2">•</span>
            <span>{when}</span>
          </div>
        </div>

        <div className="flex-shrink-0 text-right">
          <a
            href={lesson.url}
            target="_blank"
            rel="noreferrer"
            className="inline-block text-xs px-3 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700/60"
          >
            Open
          </a>
        </div>
      </div>

      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
        {(lesson.text || "").slice(0, 300) || "No preview available."}
      </p>
    </article>
  );
}
