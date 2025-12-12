// src/components/TiptapToolbar.tsx
import React from "react";
import { Editor } from "@tiptap/react";

function Btn({ onClick, active, children, title }: any) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`px-2 py-1 rounded text-sm border ${
        active ? "bg-surface-border" : "bg-white hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

export default function TiptapToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;
  return (
    <div className="flex gap-2 flex-wrap mb-2">
      <Btn
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="Bold"
      >
        <strong>B</strong>
      </Btn>

      <Btn
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="Italic"
      >
        <em>I</em>
      </Btn>

      <Btn
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        title="Strike"
      >
        S
      </Btn>

      <Btn
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        title="H2"
      >
        H2
      </Btn>

      <Btn
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
        title="H3"
      >
        H3
      </Btn>

      <Btn
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        title="Bullet list"
      >
        • List
      </Btn>

      <Btn
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        title="Ordered list"
      >
        1. List
      </Btn>

      <Btn
        onClick={() => {
          const url = window.prompt("Enter link URL (include https://):");
          if (url)
            editor
              .chain()
              .focus()
              .extendMarkRange("link")
              .setLink({ href: url })
              .run();
        }}
        active={editor.isActive("link")}
        title="Insert link"
      >
        🔗
      </Btn>

      <Btn
        onClick={() => {
          const url = window.prompt("Enter image URL (https://...):");
          if (url) editor.chain().focus().setImage({ src: url }).run();
        }}
        title="Insert image"
      >
        🖼
      </Btn>

      <Btn
        onClick={() =>
          editor.chain().focus().unsetAllMarks().clearNodes().run()
        }
        title="Clear formatting"
      >
        clear
      </Btn>
    </div>
  );
}
