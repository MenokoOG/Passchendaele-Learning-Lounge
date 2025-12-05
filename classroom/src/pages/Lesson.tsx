import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getRaw, rewriteRaw } from "../api";

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const [doc, setDoc] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const [rewritten, setRewritten] = useState<string | null>(null);

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
      alert(
        "Rewrite finished — scroll to see result and check console for raw response."
      );
      console.log("rewrite response", res);
    } catch (err: any) {
      console.error(err);
      alert("Rewrite failed: " + (err?.message || String(err)));
    } finally {
      setRewriting(false);
    }
  }

  if (loading) return <div>Loading lesson...</div>;
  if (!doc)
    return (
      <div className="space-y-4">
        <div>Lesson not found.</div>
        <Link to="/" className="text-blue-400">
          Back
        </Link>
      </div>
    );

  // detect youtube id
  const youTubeMatch = (doc.url || "").match(
    /(?:v=|\/embed\/|youtu\.be\/)([A-Za-z0-9_-]{6,})/
  );
  const title = doc.title || doc.metadata?.ogTitle || doc.url;
  const sections = doc.metadata?.sections || [];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <div className="text-sm text-slate-400">
            {doc.type} • Fetched: {new Date(doc.fetchedAt).toLocaleString()}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onRewrite}
            disabled={rewriting}
            className="px-3 py-2 bg-emerald-600 rounded text-sm"
          >
            {rewriting ? "Rewriting…" : "Rewrite (OpenAI)"}
          </button>
          <a
            href={doc.url}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 bg-slate-700 rounded text-sm"
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
          ></iframe>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <section className="bg-slate-800 p-4 rounded">
            <h3 className="font-semibold mb-2">Lesson content</h3>
            {doc.contentHtml ? (
              <div
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: doc.contentHtml }}
              />
            ) : (
              <pre className="whitespace-pre-wrap text-sm text-slate-300">
                {doc.text || "(no text)"}
              </pre>
            )}
          </section>

          {rewritten ? (
            <section className="bg-emerald-900/20 border border-emerald-800 p-4 rounded">
              <h3 className="font-semibold mb-2">Rewrite (OpenAI)</h3>
              <div className="whitespace-pre-wrap text-slate-100 text-sm">
                {rewritten}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="bg-slate-800 p-4 rounded">
          <h4 className="font-semibold">Sections</h4>
          <div className="mt-3 space-y-2 max-h-96 overflow-auto">
            {sections.length === 0 && (
              <div className="text-sm text-slate-400">
                No sections available.
              </div>
            )}
            {sections.map((s: any, idx: number) => (
              <div key={idx} className="p-2 bg-slate-900/40 rounded">
                {s.heading ? (
                  <div className="font-medium">{s.heading}</div>
                ) : (
                  <div className="font-medium">Part {idx + 1}</div>
                )}
                <div className="text-xs text-slate-400 mt-1">
                  {(s.text || "").slice(0, 140)}
                  {(s.text || "").length > 140 ? "…" : ""}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <div>
        <Link to="/" className="text-slate-300">
          ← Back to lessons
        </Link>
      </div>
    </div>
  );
}
