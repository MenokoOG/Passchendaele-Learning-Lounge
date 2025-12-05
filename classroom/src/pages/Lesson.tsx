// src/pages/Lesson.tsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getRaw, rewriteRaw } from "../api";
import Toast from "../components/Toast";
import PrettyContent from "../components/PrettyContent";

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const [doc, setDoc] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const [rewritten, setRewritten] = useState<string | null>(null);

  // toast state
  const [toast, setToast] = useState<{
    message: string;
    type?: "success" | "error" | "info";
    visible: boolean;
  } | null>(null);

  function showToast(
    message: string,
    type: "success" | "error" | "info" = "info"
  ) {
    setToast({ message, type, visible: true });
  }

  function hideToast() {
    setToast(null);
  }

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getRaw(id)
      .then((d) => setDoc(d))
      .catch((e) => {
        console.error(e);
        showToast("Failed to load lesson", "error");
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function onRewrite() {
    if (!id) return;
    setRewriting(true);
    try {
      const res = await rewriteRaw(id);
      setRewritten(res.rewritten || "(no content)");
      // keep the previous alert behavior replaced with toast
      showToast("Rewrite finished", "success");
      console.log("rewrite response", res);
    } catch (err: any) {
      console.error(err);
      showToast("Rewrite failed", "error");
    } finally {
      setRewriting(false);
    }
  }

  if (loading) return <div>Loading lesson...</div>;
  if (!doc)
    return (
      <div className="space-y-4">
        <div>Lesson not found.</div>
        <Link to="/" className="text-blue-500">
          Back
        </Link>
      </div>
    );

  const youTubeMatch = (doc.url || "").match(
    /(?:v=|\/embed\/|youtu\.be\/)([A-Za-z0-9_-]{6,})/
  );
  const title = doc.title || doc.metadata?.ogTitle || doc.url;
  const sections = doc.metadata?.sections || [];

  // returns true if copy succeeded
  async function copyUrl(): Promise<boolean> {
    const url = `${window.location.origin}/lesson/${id}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        showToast("Link copied to clipboard", "success");
        return true;
      } else {
        // fallback older browsers
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.setAttribute("readonly", "");
        ta.style.position = "absolute";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        ta.remove();
        if (ok) {
          showToast("Link copied to clipboard", "success");
          return true;
        } else {
          showToast("Copy not supported", "error");
          return false;
        }
      }
    } catch (err) {
      console.error("copy failed", err);
      showToast("Copy failed", "error");
      return false;
    }
  }

  async function onShare() {
    const url = `${window.location.origin}/lesson/${id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: title || "Lesson",
          text: `Check out this lesson: ${title}`,
          url,
        });
        showToast("Shared successfully", "success");
      } else {
        // fallback: copy & toast
        const ok = await copyUrl();
        if (ok) {
          showToast("Sharing not supported — link copied", "info");
        } else {
          showToast("Sharing not supported and copy failed", "error");
        }
      }
    } catch (err) {
      console.error("share failed", err);
      showToast("Share failed", "error");
    }
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {title}
            </h2>
            <div className="text-sm text-slate-600 dark:text-slate-300">
              {doc.type} • Fetched: {new Date(doc.fetchedAt).toLocaleString()}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRewrite}
              disabled={rewriting}
              className="px-3 py-2 rounded bg-emerald-500 text-white text-sm hover:brightness-95 disabled:opacity-60"
            >
              {rewriting ? "Rewriting…" : "Rewrite (OpenAI)"}
            </button>

            <a
              href={doc.url}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 rounded bg-slate-100 dark:bg-slate-700 text-sm border border-slate-200/60 dark:border-slate-700/60"
            >
              Original
            </a>

            <button
              onClick={() => copyUrl()}
              className="px-3 py-2 rounded bg-slate-100 dark:bg-slate-700 text-sm border border-slate-200/60 dark:border-slate-700/60"
              title="Copy lesson URL"
            >
              Copy URL
            </button>

            <button
              onClick={onShare}
              className="px-3 py-2 rounded bg-slate-100 dark:bg-slate-700 text-sm border border-slate-200/60 dark:border-slate-700/60"
              title="Share"
            >
              Share
            </button>
          </div>
        </div>

        {youTubeMatch && (
          <div className="w-full aspect-video bg-black rounded overflow-hidden">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${youTubeMatch[1]}`}
              title="lecture"
              frameBorder="0"
              allowFullScreen
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <section className="bg-white dark:bg-slate-800 p-4 rounded border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
              <h3 className="font-semibold mb-3 text-slate-900 dark:text-slate-100">
                Lesson content
              </h3>

              {doc.contentHtml ? (
                <div
                  className="prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: doc.contentHtml }}
                />
              ) : (
                <div className="bg-white dark:bg-slate-800 p-4 rounded border border-slate-200/60 dark:border-slate-700/60">
                  <PrettyContent text={doc.text || "(no text)"} />
                </div>
              )}
            </section>

            {rewritten && (
              <section className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 p-4 rounded">
                <h3 className="font-semibold mb-2 text-emerald-900 dark:text-emerald-200">
                  Rewrite (OpenAI)
                </h3>
                <div className="whitespace-pre-wrap text-slate-900 dark:text-slate-100 text-sm">
                  {rewritten}
                </div>
              </section>
            )}
          </div>

          <aside className="bg-white dark:bg-slate-800 p-4 rounded border border-slate-200/60 dark:border-slate-700/60 shadow-sm sticky top-24 max-h-[60vh] overflow-auto">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100">
              Sections
            </h4>
            <div className="mt-3 space-y-2">
              {sections.length === 0 && (
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  No sections available.
                </div>
              )}
              {sections.map((s: any, idx: number) => (
                <div
                  key={idx}
                  className="p-2 rounded bg-slate-50 dark:bg-slate-900/40"
                >
                  <div className="font-medium text-slate-800 dark:text-slate-100">
                    {s.heading || `Part ${idx + 1}`}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    {(s.text || "").slice(0, 140)}
                    {(s.text || "").length > 140 ? "…" : ""}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>

        <div>
          <Link to="/" className="text-slate-700 dark:text-slate-200">
            ← Back to lessons
          </Link>
        </div>
      </div>

      {/* Toast */}
      <Toast
        visible={!!toast?.visible}
        message={toast?.message ?? ""}
        type={toast?.type ?? "info"}
        onClose={hideToast}
        duration={3000}
      />
    </>
  );
}
