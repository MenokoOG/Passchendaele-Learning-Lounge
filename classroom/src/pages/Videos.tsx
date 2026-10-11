// src/pages/Videos.tsx
import React, { useEffect, useState } from "react";
import { listRaw } from "../api/api";
import VideoCard from "../components/VideoCard";
import SkeletonCard from "../components/SkeletonCard";
import ReaderOverlay from "../components/ReaderOverlay";
import ReaderPrefs, { ReaderPrefsShape } from "../components/ReaderPrefs";

/**
 * Basic video detection (same heuristics used elsewhere)
 */
function isVideoLesson(l: any) {
  if (!l) return false;
  if (String(l.type).toLowerCase() === "youtube") return true;
  if (l.metadata?.ogType === "video") return true;
  if (l.url && /(?:youtube\.com|youtu\.be)/i.test(l.url)) return true;
  return false;
}

/** Best-effort extractor: prefer HTML content, fall back to raw text or metadata. */
function extractTextFromLesson(lesson: any) {
  try {
    const html = lesson?.contentHtml || lesson?.html || "";
    if (html) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const article = doc.querySelector("article, main, #content");
      const text = (article || doc.body).textContent || "";
      // Normalize whitespace and group paragraphs
      return (text || "").replace(/\s{2,}/g, "\n\n").trim();
    }
  } catch {
    // ignore parse errors
  }

  if (lesson?.text) {
    return String(lesson.text)
      .replace(/\s{2,}/g, "\n\n")
      .trim();
  }

  if (lesson?.metadata?.ogDescription) {
    return String(lesson.metadata.ogDescription);
  }

  if (lesson?.url) {
    return `Open the video source: ${lesson.url}`;
  }

  return "";
}

export default function Videos() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Reader state
  const [readerOpen, setReaderOpen] = useState(false);
  const [readerText, setReaderText] = useState<string>("");
  const [readerPrefs, setReaderPrefs] = useState<ReaderPrefsShape | null>(null);

  // Load video items
  async function load() {
    setLoading(true);
    try {
      const data = await listRaw();
      const onlyVideos = (data || []).filter((d: any) => isVideoLesson(d));
      // sort ascending (oldest -> newest)
      onlyVideos.sort((a: any, b: any) => {
        const ta = a?.fetchedAt ? new Date(a.fetchedAt).valueOf() : 0;
        const tb = b?.fetchedAt ? new Date(b.fetchedAt).valueOf() : 0;
        return ta - tb;
      });
      setVideos(onlyVideos);
    } catch (err) {
      console.error("Failed to load videos:", err);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // load saved reader prefs
    try {
      const raw = localStorage.getItem("m3_reader_prefs_v1");
      if (raw) setReaderPrefs(JSON.parse(raw));
    } catch {}
  }, []);

  // Save prefs callback (persist)
  const handleSavePrefs = (prefs: ReaderPrefsShape) => {
    try {
      localStorage.setItem("m3_reader_prefs_v1", JSON.stringify(prefs));
      setReaderPrefs(prefs);
    } catch {}
  };

  // Handler passed to VideoCard: extracts text and opens overlay
  const openReaderFor = (lesson: any) => {
    const text = extractTextFromLesson(lesson);
    if (!text) {
      // If no text, tell user but still allow opening overlay with fallback message
      setReaderText(
        `No readable transcript or preview available for this video.\n\nSource: ${
          lesson.url || "(unknown)"
        }`
      );
    } else {
      setReaderText(text);
    }
    setReaderOpen(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <h2 className="text-3xl font-black mb-2">Film and voices</h2>
        <p className="mb-4 text-classroom-muted max-w-[64ch]">Film and recorded testimony linked from the sources, where an archive provides it.</p>

        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {!loading && (
          <div className="space-y-4">
            {videos.map((v) => (
              <VideoCard
                key={v._id}
                lesson={v}
                onOpenReader={() => openReaderFor(v)}
              />
            ))}

            {videos.length === 0 && !loading && (
              <div className="text-classroom-muted">
                No videos found — try running the scraper or check your raw
                data.
              </div>
            )}
          </div>
        )}
      </div>

      <aside className="card-surface border border-surface-border p-4 rounded">
        <h3 className="font-semibold mb-2">Reader Preferences</h3>
        <p className="mb-3 text-sm text-classroom-muted">
          Adjust preferences used by the reader when opening video transcripts.
        </p>

        <ReaderPrefs
          initialPrefs={
            readerPrefs ?? {
              fontScale: 1.45,
              lineHeight: 1.9,
              letterSpacing: 0.02,
            }
          }
          onSave={handleSavePrefs}
        />

        <div className="mt-4 text-sm text-classroom-muted">
          API:{" "}
          <code className="text-xs">
            {import.meta.env.VITE_API_URL || "http://localhost:4000"}
          </code>
        </div>
      </aside>

      <ReaderOverlay
        open={readerOpen}
        text={readerText}
        fontScale={readerPrefs?.fontScale ?? 1.45}
        lineHeight={readerPrefs?.lineHeight ?? 1.9}
        letterSpacing={
          (typeof readerPrefs?.letterSpacing === "number"
            ? `${readerPrefs.letterSpacing}em`
            : "0.02em") as any
        }
        onClose={() => setReaderOpen(false)}
      />
    </div>
  );
}
