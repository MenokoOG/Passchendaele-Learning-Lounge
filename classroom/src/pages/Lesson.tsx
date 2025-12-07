// src/pages/Lesson.tsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getRaw, rewriteRaw } from "../api";
import Toast from "../components/Toast";

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const [doc, setDoc] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const [rewritten, setRewritten] = useState<string | null>(null);

  // Toast state (message, type, visible)
  const [toast, setToast] = useState<{
    msg: string;
    type?: "success" | "error" | "info";
    visible?: boolean;
  } | null>(null);

  function showToast(msg: string, type: "success" | "error" | "info" = "info") {
    setToast({ msg, type, visible: true });
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
        console.error("getRaw error", e);
        showToast("Failed to load lesson", "error");
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function onRewrite() {
    if (!id) return;
    setRewriting(true);
    try {
      const res = await rewriteRaw(id);
      setRewritten(res?.rewritten || "(no content)");
      showToast("Rewrite finished", "success");
      console.log("rewrite response", res);
    } catch (err: any) {
      console.error("rewrite error", err);
      showToast("Rewrite failed", "error");
    } finally {
      setRewriting(false);
    }
  }

  async function copyUrl() {
    const url = `${window.location.origin}/lesson/${id}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        showToast("Link copied to clipboard", "success");
      } else {
        // Legacy fallback
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.setAttribute("readonly", "");
        ta.style.position = "absolute";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        ta.remove();
        if (ok) showToast("Link copied (fallback)", "success");
        else showToast("Copy not supported", "error");
      }
    } catch (err) {
      console.error("copy failed", err);
      showToast("Copy failed", "error");
    }
  }

  async function onShare() {
    const url = `${window.location.origin}/lesson/${id}`;
    try {
      if ((navigator as any).share) {
        await (navigator as any).share({
          title: doc?.title || "Lesson",
          text: `Check out this lesson: ${doc?.title || ""}`,
          url,
        });
        showToast("Shared successfully", "success");
      } else {
        // fallback: copy & toast
        await copyUrl();
        showToast("Sharing not supported — link copied", "info");
      }
    } catch (err) {
      console.error("share failed", err);
      showToast("Share failed", "error");
    }
  }

  if (loading) return <div>Loading lesson...</div>;

  if (!doc)
    return (
      <div className="space-y-4">
        <div className="text-classroom-muted">Lesson not found.</div>
        <Link to="/" className="text-classroom">
          ← Back
        </Link>
      </div>
    );

  const youTubeMatch = (doc.url || "").match(
    /(?:v=|\/embed\/|youtu\.be\/)([A-Za-z0-9_-]{6,})/
  );
  const title = doc.title || doc.metadata?.ogTitle || doc.url;
  const sections = doc.metadata?.sections || [];

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-classroom">{title}</h2>
            <div className="text-sm text-classroom-muted">
              {doc.type} • Fetched: {new Date(doc.fetchedAt).toLocaleString()}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRewrite}
              disabled={rewriting}
              className="px-3 py-2 rounded btn-classroom text-sm disabled:opacity-60"
              aria-pressed={rewriting}
            >
              {rewriting ? "Rewriting…" : "Rewrite (OpenAI)"}
            </button>

            <a
              href={doc.url}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 rounded btn-surface text-sm"
            >
              Original
            </a>

            <button
              onClick={copyUrl}
              className="px-3 py-2 rounded btn-surface text-sm"
              title="Copy lesson URL"
            >
              Copy URL
            </button>

            <button
              onClick={onShare}
              className="px-3 py-2 rounded btn-surface text-sm"
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
            <section className="card-surface p-4 rounded border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
              <h3 className="font-semibold mb-3 text-classroom">
                Lesson content
              </h3>

              {doc.contentHtml ? (
                <div
                  className="prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: doc.contentHtml }}
                />
              ) : (
                <div className="card-surface p-4 rounded border border-slate-200/60 dark:border-slate-700/60">
                  <pre className="whitespace-pre-wrap text-sm text-classroom">
                    {doc.text || "(no text)"}
                  </pre>
                </div>
              )}
            </section>

            {rewritten && (
              <section className="bg-success-surface border border-transparent p-4 rounded">
                <h3 className="font-semibold mb-2 text-success">
                  Rewrite (OpenAI)
                </h3>
                <div className="whitespace-pre-wrap text-classroom text-sm">
                  {rewritten}
                </div>
              </section>
            )}
          </div>

          <aside className="card-surface p-4 rounded border border-slate-200/60 dark:border-slate-700/60 shadow-sm sticky top-24 max-h-[60vh] overflow-auto">
            <h4 className="font-semibold text-classroom">Sections</h4>
            <div className="mt-3 space-y-2">
              {sections.length === 0 && (
                <div className="text-sm text-classroom-muted">
                  No sections available.
                </div>
              )}
              {sections.map((s: any, idx: number) => (
                <div
                  key={idx}
                  className="p-2 bg-classroom-surface-2 rounded"
                  aria-hidden={false}
                >
                  <div className="font-medium text-classroom">
                    {s.heading || `Part ${idx + 1}`}
                  </div>
                  <div className="text-xs text-classroom-muted mt-1">
                    {(s.text || "").slice(0, 140)}
                    {(s.text || "").length > 140 ? "…" : ""}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>

        <div>
          <Link to="/" className="text-classroom-muted">
            ← Back to lessons
          </Link>
        </div>
      </div>

      <Toast
        visible={!!toast?.visible}
        message={toast?.msg ?? ""}
        type={toast?.type ?? "info"}
        onClose={hideToast}
        duration={3000}
      />
    </>
  );
}
