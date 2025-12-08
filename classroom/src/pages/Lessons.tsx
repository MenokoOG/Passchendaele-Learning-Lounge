// src/pages/Lessons.tsx
import React, { useEffect, useState } from "react";
import { listRaw } from "../api/api";
import LessonCard from "../components/LessonCard";
import SkeletonCard from "../components/SkeletonCard";

function isVideoLesson(l: any) {
  if (!l) return false;
  if (String(l.type).toLowerCase() === "youtube") return true;
  if (l.metadata?.ogType === "video") return true;
  if (l.url && /(?:youtube\.com|youtu\.be)/i.test(l.url)) return true;
  return false;
}

export default function Lessons() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await listRaw();
      // exclude videos from the lesson list
      const onlyPages = (data || []).filter((d: any) => !isVideoLesson(d));
      // sort ascending (oldest -> newest)
      onlyPages.sort((a: any, b: any) => {
        const ta = a?.fetchedAt ? new Date(a.fetchedAt).valueOf() : 0;
        const tb = b?.fetchedAt ? new Date(b.fetchedAt).valueOf() : 0;
        return ta - tb;
      });
      setLessons(onlyPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <h2 className="text-xl font-semibold mb-4">Lessons</h2>
        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {!loading && (
          <div className="space-y-4">
            {lessons.map((l) => (
              <LessonCard key={l._id} lesson={l} />
            ))}
            {lessons.length === 0 && !loading && (
              <div className="text-classroom-muted">
                No lessons found — try running the scraper.
              </div>
            )}
          </div>
        )}
      </div>

      <aside className="card-surface border border-surface-border p-4 rounded">
        <h3 className="font-semibold mb-2">Quick Actions</h3>
        <p className="mb-3 text-sm text-classroom-muted">
          If you haven't scraped yet, use your server or run the scraper script.
        </p>
        <div className="text-sm text-classroom-muted">
          API:{" "}
          <code className="text-xs">
            {import.meta.env.VITE_API_URL || "http://localhost:4000"}
          </code>
        </div>
      </aside>
    </div>
  );
}
