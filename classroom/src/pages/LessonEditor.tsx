// src/pages/LessonEditor.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createLesson, getLesson, updateLesson } from "../api/api";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TiptapToolbar from "../components/TiptapToolbar";

const AUTOSAVE_KEY = (id?: string) =>
  id ? `m3_lesson_draft_${id}` : `m3_lesson_draft_new`;

function slugify(s: string) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export default function LessonEditor() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const draftKey = useMemo(() => AUTOSAVE_KEY(id), [id]);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [published, setPublished] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const mountedRef = useRef(true);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Image,
      Placeholder.configure({
        placeholder: "Write your lesson content here... (TipTap editor)",
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "prose max-w-none focus:outline-none",
      },
    },
  });

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // destroy editor on unmount
      try {
        editor?.destroy();
      } catch {}
    };
  }, [editor]);

  // load lesson if editing
  useEffect(() => {
    (async () => {
      if (!id) {
        // load draft if exists
        try {
          const raw = localStorage.getItem(draftKey);
          if (raw) {
            const d = JSON.parse(raw);
            setTitle(d.title || "");
            setSlug(d.slug || "");
            setSummary(d.summary || "");
            setPublished(typeof d.published === "boolean" ? d.published : true);
            if (d.contentHtml && editor)
              editor.commands.setContent(d.contentHtml);
          }
        } catch {}
        return;
      }

      try {
        const data = await getLesson(id);
        setTitle(data.title || "");
        setSlug(data.slug || "");
        setSummary(data.summary || "");
        setPublished(Boolean(data.published));
        if (editor)
          editor.commands.setContent(data.contentHtml || data.text || "");
      } catch (err) {
        console.error("Failed to load lesson", err);
      }

      // do not auto-apply local draft on top of server content; we warn instead
      try {
        const raw = localStorage.getItem(draftKey);
        if (raw) {
          const d = JSON.parse(raw);
          if (
            d.contentHtml &&
            editor &&
            d.contentHtml !== (editor.getHTML?.() || "")
          ) {
            setMessage(
              "Autosaved draft present locally — you can clear draft or continue editing."
            );
            setTimeout(() => setMessage(null), 4000);
          }
        }
      } catch {}
    })();
  }, [id, draftKey, editor]);

  // autosave to localStorage every 2s
  useEffect(() => {
    const t = setInterval(() => {
      try {
        const contentHtml = editor?.getHTML() ?? "";
        const d = { title, slug, summary, contentHtml, published };
        localStorage.setItem(draftKey, JSON.stringify(d));
      } catch {}
    }, 2000);
    return () => clearInterval(t);
  }, [title, slug, summary, published, draftKey, editor]);

  const handleSuggestSlug = () => setSlug(slugify(title));

  const handleClearDraft = () => {
    try {
      localStorage.removeItem(draftKey);
      setMessage("Draft cleared.");
      setTimeout(() => setMessage(null), 2000);
    } catch {}
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      setMessage("Title is required.");
      setTimeout(() => setMessage(null), 2000);
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const contentHtml = editor?.getHTML() ?? "";
      if (id) {
        await updateLesson(id, {
          title,
          slug,
          summary,
          contentHtml,
          published,
        });
        setMessage("Lesson updated.");
        try {
          localStorage.removeItem(draftKey);
        } catch {}
      } else {
        const r = await createLesson({
          title,
          slug,
          summary,
          contentHtml,
          published,
        });
        const newId = r.lesson?._id || r.lesson?.id;
        setMessage("Lesson created.");
        try {
          localStorage.removeItem(draftKey);
        } catch {}
        if (newId) navigate(`/lesson/${newId}`);
        else navigate("/");
      }
    } catch (err) {
      console.error("Save failed", err);
      setMessage("Save failed.");
    } finally {
      if (mountedRef.current) setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">
          {id ? "Edit Lesson" : "Create Lesson"}
        </h2>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab("edit")}
            className={`px-2 py-1 rounded ${
              tab === "edit" ? "bg-surface-border" : "bg-white"
            }`}
          >
            Edit
          </button>
          <button
            onClick={() => setTab("preview")}
            className={`px-2 py-1 rounded ${
              tab === "preview" ? "bg-surface-border" : "bg-white"
            }`}
          >
            Preview
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 rounded border"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <label className="block text-sm mb-1">Slug</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full p-2 rounded border"
            />
            <div className="text-xs text-classroom-muted mt-1">
              URL-friendly slug (auto-suggest).
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Summary</label>
            <input
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full p-2 rounded border"
            />
          </div>

          <div className="flex items-end gap-2">
            <div>
              <label className="block text-sm mb-1">Published</label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                />
                <span className="text-sm">Published</span>
              </label>
            </div>

            <div className="self-end">
              <button
                type="button"
                onClick={handleSuggestSlug}
                className="btn-surface"
              >
                Suggest slug
              </button>
            </div>
          </div>
        </div>

        {tab === "edit" && (
          <div>
            <TiptapToolbar editor={editor as any} />
            <div className="border rounded p-2">
              <EditorContent editor={editor} />
            </div>

            <div className="mt-2 flex items-center gap-2">
              <button type="submit" disabled={saving} className="btn-classroom">
                {saving ? "Saving…" : id ? "Update Lesson" : "Create Lesson"}
              </button>
              <button
                type="button"
                onClick={handleClearDraft}
                className="px-2 py-1 rounded border text-sm"
              >
                Clear draft
              </button>
              {message && (
                <div className="text-sm text-slate-500">{message}</div>
              )}
            </div>
          </div>
        )}

        {tab === "preview" && (
          <div>
            <div className="card-surface border border-surface-border p-4 rounded max-h-[70vh] overflow-auto">
              <div
                dangerouslySetInnerHTML={{
                  __html: editor?.getHTML() || "<em>No content yet.</em>",
                }}
              />
            </div>

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-classroom"
              >
                {saving ? "Saving…" : id ? "Update Lesson" : "Create Lesson"}
              </button>
              <button
                type="button"
                onClick={() => setTab("edit")}
                className="px-2 py-1 rounded border text-sm"
              >
                Back to edit
              </button>
              {message && (
                <div className="text-sm text-slate-500">{message}</div>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
