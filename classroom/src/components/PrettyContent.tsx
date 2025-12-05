// src/components/PrettyContent.tsx
import React from "react";

/**
 * Lightweight renderer for lesson plain-text content.
 * - Splits on double newlines into blocks
 * - Recognizes markdown-style headings starting with # / ##
 * - Treats blocks that are mostly indented lines as code blocks (<pre>)
 * - Falls back to paragraphs with simple linebreak -> <br/> preservation
 *
 * Not a full markdown renderer — small, deterministic, no new deps.
 */
export default function PrettyContent({ text }: { text: string }) {
  if (!text) return null;

  const blocks = String(text)
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  function isCodeBlock(block: string) {
    const lines = block.split("\n");
    // if most lines start with at least two spaces or a tab -> code
    const indented = lines.filter((l) => /^\s{2,}|\t/.test(l)).length;
    if (indented >= Math.max(1, Math.floor(lines.length * 0.6))) return true;
    // or if the block looks like code (many lines with punctuation typical for code)
    const codey = lines.filter((l) =>
      /[{}=():<>]|def |function |=>|console\.|print\(|\bvar\b/.test(l)
    ).length;
    if (codey >= Math.max(1, Math.floor(lines.length * 0.6))) return true;
    // fenced code style
    if (/^```/.test(block) && /```$/.test(block)) return true;
    return false;
  }

  function renderInlineParagraph(block: string, idx: number) {
    // convert single newlines into <br/>
    const parts = block.split("\n").map((l, i) => (
      <span key={i}>
        {l}
        {i < block.split("\n").length - 1 ? <br /> : null}
      </span>
    ));
    return (
      <p key={idx} className="leading-relaxed">
        {parts}
      </p>
    );
  }

  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      {blocks.map((block, idx) => {
        // heading: support leading "## " or "# "
        const hd = block.match(/^\s{0,}#{1,6}\s+(.*)$/);
        if (hd) {
          const level = block.match(/^(\s{0,})(#{1,6})\s+/)?.[2].length ?? 2;
          const text = hd[1];
          if (level === 1) return <h1 key={idx}>{text}</h1>;
          if (level === 2) return <h2 key={idx}>{text}</h2>;
          if (level === 3) return <h3 key={idx}>{text}</h3>;
          return <h4 key={idx}>{text}</h4>;
        }

        // some content uses "## " inline without markdown hash char, also handle "## " literal
        const mdHeading2 = block.match(/^\s{0,}##\s+(.*)$/);
        if (mdHeading2) {
          return <h2 key={idx}>{mdHeading2[1]}</h2>;
        }

        if (isCodeBlock(block)) {
          // strip leading indentation for nicer code appearance
          const lines = block.split("\n");
          const minIndent = lines
            .filter((l) => l.trim().length > 0)
            .reduce((min, l) => {
              const m = l.match(/^\s*/)?.[0].length ?? 0;
              return Math.min(min, m);
            }, Infinity);
          const cleaned = lines
            .map((l) => (isFinite(minIndent) ? l.slice(minIndent) : l))
            .join("\n");
          return (
            <pre
              key={idx}
              className="rounded-md p-3 bg-slate-900 text-slate-100 overflow-auto text-sm"
            >
              {cleaned}
            </pre>
          );
        }

        // normal paragraph
        return renderInlineParagraph(block, idx);
      })}
    </div>
  );
}
