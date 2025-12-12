// src/pages/CourseViewer.tsx
import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";
import { AuthContext } from "../auth/AuthProvider";
// If Section.tsx exists in src/components, ensure the file is present.
// Otherwise, update the import path to the correct location, for example:
import Section from "../components/Section"; // <-- update path if needed
// If the file does not exist, create src/components/Section.tsx with a basic export:
import ReaderOverlay from "../components/ReaderOverlay";

type Lesson = {
  _id: string;
  title: string;
  order?: number;
  contentHtml?: string;
  exercise?: { starterCode?: string };
};

type Course = {
  _id: string;
  title: string;
  description?: string;
  lessons?: Lesson[];
};

const DEFAULT_FONT_SCALE = 1.15; // bigger baseline for accessibility
const FONT_STEP = 0.16;

const CourseViewer: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const { user, ready } = useContext(AuthContext) as {
    user?: any;
    ready?: boolean;
  };

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[] | null>(null);
  const [selected, setSelected] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lessonsLoading, setLessonsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [enrollment, setEnrollment] = useState<any | null>(null);
  const [enrolling, setEnrolling] = useState<boolean>(false);
  const [previewText, setPreviewText] = useState<string | null>(null);

  // accessibility states
  const [fontScale, setFontScale] = useState<number>(() => {
    try {
      const v = localStorage.getItem("cv_font_scale");
      return v ? Number(v) : DEFAULT_FONT_SCALE;
    } catch {
      return DEFAULT_FONT_SCALE;
    }
  });
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    try {
      return localStorage.getItem("cv_high_contrast") === "1";
    } catch {
      return false;
    }
  });

  // reader overlay
  const [readerOpen, setReaderOpen] = useState(false);
  const [readerText, setReaderText] = useState<string>("");

  // TTS
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [ttsRate, setTtsRate] = useState<number>(0.95);
  const [ttsSpeaking, setTtsSpeaking] = useState<boolean>(false);
  const ttsStateIntervalRef = useRef<number | null>(null);

  // initial course load
  useEffect(() => {
    let alive = true;
    const load = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      setCourse(null);
      setLessons(null);
      setSelected(null);
      setPreviewText(null);
      try {
        const r = await api.get(`/courses/${id}`);
        const d = r?.data;
        if (!d || typeof d !== "object" || !d._id || !d.title) {
          setError("Invalid course data received.");
          return;
        }
        const data: Course = d;
        if (!alive) return;
        setCourse(data);
        if (
          Array.isArray(data.lessons) &&
          data.lessons.length &&
          data.lessons[0]?.title
        ) {
          const sorted = [...data.lessons].sort(
            (a, b) => (a.order ?? 0) - (b.order ?? 0)
          );
          setLessons(sorted);
          setSelected(sorted[0]);
        } else {
          setLessons(null);
        }
      } catch (err) {
        console.error("Error fetching course:", err);
        if (alive) setError("Failed to load course.");
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, [id]);

  // fallback fetch for lessons if not present
  useEffect(() => {
    if (!course || lessons !== null || !id) return;
    let alive = true;
    const load = async () => {
      setLessonsLoading(true);
      try {
        const r = await api.get(`/courses/${id}/lessons`);
        const list = Array.isArray(r?.data) ? r.data : [];
        const sorted = [...list].sort(
          (a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)
        );
        if (!alive) return;
        setLessons(sorted);
        setSelected(sorted[0] || null);
      } catch (err) {
        console.error("Failed to fetch lessons:", err);
        if (alive) setError("Failed to load lessons for this course.");
      } finally {
        if (alive) setLessonsLoading(false);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, [course, lessons, id]);

  // enrollment status
  useEffect(() => {
    if (!ready) return;
    if (!user || !id) {
      setEnrollment(null);
      return;
    }
    let alive = true;
    api
      .get(`/courses/${id}/enrollment`)
      .then((r) => {
        if (alive) setEnrollment(r?.data || null);
      })
      .catch(() => {
        if (alive) setEnrollment(null);
      });
    return () => {
      alive = false;
    };
  }, [user, id, ready]);

  const handleEnroll = async () => {
    if (!user) return alert("Please login to enroll.");
    setEnrolling(true);
    try {
      const r = await api.post(`/courses/${id}/enroll`);
      setEnrollment(r?.data || null);
    } catch (err: any) {
      console.error("enroll error", err);
      alert(err?.response?.data?.error || "Failed to enroll");
    } finally {
      setEnrolling(false);
    }
  };

  const handleUnenroll = async () => {
    if (!user) return alert("Please login.");
    setEnrolling(true);
    try {
      await api.post(`/courses/${id}/unenroll`);
      setEnrollment(null);
    } catch (err) {
      console.error("unenroll error", err);
      alert("Failed to unenroll");
    } finally {
      setEnrolling(false);
    }
  };

  const toggleLessonComplete = async (lessonId: string) => {
    if (!user) return alert("Please login to track progress.");
    try {
      const r = await api.post(
        `/courses/${id}/lessons/${lessonId}/toggle-complete`
      );
      setEnrollment(r?.data?.enrollment || r?.data || null);
    } catch (err) {
      console.error("toggle complete error", err);
      alert("Failed to toggle completion");
    }
  };

  const isCompleted = (lessonId: string) => {
    if (!enrollment) return false;
    return !!enrollment.completedLessons?.some(
      (l: any) =>
        (typeof l === "string" && l === lessonId) ||
        (l?._id && String(l._id) === String(lessonId))
    );
  };

  // extract text from html (for reader)
  const extractTextFromHtml = (html: string) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const article = doc.querySelector("article, main, #content");
      const text = (article || doc.body).textContent || "";
      return text.replace(/\s+/g, "\n\n").trim();
    } catch {
      return html
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }
  };

  // Read lesson (TTS) -- will speak entire lesson text
  const handleReadLesson = async () => {
    if (!selected) return alert("Select a lesson.");
    setPreviewText(null);

    const tryGetHtml = async (): Promise<string | null> => {
      if (selected?.contentHtml) return selected.contentHtml;
      if (Array.isArray(lessons)) {
        const found = lessons.find(
          (ll) => String(ll._id) === String(selected._id) && ll.contentHtml
        );
        if (found?.contentHtml) return found.contentHtml;
      }
      try {
        const r1 = await api.get(`/courses/${id}`);
        const c = r1?.data;
        if (Array.isArray(c?.lessons)) {
          const found = c.lessons.find(
            (ll: any) =>
              String(ll._id) === String(selected._id) && ll.contentHtml
          );
          if (found?.contentHtml) {
            setCourse(c);
            const sorted = [...c.lessons].sort(
              (a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)
            );
            setLessons(sorted);
            setSelected((prev: any) => ({
              ...prev,
              contentHtml: found.contentHtml,
            }));
            return found.contentHtml;
          }
        }
      } catch (err) {
        console.warn("Refetch course failed:", err);
      }
      try {
        const r2 = await api.get(`/courses/${id}/lessons`);
        const list = Array.isArray(r2?.data) ? r2.data : [];
        const found = list.find(
          (ll: any) => String(ll._id) === String(selected._id) && ll.contentHtml
        );
        if (found?.contentHtml) {
          const sorted = [...list].sort(
            (a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)
          );
          setLessons(sorted);
          setSelected((prev: any) => ({
            ...prev,
            contentHtml: found.contentHtml,
          }));
          return found.contentHtml;
        }
        if (list.length) {
          const sorted = [...list].sort(
            (a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)
          );
          setLessons(sorted);
        }
      } catch (err) {
        console.warn("Fetch lessons fallback failed:", err);
      }
      return null;
    };

    try {
      const html = await tryGetHtml();
      if (!html) {
        setPreviewText(
          "No lesson preview available. Please enroll or ask instructor to add content."
        );
        return;
      }
      const text = extractTextFromHtml(html);
      if (!text) {
        setPreviewText("Lesson content is empty.");
        return;
      }

      // speak the text
      speakText(text, ttsRate);
    } catch (err) {
      console.error("Read lesson failed:", err);
      setPreviewText("Failed to load lesson text for reading.");
    }
  };

  // Reader overlay open (plain text)
  const handleOpenReader = async () => {
    if (!selected) return alert("Select a lesson.");
    // try to reuse contentHtml or fallback to fetch
    let html = selected.contentHtml || null;
    if (!html && lessons) {
      const found = lessons.find((l) => String(l._id) === String(selected._id));
      html = found?.contentHtml || null;
    }
    if (!html) {
      try {
        const r = await api.get(`/courses/${id}/lessons`);
        const found = Array.isArray(r?.data)
          ? r.data.find((l: any) => String(l._id) === String(selected._id))
          : null;
        html = found?.contentHtml || null;
      } catch {}
    }
    if (!html) {
      setReaderText(
        "No lesson content available to open in reader. Please enroll or ask the instructor to add full content."
      );
      setReaderOpen(true);
      return;
    }
    const text = extractTextFromHtml(html);
    setReaderText(text);
    setReaderOpen(true);
  };

  // TTS helpers (speak/pause/resume/stop)
  const speakText = (text: string, rate = 0.95) => {
    if (!("speechSynthesis" in window)) {
      setPreviewText("Text-to-speech not available in this browser.");
      return;
    }
    stopTTS(); // clear prior
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = rate;
    utterRef.current = utter;
    utter.onend = () => {
      setTtsSpeaking(false);
      clearTtsStateInterval();
    };
    utter.onerror = () => {
      setTtsSpeaking(false);
      clearTtsStateInterval();
    };
    window.speechSynthesis.speak(utter);
    setTtsSpeaking(true);
    startTtsStateInterval();
  };

  const pauseTTS = () => {
    try {
      if ("speechSynthesis" in window && window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        setTtsSpeaking(false);
      }
    } catch {}
  };
  const resumeTTS = () => {
    try {
      if ("speechSynthesis" in window && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setTtsSpeaking(true);
      }
    } catch {}
  };
  const stopTTS = () => {
    try {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        utterRef.current = null;
        setTtsSpeaking(false);
        clearTtsStateInterval();
      }
    } catch {}
  };

  const startTtsStateInterval = () => {
    clearTtsStateInterval();
    // poll to ensure state sync in some browsers
    ttsStateIntervalRef.current = window.setInterval(() => {
      try {
        if (!("speechSynthesis" in window)) return;
        const s = window.speechSynthesis;
        setTtsSpeaking(s.speaking && !s.paused);
      } catch {}
    }, 500) as unknown as number;
  };
  const clearTtsStateInterval = () => {
    if (ttsStateIntervalRef.current) {
      clearInterval(ttsStateIntervalRef.current);
      ttsStateIntervalRef.current = null;
    }
  };

  // font controls
  const incFont = () => {
    const next = Math.min(1.8, +(fontScale + FONT_STEP).toFixed(2));
    setFontScale(next);
    try {
      localStorage.setItem("cv_font_scale", String(next));
    } catch {}
  };
  const decFont = () => {
    const next = Math.max(0.9, +(fontScale - FONT_STEP).toFixed(2));
    setFontScale(next);
    try {
      localStorage.setItem("cv_font_scale", String(next));
    } catch {}
  };
  const toggleContrast = () => {
    const next = !highContrast;
    setHighContrast(next);
    try {
      localStorage.setItem("cv_high_contrast", next ? "1" : "0");
    } catch {}
  };

  useEffect(() => {
    return () => {
      stopTTS();
      clearTtsStateInterval();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <div className="p-4">Loading course…</div>;
  if (error) return <div className="p-4 text-red-700">Error: {error}</div>;
  if (!course) return <div className="p-4">Course not found</div>;

  const totalLessons = lessons ? lessons.length : course?.lessons?.length || 0;
  const completedCount = enrollment?.completedLessons?.length || 0;
  const progressPct =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <main className="max-w-6xl mx-auto p-4">
      <div className="flex gap-4 flex-col md:flex-row">
        <aside className="w-full md:w-72">
          <Section
            className="p-3"
            title={course.title}
            subtitle={`Progress: ${progressPct}%`}
          >
            <div className="flex items-center justify-between">
              <div className="text-sm lesson-description">
                {course.description || ""}
              </div>
              <div>
                {user ? (
                  enrollment ? (
                    <button
                      onClick={handleUnenroll}
                      disabled={enrolling}
                      className="px-2 py-1 bg-red-600 text-white rounded"
                    >
                      {enrolling ? "Working…" : "Unenroll"}
                    </button>
                  ) : (
                    <button
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="px-2 py-1 bg-indigo-600 text-white rounded"
                    >
                      {enrolling ? "Working…" : "Enroll"}
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => alert("Please login to enroll")}
                    className="px-2 py-1 bg-indigo-600 text-white rounded"
                  >
                    Enroll
                  </button>
                )}
              </div>
            </div>

            {lessonsLoading && (
              <div className="text-sm text-slate-500 mt-2">
                Loading lessons…
              </div>
            )}

            {!lessonsLoading && (!lessons || lessons.length === 0) && (
              <div className="mt-2 text-sm text-slate-500">
                No lessons available for this course.
              </div>
            )}

            <ul className="mt-2 space-y-2">
              {lessons?.map((l) => (
                <li
                  key={l._id}
                  className="flex items-center justify-between gap-2"
                >
                  <button
                    onClick={() => {
                      setSelected(l);
                      setPreviewText(null);
                    }}
                    className={`flex-1 text-left p-2 border rounded ${
                      selected?._id === l._id ? "ring-2 ring-indigo-400" : ""
                    }`}
                    aria-current={selected?._id === l._id ? "true" : undefined}
                  >
                    <div
                      className={`font-medium ${
                        !enrollment ? "opacity-60" : ""
                      }`}
                    >
                      {l.title}
                    </div>
                    {l.order !== undefined && (
                      <div className="text-xs text-slate-500">
                        Order: {l.order}
                      </div>
                    )}
                  </button>

                  <div className="ml-2">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isCompleted(l._id)}
                        onChange={() => toggleLessonComplete(l._id)}
                        disabled={!enrollment}
                        className="a11y-focus"
                      />
                    </label>
                  </div>
                </li>
              ))}
            </ul>
          </Section>
        </aside>

        <section className="flex-1">
          <Section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">
                {selected?.title ?? "Select a lesson"}
              </h3>

              {/* Accessibility controls + TTS */}
              <div className="flex items-center gap-2">
                <button
                  onClick={decFont}
                  className="px-2 py-1 border rounded"
                  aria-label="Decrease font size"
                >
                  A−
                </button>
                <button
                  onClick={incFont}
                  className="px-2 py-1 border rounded"
                  aria-label="Increase font size"
                >
                  A+
                </button>
                <button
                  onClick={toggleContrast}
                  className="px-2 py-1 border rounded"
                  aria-pressed={highContrast}
                >
                  {highContrast ? "Normal contrast" : "High contrast"}
                </button>

                <button
                  onClick={handleReadLesson}
                  className="px-2 py-1 bg-slate-700 text-white rounded"
                >
                  Read lesson
                </button>

                <button
                  onClick={handleOpenReader}
                  className="px-2 py-1 border rounded"
                >
                  Open reader
                </button>

                {/* TTS controls */}
                <div className="flex items-center gap-1 border rounded px-2 py-1">
                  <button
                    onClick={() => {
                      // try to read preview or selected
                      if (!selected) return;
                      const html = selected.contentHtml;
                      const text = html ? extractTextFromHtml(html) : null;
                      if (!text) return alert("No text to speak");
                      speakText(text, ttsRate);
                    }}
                    className="px-1 a11y-focus"
                    aria-label="Play TTS"
                  >
                    ▶
                  </button>
                  <button onClick={pauseTTS} className="px-1 a11y-focus">
                    ❚❚
                  </button>
                  <button onClick={resumeTTS} className="px-1 a11y-focus">
                    ↻
                  </button>
                  <button onClick={stopTTS} className="px-1 a11y-focus">
                    ■
                  </button>
                  <label className="text-xs ml-2">Rate</label>
                  <input
                    type="range"
                    min={0.6}
                    max={1.6}
                    step={0.05}
                    value={ttsRate}
                    onChange={(e) => setTtsRate(Number(e.target.value))}
                    className="w-20"
                    aria-label="TTS rate"
                  />
                </div>
              </div>
            </div>

            <div className="mb-2 text-sm">
              {!enrollment ? (
                <div className="p-4 border rounded bg-yellow-50">
                  <strong>
                    Enroll to access lesson content and the editor.
                  </strong>
                  <div className="mt-2 text-sm">
                    Click Enroll to join this course and track your progress.
                  </div>
                </div>
              ) : (
                <div
                  className={`lesson-content mt-2 p-4 rounded ${
                    highContrast ? "lesson-high-contrast" : ""
                  }`}
                  style={{ fontSize: `${fontScale}rem` }}
                  dangerouslySetInnerHTML={{
                    __html: selected?.contentHtml || "<p>No content</p>",
                  }}
                />
              )}
            </div>

            {previewText && (
              <div className="mt-3 p-3 border rounded bg-slate-50">
                <div className="font-medium">
                  Lesson preview / reader fallback
                </div>
                <div className="mt-2 text-sm whitespace-pre-wrap">
                  {previewText}
                </div>
              </div>
            )}
          </Section>
        </section>
      </div>

      <ReaderOverlay
        open={readerOpen}
        text={readerText}
        fontScale={1.6}
        lineHeight={1.95}
        letterSpacing="0.03em"
        onClose={() => setReaderOpen(false)}
      />
    </main>
  );
};

export default CourseViewer;
