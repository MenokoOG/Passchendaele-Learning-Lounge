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
        aria-hidden
        className="animate-pulse card-surface p-4 rounded-lg border shadow-sm border-surface-border"
      >
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex-1">
            <div className="h-5 bg-surface-shimmer rounded w-3/4 mb-2" />
            <div className="h-3 bg-surface-shimmer rounded w-1/2" />
          </div>
          <div className="w-14 h-8 bg-surface-shimmer rounded" />
        </div>
        <div className="h-3 bg-surface-shimmer rounded w-full mb-2" />
        <div className="h-3 bg-surface-shimmer rounded w-5/6" />
      </article>
    );
  }

  if (!lesson) return null;

  const title = lesson.title || lesson.metadata?.ogTitle || lesson.url;
  const when = lesson.fetchedAt
    ? dayjs(lesson.fetchedAt).format("MMM D, YYYY HH:mm")
    : "Unknown";

  return (
    <article className="card-surface p-4 rounded-lg border border-surface-border shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            to={`/lesson/${lesson._id}`}
            className="text-lg font-medium text-classroom truncate hover:underline block"
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
            className="inline-block px-2 py-1 rounded btn-surface text-xs"
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
