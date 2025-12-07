import React from "react";

export default function SkeletonCard() {
  return (
    <article className="card-surface border border-surface-border p-4 rounded shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="h-5 bg-surface-shimmer rounded w-3/4 mb-2" />
          <div className="h-3 bg-surface-shimmer rounded w-1/2" />
        </div>

        <div className="w-12 h-8 bg-surface-shimmer rounded" />
      </div>

      <div className="mt-4">
        <div className="h-3 bg-surface-shimmer rounded w-full mb-2" />
        <div className="h-3 bg-surface-shimmer rounded w-5/6" />
      </div>
    </article>
  );
}
