// src/components/VideoCard.tsx
import React from "react";
import dayjs from "dayjs";
import { Link } from "react-router-dom";

function isYouTubeUrl(url?: string) {
  if (!url) return false;
  return /(?:youtube\.com|youtu\.be)/i.test(url);
}

export default function VideoCard({ lesson }: { lesson: any }) {
  const title = lesson.title || lesson.metadata?.ogTitle || lesson.url;
  const when = lesson.fetchedAt
    ? dayjs(lesson.fetchedAt).format("MMM D, YYYY")
    : "Unknown";

  // derive a simple thumbnail for YouTube URLs (safe, no external fetch)
  let thumb: string | null = null;
  if (isYouTubeUrl(lesson.url || "")) {
    const m = (lesson.url || "").match(
      /(?:v=|\/embed\/|youtu\.be\/)([A-Za-z0-9_-]{6,})/
    );
    const id = m?.[1];
    if (id) thumb = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  } else if (lesson.metadata?.thumbnail) {
    thumb = lesson.metadata.thumbnail;
  }

  return (
    <article className="card-surface border border-surface-border p-3 rounded-lg shadow-sm flex gap-4 items-start">
      {thumb ? (
        <a
          href={lesson.url}
          target="_blank"
          rel="noreferrer"
          className="w-40 h-24 flex-shrink-0 overflow-hidden rounded-md"
          aria-hidden
        >
          <img
            src={thumb}
            alt={String(title).slice(0, 80)}
            className="w-full h-full object-cover"
          />
        </a>
      ) : (
        <div className="w-40 h-24 flex-shrink-0 rounded-md bg-surface-contrast flex items-center justify-center text-sm text-classroom-muted">
          Video
        </div>
      )}

      <div className="min-w-0 flex-1">
        <Link
          to={`/lesson/${lesson._id}`}
          className="block text-lg font-medium text-classroom truncate"
        >
          {title}
        </Link>

        <div className="text-xs text-classroom-muted mt-1">
          {lesson.type || "video"} • {when}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <a
            href={lesson.url}
            target="_blank"
            rel="noreferrer"
            className="btn-surface text-xs px-3 py-1"
          >
            Open
          </a>
          <Link
            to={`/lesson/${lesson._id}`}
            className="text-xs text-classroom-muted hover:underline"
          >
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}
