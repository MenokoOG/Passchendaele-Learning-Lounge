// src/pages/Videos.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listRaw } from "../api/api";
import VideoCard from "../components/VideoCard";
import SkeletonCard from "../components/SkeletonCard";

function isVideoLesson(l: any) {
  if (!l) return false;
  if (String(l.type).toLowerCase() === "youtube") return true;
  if (l.metadata?.ogType === "video") return true;
  if (l.url && /(?:youtube\.com|youtu\.be)/i.test(l.url)) return true;
  return false;
}

export default function Videos() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await listRaw();
      const vids = (data || []).filter(isVideoLesson);

      // sort oldest -> newest for playback order; change if you prefer newest first
      vids.sort((a: any, b: any) => {
        const ta = a?.fetchedAt ? new Date(a.fetchedAt).valueOf() : 0;
        const tb = b?.fetchedAt ? new Date(b.fetchedAt).valueOf() : 0;
        return ta - tb;
      });

      setVideos(vids);
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
    <div className="space-y-4">
      {/* Breadcrumb / Back */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="btn-surface px-3 py-1 text-sm">
            ← Back to lessons
          </Link>
          <h2 className="text-xl font-semibold m-0">Videos</h2>
          <div className="text-sm text-classroom-muted ml-2">
            ({videos.length || 0} found)
          </div>
        </div>

        <div className="text-sm text-classroom-muted">
          Videos are separated from course content for focused playback.
        </div>
      </div>

      {loading && (
        <div className="space-y-4" aria-busy="true" role="status">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!loading && (
        <>
          {videos.length === 0 ? (
            <div className="text-classroom-muted">
              No videos found — run a scrape that includes lecture videos.
            </div>
          ) : (
            <div className="space-y-4">
              {videos.map((v) => (
                <VideoCard key={v._id} lesson={v} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
