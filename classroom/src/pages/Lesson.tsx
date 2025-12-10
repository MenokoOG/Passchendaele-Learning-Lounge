// src/pages/Lesson.tsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getRaw, rewriteRaw, listRaw } from "../api/api";
import Toast from "../components/Toast";
import PrettyContent from "../components/PrettyContent";

/* ---------- helpers (sanitization + video extraction) ---------- */

function sanitizeAndEnhanceHtml(html?: string) {
  if (!html) return "";
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Make anchors open in a new tab & safe rel
    doc.querySelectorAll("a").forEach((a) => {
      const href = a.getAttribute("href");
      if (!href) return;
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
      a.classList.add("text-classroom", "underline");
    });

    return doc.body.innerHTML;
  } catch (err) {
    console.error("sanitize error", err);
    return html;
  }
}

function extractVideoLinksFromDoc(doc: any) {
  const out = new Set<string>();
  const addIfYouTube = (u?: string | null) => {
    if (!u) return;
    const m = String(u).match(
      /(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[A-Za-z0-9_\-]+)/i
    );
    if (m) out.add(m[0]);
  };

  addIfYouTube(doc?.url);

  try {
    if (doc?.contentHtml) {
      const parser = new DOMParser();
      const d = parser.parseFromString(doc.contentHtml, "text/html");
      d.querySelectorAll("a").forEach((a) => {
        const href = a.getAttribute("href");
        if (!href) return;
        if (/youtube\.com|youtu\.be/i.test(href)) out.add(href);
      });
    }
  } catch {}

  if (doc?.text) {
    const matches = String(doc.text).matchAll(/https?:\/\/[^\s)'"<>]+/gi);
    for (const m of matches) {
      const url = m[0];
      if (/youtube\.com|youtu\.be/i.test(url)) out.add(url);
    }
  }

  try {
    const sections = doc?.metadata?.sections || [];
    for (const s of sections) {
      const txt = String(s.html || s.text || "");
      const m = txt.matchAll(/https?:\/\/[^\s)'"<>]+/gi);
      for (const mm of m as any) {
        const u = mm[0];
        if (/youtube\.com|youtu\.be/i.test(u)) out.add(u);
      }
    }
  } catch {}

  return Array.from(out);
}

/* ---------- Component ---------- */

export default function LessonPage() {
  // --- router hooks (always first, stable) ---
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // --- state hooks (declare all up front) ---
  const [doc, setDoc] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const [rewritten, setRewritten] = useState<string | null>(null);

  const [lessonList, setLessonList] = useState<any[] | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type?: "success" | "error" | "info";
    visible: boolean;
  } | null>(null);

  // --- refs for TTS & other stable values ---
  const ttsUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speakingRef = useRef(false);

  // --- TTS helpers (stable callbacks) ---
  // inside your component (LessonPage / Lesson.tsx)

  const stopTTS = React.useCallback(() => {
    // stop any speaking, cleanup synth, timers, etc.
    try {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      // clear any interval/timeouts you created
    } catch (err) {
      console.warn("stopTTS error", err);
    }
  }, []);

  // Example: effect that registers something and cleans up by calling stopTTS
  React.useEffect(() => {
    // start something (TTS, audio, etc.)
    // DO NOT redeclare stopTTS here — use the stable callback defined above.
    return () => {
      // cleanup on unmount
      stopTTS();
    };
  }, [stopTTS]); // include stopTTS to make effect stable

  // IMPORTANT: always declare hooks (useState/useRef/useCallback/useEffect...) in the same order and unconditionally.
  const startTTS = useCallback(
    (text: string, opts?: { lang?: string; rate?: number; pitch?: number }) => {
      try {
        if (!("speechSynthesis" in window)) {
          console.warn("SpeechSynthesis not supported in this browser");
          return;
        }

        stopTTS(); // cancel any existing speech

        const utter = new SpeechSynthesisUtterance(
          String(text).slice(0, 200000)
        );
        utter.lang = opts?.lang ?? "en-US";
        if (typeof opts?.rate === "number") utter.rate = opts!.rate!;
        if (typeof opts?.pitch === "number") utter.pitch = opts!.pitch!;
        utter.onend = () => {
          speakingRef.current = false;
          ttsUtteranceRef.current = null;
        };
        utter.onerror = (e) => {
          console.error("TTS error", e);
          speakingRef.current = false;
          ttsUtteranceRef.current = null;
        };

        ttsUtteranceRef.current = utter;
        speakingRef.current = true;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utter);
      } catch (err) {
        console.error("startTTS failed", err);
      }
    },
    [stopTTS]
  );

  // --- Effects: cleanup and data loading (always after callbacks/declarations) ---
  useEffect(() => {
    return () => {
      // ensure TTS stopped on unmount
      try {
        stopTTS();
      } catch {}
    };
  }, [stopTTS]);

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

    // fetch list for prev/next (best-effort)
    listRaw()
      .then((arr) => {
        const sorted = (arr || [])
          .slice()
          .sort(
            (a: any, b: any) =>
              new Date(a.fetchedAt).valueOf() - new Date(b.fetchedAt).valueOf()
          );
        setLessonList(sorted);
      })
      .catch(() => setLessonList(null));
    // id is the only dependency needed here
  }, [id]);

  // --- helper functions (no hooks inside) ---
  function showToast(
    message: string,
    type: "success" | "error" | "info" = "info"
  ) {
    setToast({ message, type, visible: true });
  }
  function hideToast() {
    setToast(null);
  }

  async function onRewrite() {
    if (!id) return;
    setRewriting(true);
    try {
      const res = await rewriteRaw(id);
      setRewritten(res.rewritten || "(no content)");
      showToast("Rewrite finished", "success");
      console.log("rewrite response", res);
    } catch (err: any) {
      console.error(err);
      showToast("Rewrite failed", "error");
    } finally {
      setRewriting(false);
    }
  }

  // --- stable memoized helpers ---
  const currentIndex = useMemo(() => {
    if (!lessonList || !doc) return -1;
    return lessonList.findIndex((l) => String(l._id) === String(doc._id));
  }, [lessonList, doc]);

  const prevLesson = useMemo(() => {
    if (currentIndex > 0 && lessonList) return lessonList[currentIndex - 1];
    return null;
  }, [currentIndex, lessonList]);

  const nextLesson = useMemo(() => {
    if (lessonList && currentIndex >= 0 && currentIndex < lessonList.length - 1)
      return lessonList[currentIndex + 1];
    return null;
  }, [currentIndex, lessonList]);

  const goPrev = useCallback(() => {
    if (!prevLesson) return;
    navigate(`/lesson/${prevLesson._id}`);
  }, [navigate, prevLesson]);

  const goNext = useCallback(() => {
    if (!nextLesson) return;
    navigate(`/lesson/${nextLesson._id}`);
  }, [navigate, nextLesson]);

  const extractTextForReader = useCallback(() => {
    try {
      if (doc?.contentHtml) {
        const p = new DOMParser();
        const d = p.parseFromString(doc.contentHtml, "text/html");
        d.querySelectorAll("script, style, noscript").forEach((el) =>
          el.remove()
        );
        return d.body.textContent || "";
      }
      return String(doc?.text || doc?.metadata?.summary || doc?.url || "");
    } catch {
      return String(doc?.text || "");
    }
  }, [doc]);

  // ---- after all hooks & callbacks we can early-return UI cases ----
  if (loading) return <div>Loading lesson...</div>;
  if (!doc)
    return (
      <div className="space-y-4">
        <div>Lesson not found.</div>
        <Link to="/" className="text-classroom">
          Back
        </Link>
      </div>
    );

  // --- derived values for render ---
  const enhancedHtml = sanitizeAndEnhanceHtml(doc.contentHtml);
  const videoLinks = extractVideoLinksFromDoc(doc);
  const youTubeMatch =
    (doc.url || "").match(/(?:v=|\/embed\/|youtu\.be\/)([A-Za-z0-9_-]{6,})/) ||
    (videoLinks[0] || "").match(
      /(?:v=|\/embed\/|youtu\.be\/)([A-Za-z0-9_-]{6,})/
    );

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-sm">
          <button
            onClick={() => navigate(-1)}
            className="btn-surface px-2 py-1"
          >
            ← Back
          </button>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={goPrev}
              disabled={!prevLesson}
              className="btn-surface px-2 py-1"
            >
              {prevLesson
                ? `Prev: ${String(prevLesson.title || prevLesson.url).slice(
                    0,
                    30
                  )}`
                : "Prev"}
            </button>
            <button
              onClick={goNext}
              disabled={!nextLesson}
              className="btn-surface px-2 py-1"
            >
              {nextLesson
                ? `Next: ${String(nextLesson.title || nextLesson.url).slice(
                    0,
                    30
                  )}`
                : "Next"}
            </button>
          </div>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-classroom truncate">
              {doc.title || doc.metadata?.ogTitle || doc.url}
            </h2>
            <div className="text-sm text-classroom-muted">
              {doc.type} • Fetched: {new Date(doc.fetchedAt).toLocaleString()}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRewrite}
              disabled={rewriting}
              className="btn-classroom text-sm"
            >
              {rewriting ? "Rewriting…" : "Rewrite (OpenAI)"}
            </button>

            <a
              href={doc.url}
              target="_blank"
              rel="noreferrer"
              className="btn-surface text-sm"
            >
              Original
            </a>

            <button
              onClick={async () => {
                const url = `${window.location.origin}/lesson/${doc._id}`;
                try {
                  if (navigator.clipboard?.writeText) {
                    await navigator.clipboard.writeText(url);
                    showToast("Link copied to clipboard", "success");
                  } else {
                    const ta = document.createElement("textarea");
                    ta.value = url;
                    ta.setAttribute("readonly", "");
                    ta.style.position = "absolute";
                    ta.style.left = "-9999px";
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand("copy");
                    ta.remove();
                    showToast("Link copied to clipboard", "success");
                  }
                } catch {
                  showToast("Copy failed", "error");
                }
              }}
              className="btn-surface text-sm"
            >
              Copy URL
            </button>

            <button
              onClick={async () => {
                const url = `${window.location.origin}/lesson/${doc._id}`;
                try {
                  if (navigator.share) {
                    await navigator.share({
                      title: doc.title || "Lesson",
                      text: `Check out this lesson: ${doc.title}`,
                      url,
                    });
                    showToast("Shared successfully", "success");
                  } else {
                    const ok = await navigator.clipboard
                      ?.writeText?.(url)
                      .then(() => true)
                      .catch(() => false);
                    if (ok)
                      showToast("Sharing not supported — link copied", "info");
                    else
                      showToast("Share not supported and copy failed", "error");
                  }
                } catch (err) {
                  console.error("share failed", err);
                  showToast("Share failed", "error");
                }
              }}
              className="btn-surface text-sm"
            >
              Share
            </button>
          </div>
        </div>

        {youTubeMatch ? (
          <div className="w-full aspect-video bg-black rounded overflow-hidden">
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
            <section className="card-surface border border-surface-border p-3 rounded shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-classroom">Lesson content</h3>

                <div className="flex items-center gap-2 text-sm">
                  <button
                    onClick={() => {
                      const t = extractTextForReader();
                      if (t) startTTS(t);
                      else showToast("No readable text found", "info");
                    }}
                    className="btn-surface px-2 py-1 text-xs"
                  >
                    ▶️ Read
                  </button>
                  <button
                    onClick={() => stopTTS()}
                    className="btn-surface px-2 py-1 text-xs"
                  >
                    ⏹ Stop
                  </button>
                </div>
              </div>

              {doc.contentHtml ? (
                <div
                  className="prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: enhancedHtml }}
                />
              ) : (
                <div className="card-surface p-3 rounded border border-surface-border">
                  <PrettyContent text={doc.text || "(no text)"} />
                </div>
              )}
            </section>

            {rewritten && (
              <section className="bg-success-surface border border-surface-border p-3 rounded">
                <h3 className="font-semibold mb-2 text-success">
                  Rewrite (OpenAI)
                </h3>
                <div className="whitespace-pre-wrap text-classroom text-sm">
                  {rewritten}
                </div>
              </section>
            )}
          </div>

          <aside className="card-surface border border-surface-border p-3 rounded sticky top-20 max-h-[60vh] overflow-auto">
            <h4 className="font-semibold text-classroom">Sections</h4>
            <div className="mt-3 space-y-2">
              {(doc?.metadata?.sections?.length ?? 0) === 0 && (
                <div className="text-sm text-classroom-muted">
                  No sections available.
                </div>
              )}

              {(doc?.metadata?.sections ?? []).map((s: any, idx: number) => (
                <div key={idx} className="p-2 bg-classroom-surface-2 rounded">
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

            {videoLinks.length > 0 && (
              <>
                <hr className="my-3 border-surface-border" />
                <h5 className="font-semibold text-classroom">Video links</h5>
                <ul className="mt-2 space-y-2">
                  {videoLinks.map((v, i) => (
                    <li key={i} className="text-sm">
                      <a
                        href={v}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-classroom underline"
                      >
                        {v}
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </aside>
        </div>

        <div>
          <Link to="/" className="text-classroom">
            ← Back to lessons
          </Link>
        </div>
      </div>

      <Toast
        visible={!!toast?.visible}
        message={toast?.message ?? ""}
        type={toast?.type ?? "info"}
        onClose={hideToast}
      />
    </>
  );
}
