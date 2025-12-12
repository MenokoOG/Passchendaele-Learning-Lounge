// src/pages/Lessons.tsx
import React, { useEffect, useState } from "react";
import { listRaw } from "../api/api";
import LessonCard from "../components/LessonCard";
import SkeletonCard from "../components/SkeletonCard";
import ReaderOverlay from "../components/ReaderOverlay";
import ReaderPrefs, { ReaderPrefsShape } from "../components/ReaderPrefs";

/* same isVideoLesson helper as before */
function isVideoLesson(l: any) {
  if (!l) return false;
  if (String(l.type).toLowerCase() === "youtube") return true;
  if (l.metadata?.ogType === "video") return true;
  if (l.url && /(?:youtube\.com|youtu\.be)/i.test(l.url)) return true;
  return false;
}

function extractTextFromLesson(lesson: any) {
  try {
    const html = lesson?.contentHtml || lesson?.html || "";
    if (html) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const article = doc.querySelector("article, main, #content");
      const text = (article || doc.body).textContent || "";
      return (text || "").replace(/\s{2,}/g, "\n\n").trim();
    }
  } catch {}
  if (lesson?.text)
    return String(lesson.text)
      .replace(/\s{2,}/g, "\n\n")
      .trim();
  if (lesson?.metadata?.ogDescription)
    return String(lesson.metadata.ogDescription);
  if (lesson?.url) return `Open source: ${lesson.url}`;
  return "";
}

export default function Lessons() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Reader state (shared across lessons)
  const [readerOpen, setReaderOpen] = useState(false);
  const [readerText, setReaderText] = useState<string>("");
  const [readerPrefs, setReaderPrefs] = useState<ReaderPrefsShape | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await listRaw();
      const onlyPages = (data || []).filter((d: any) => !isVideoLesson(d));
      onlyPages.sort((a: any, b: any) => {
        const ta = a?.fetchedAt ? new Date(a.fetchedAt).valueOf() : 0;
        const tb = b?.fetchedAt ? new Date(b.fetchedAt).valueOf() : 0;
        return ta - tb;
      });
      setLessons(onlyPages);
    } catch (err) {
      console.error(err);
      setLessons([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    try {
      const raw = localStorage.getItem("m3_reader_prefs_v1");
      if (raw) setReaderPrefs(JSON.parse(raw));
    } catch {}
  }, []);

  const handleSavePrefs = (prefs: ReaderPrefsShape) => {
    try {
      localStorage.setItem("m3_reader_prefs_v1", JSON.stringify(prefs));
      setReaderPrefs(prefs);
    } catch {}
  };

  const openReaderFor = (lesson: any) => {
    const text = extractTextFromLesson(lesson);
    setReaderText(
      text ||
        `No readable preview available.\n\nSource: ${lesson.url || "(unknown)"}`
    );
    setReaderOpen(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <h2 className="text-xl font-semibold mb-4">Lessons</h2>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {lessons.map((l) => (
              <LessonCard key={l._id} lesson={l} onOpenReader={openReaderFor} />
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
        <h3 className="font-semibold mb-2">Reader Preferences</h3>
        <p className="mb-3 text-sm text-classroom-muted">
          Set reading preferences for the overlay.
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
