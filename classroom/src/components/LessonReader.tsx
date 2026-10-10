// src/components/LessonReader.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";

type Props = {
  rawId: string;
  initialHtml?: string | null;
  initialText?: string | null;
};

export default function LessonReader({
  rawId,
  initialHtml,
  initialText,
}: Props) {
  const [simplified, setSimplified] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // reset when lesson changes
    setSimplified(null);
    setError(null);
    setShowOriginal(false);
  }, [rawId]);

  async function simplify() {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(
        `/api/raw/${rawId}/rewrite`,
        {
          style:
            "Explain like I'm 10. Use short sentences, simple words, and 3-5 key takeaways.",
          force: true,
        },
        { timeout: 120000 }
      );
      if (res?.data?.rewritten) {
        setSimplified(res.data.rewritten);
      } else {
        setError("No simplified text returned");
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  // sanitize by showing plain text for simplified output and trimmed HTML for original
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowOriginal(false)}
          className={`px-3 py-1 rounded ${
            !showOriginal ? "bg-classroom text-white" : "btn-surface"
          }`}
        >
          Simplified view
        </button>
        <button
          onClick={() => setShowOriginal(true)}
          className={`px-3 py-1 rounded ${
            showOriginal ? "bg-classroom text-white" : "btn-surface"
          }`}
        >
          Original view
        </button>

        <div className="ml-auto flex items-center gap-2">
          {!simplified ? (
            <button
              onClick={simplify}
              disabled={loading}
              className="btn-classroom"
            >
              {loading ? "Simplifying…" : "Simplify (E.L.I.10)"}
            </button>
          ) : (
            <button onClick={() => setSimplified(null)} className="btn-surface">
              Clear simplified
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-100 text-red-800 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div
        className="card-surface p-4 prose"
        style={{ lineHeight: "var(--reader-line-height, 1.7)" }}
      >
        {simplified && !showOriginal ? (
          // Show simplified plain text (it may contain markdown/pseudo-markdown)
          <div style={{ fontFamily: "var(--reader-font-family, inherit)" }}>
            {simplified.split("\n").map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        ) : showOriginal ? (
          <div
            // Danger: assuming contentHtml is sanitized server-side. If not, render as text instead.
            dangerouslySetInnerHTML={{
              __html:
                initialHtml ||
                (initialText
                  ? `<pre>${initialText}</pre>`
                  : "<em>(no content)</em>"),
            }}
            style={{ fontFamily: "var(--reader-font-family, inherit)" }}
          />
        ) : (
          // Default show a trimmed text preview
          <div style={{ fontFamily: "var(--reader-font-family, inherit)" }}>
            {initialText ? (
              initialText
                .split(/\n+/)
                .map((p) => p.replace(/\s+/g, " ").trim())
                .filter(Boolean)
                .slice(0, 12)
                .map((p, i) => <p key={i}>{p}</p>)
            ) : initialHtml ? (
              <div dangerouslySetInnerHTML={{ __html: initialHtml }} />
            ) : (
              <em>(no content available)</em>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
