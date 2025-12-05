import React from "react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";

export default function LessonCard({ lesson }: { lesson: any }) {
  const title = lesson.title || lesson.metadata?.ogTitle || lesson.url;
  const when = lesson.fetchedAt ? dayjs(lesson.fetchedAt).format("MMM D, YYYY HH:mm") : "Unknown";
  return (
    <div className="bg-slate-800 p-4 rounded border border-slate-700">
      <div className="flex items-start justify-between">
        <div>
          <Link to={`/lesson/${lesson._id}`} className="text-lg font-medium text-slate-100 hover:underline">
            {title}
          </Link>
          <div className="text-sm text-slate-400 mt-1">{lesson.type} • {when}</div>
        </div>
        <div className="ml-4">
          <a href={lesson.url} target="_blank" rel="noreferrer" className="text-xs px-2 py-1 bg-slate-700 rounded">Open Source</a>
        </div>
      </div>
      <p className="mt-3 text-slate-300 text-sm line-clamp-3">{(lesson.text || "").slice(0,300) || "No preview available."}</p>
    </div>
  );
}