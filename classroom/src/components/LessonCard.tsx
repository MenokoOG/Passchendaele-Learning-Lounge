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
      <article
        className="card-surface border border-surface-border p-4 rounded-lg animate-pulse"
        role="status"
        aria-busy="true"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="h-4 rounded-md bg-surface-shimmer w-3/4 mb-3" />
            <div className="h-3 rounded-md bg-surface-shimmer w-1/2" />
          </div>
          <div className="w-12 h-8 rounded-md bg-surface-shimmer" />
        </div>

        <div className="mt-4">
          <div className="h-3 rounded-md bg-surface-shimmer w-full mb-2" />
          <div className="h-3 rounded-md bg-surface-shimmer w-5/6" />
        </div>
      </article>
    );
  }

  if (!lesson) return null;

  const title = lesson.title || lesson.metadata?.ogTitle || lesson.url;
  const when = lesson.fetchedAt
    ? dayjs(lesson.fetchedAt).format("MMM D, YYYY HH:mm")
    : "Unknown";

  return (
    <article className="card-surface border border-surface-border p-4 rounded-lg shadow-sm">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <Link
            to={`/lesson/${lesson._id}`}
            className="text-lg font-medium text-classroom hover:underline block truncate"
            title={String(title)}
          >
            {title}
          </Link>
          <div className="text-sm text-classroom-muted mt-1">
            {lesson.type} • {when}
          </div>
        </div>

        <div className="ml-4 flex-shrink-0">
          <a
            href={lesson.url}
            target="_blank"
            rel="noreferrer"
            className="btn-surface text-xs px-2 py-1"
          >
            Open
          </a>
        </div>
      </div>

      <p className="mt-3 text-classroom-muted text-sm line-clamp-3">
        {(lesson.text || "").slice(0, 300) || "No preview available."}
      </p>
    </article>
  );
}
