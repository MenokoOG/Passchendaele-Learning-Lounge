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
  const [toast, setToast] = useState<{ msg: string; type?: any } | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getRaw(id)
      .then((d) => setDoc(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  async function onRewrite() {
    if (!id) return;
    setRewriting(true);
    try {
      const res = await rewriteRaw(id);
      setRewritten(res.rewritten || "(no content)");
      setToast({ msg: "Rewrite complete", type: "success" });
      console.log("rewrite response", res);
    } catch (err: any) {
      console.error(err);
      setToast({ msg: "Rewrite failed", type: "error" });
    } finally {
      setRewriting(false);
    }
  }

  function copyUrl() {
    try {
      const url = window.location.href;
      navigator.clipboard
        ?.writeText(url)
        .then(() => setToast({ msg: "URL copied", type: "success" }))
        .catch(() => setToast({ msg: "Copied (fallback)", type: "info" }));
    } catch {
      setToast({ msg: "Could not copy URL", type: "error" });
    }
  }

  function shareUrl() {
    const url = window.location.href;
    if ((navigator as any).share) {
      (navigator as any)
        .share({ title: doc?.title || "Lesson", url })
        .catch((e: any) => setToast({ msg: "Share cancelled", type: "info" }));
    } else {
      // fallback: copy + toast
      navigator.clipboard
        ?.writeText(url)
        .then(() => setToast({ msg: "Link copied for sharing", type: "info" }))
        .catch(() => setToast({ msg: "Share not available", type: "error" }));
    }
  }

  if (loading) return <div>Loading lesson...</div>;
  if (!doc)
    return (
      <div className="space-y-4">
        <div>Lesson not found.</div>
        <Link to="/" className="text-classroom-primary-600 dark:text-amber-300">
          Back
        </Link>
      </div>
    );

  const youTubeMatch = (doc.url || "").match(
    /(?:v=|\/embed\/|youtu\.be\/)([A-Za-z0-9_-]{6,})/
  );
  const title = doc.title || doc.metadata?.ogTitle || doc.url;
  const sections = doc.metadata?.sections || [];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {title}
          </h2>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {doc.type} • Fetched: {new Date(doc.fetchedAt).toLocaleString()}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onRewrite}
            disabled={rewriting}
            className="px-3 py-2 rounded text-white text-sm hover:brightness-95 disabled:opacity-60"
            style={{ backgroundColor: "#0ea5a4" }}
          >
            {rewriting ? "Rewriting…" : "Rewrite (OpenAI)"}
          </button>

          <button
            onClick={copyUrl}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded text-sm text-slate-900 dark:text-slate-100"
          >
            Copy URL
          </button>

          <button
            onClick={shareUrl}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded text-sm text-slate-900 dark:text-slate-100"
          >
            Share
          </button>

          <a
            href={doc.url}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded text-sm text-slate-900 dark:text-slate-100"
          >
            Original
          </a>
        </div>
      </div>

      {youTubeMatch ? (
        <div className="aspect-video bg-black">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${youTubeMatch[1]}`}
            title="lecture"
            frameBorder="0"
            allowFullScreen
          />
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <section className="rounded-lg p-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <h3 className="font-semibold mb-2 text-slate-900 dark:text-slate-100">
              Lesson content
            </h3>
            {doc.contentHtml ? (
              <div
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: doc.contentHtml }}
              />
            ) : (
              <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
                {doc.text || "(no text)"}
              </pre>
            )}
          </section>

          {rewritten ? (
            <section className="rounded-lg p-4 border border-emerald-800/20 bg-emerald-900/5 dark:bg-emerald-900/10">
              <h3 className="font-semibold mb-2 text-emerald-900 dark:text-emerald-200">
                Rewrite (OpenAI)
              </h3>
              <div className="whitespace-pre-wrap text-slate-900 dark:text-slate-100 text-sm">
                {rewritten}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="rounded-lg p-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <h4 className="font-semibold text-slate-900 dark:text-slate-100">
            Sections
          </h4>
          <div className="mt-3 space-y-2 max-h-96 overflow-auto">
            {sections.length === 0 && (
              <div className="text-sm text-slate-500 dark:text-slate-400">
                No sections available.
              </div>
            )}
            {sections.map((s: any, idx: number) => (
              <div
                key={idx}
                className="p-2 bg-slate-50 dark:bg-slate-900/40 rounded"
              >
                {s.heading ? (
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    {s.heading}
                  </div>
                ) : (
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    Part {idx + 1}
                  </div>
                )}
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
        <Link to="/" className="text-slate-700 dark:text-slate-300">
          ← Back to lessons
        </Link>
      </div>

      <Toast
        visible={!!toast}
        message={toast?.msg || ""}
        type={toast?.type || "info"}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
