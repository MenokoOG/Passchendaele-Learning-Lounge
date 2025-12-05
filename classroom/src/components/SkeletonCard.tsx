// src/components/SkeletonCard.tsx
import React from "react";

export default function SkeletonCard() {
  return (
    <article className="animate-pulse rounded-lg p-4 border bg-white dark:bg-slate-800 border-slate-200/60 dark:border-slate-700 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
        </div>

        <div className="w-12 h-8 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>

      <div className="mt-4">
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2" />
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
      </div>
    </article>
  );
}
