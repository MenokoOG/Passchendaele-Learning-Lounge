// src/pages/Lessons.tsx
import React, { useEffect, useState } from "react";
import { listRaw } from "../api";
import LessonCard from "../components/LessonCard";

export default function Lessons() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await listRaw();
      setLessons(
        (data || []).sort(
          (a: any, b: any) =>
            new Date(b.fetchedAt).valueOf() - new Date(a.fetchedAt).valueOf()
        )
      );
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
              <LessonCard key={i} loading />
            ))}
          </div>
        )}

        {!loading && (
          <div className="space-y-4">
            {lessons.map((l) => (
              <LessonCard key={l._id} lesson={l} />
            ))}
            {lessons.length === 0 && !loading && (
              <div className="text-slate-300">
                No lessons found — try running the scraper.
              </div>
            )}
          </div>
        )}
      </div>

      <aside className="bg-slate-800 p-4 rounded">
        <h3 className="font-semibold mb-2">Quick Actions</h3>
        <p className="mb-3 text-sm text-slate-300">
          If you haven't scraped yet, use your server or run the scraper script.
        </p>
        <div className="text-sm text-slate-300">
          API:{" "}
          <code className="text-xs">
            {import.meta.env.VITE_API_URL || "http://localhost:4000"}
          </code>
        </div>
      </aside>
    </div>
  );
}
