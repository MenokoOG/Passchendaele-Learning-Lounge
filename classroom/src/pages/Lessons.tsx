// src/pages/Lessons.tsx
import React, { useEffect, useState } from "react";
import { listRaw } from "../api";
import LessonCard from "../components/LessonCard";
import SkeletonCard from "../components/SkeletonCard";

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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Lessons
          </h2>
          <div className="text-sm text-slate-600 dark:text-slate-300">
            {loading ? "Loading…" : `${lessons.length} lessons`}
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            // show a small grid of skeleton cards while loading
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              {lessons.length === 0 && !loading && (
                <div className="text-slate-500 dark:text-slate-400">
                  No lessons found — try running the scraper.
                </div>
              )}

              {lessons.map((l) => (
                <LessonCard key={l._id} lesson={l} />
              ))}
            </>
          )}
        </div>
      </div>

      <aside className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200/60 dark:border-slate-700 shadow-sm">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Quick Actions
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
          If you haven't scraped yet, run the scraper or use the server script.
        </p>

        <div className="text-xs text-slate-700 dark:text-slate-300">
          API:
          <div className="mt-1">
            <code className="rounded px-2 py-1 bg-slate-100 dark:bg-slate-700">
              {import.meta.env.VITE_API_URL || "http://localhost:4000"}
            </code>
          </div>
        </div>
      </aside>
    </div>
  );
}
