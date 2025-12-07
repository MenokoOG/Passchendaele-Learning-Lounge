import React from "react";

/**
 * PrettyContent
 * - linkifies plain URLs in paragraphs
 * - preserves code block detection from prior implementation
 */

function linkifyTextToNodes(text: string) {
  // splits text into array of strings and <a> elements
  // basic url regex
  const urlRe = /(https?:\/\/[^\s)'"<>]+)/gi;
  const parts: Array<string | { url: string }> = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = urlRe.exec(text)) !== null) {
    if (m.index > lastIndex) parts.push(text.slice(lastIndex, m.index));
    parts.push({ url: m[0] });
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

export default function PrettyContent({ text }: { text: string }) {
  if (!text) return null;

  const blocks = String(text)
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  function isCodeBlock(block: string) {
    const lines = block.split("\n");
    const indented = lines.filter((l) => /^\s{2,}|\t/.test(l)).length;
    if (indented >= Math.max(1, Math.floor(lines.length * 0.6))) return true;
    const codey = lines.filter((l) =>
      /[{}=():<>]|def |function |=>|console\.|print\(|\bvar\b/.test(l)
    ).length;
    if (codey >= Math.max(1, Math.floor(lines.length * 0.6))) return true;
    if (/^```/.test(block) && /```$/.test(block)) return true;
    return false;
  }

  function renderInlineParagraph(block: string, idx: number) {
    // linkify URLs inside paragraphs
    const pieces = linkifyTextToNodes(block);
    return (
      <p key={idx} className="leading-relaxed text-classroom-muted">
        {pieces.map((p, i) =>
          typeof p === "string" ? (
            <span key={i}>{p}</span>
          ) : (
            <a
              key={i}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-classroom underline"
            >
              {p.url}
            </a>
          )
        )}
      </p>
    );
  }

  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      {blocks.map((block, idx) => {
        const hd = block.match(/^\s{0,}#{1,6}\s+(.*)$/);
        if (hd) {
          const level = block.match(/^(\s{0,})(#{1,6})\s+/)?.[2].length ?? 2;
          const txt = hd[1];
          if (level === 1) return <h1 key={idx}>{txt}</h1>;
          if (level === 2) return <h2 key={idx}>{txt}</h2>;
          if (level === 3) return <h3 key={idx}>{txt}</h3>;
          return <h4 key={idx}>{txt}</h4>;
        }

        const mdHeading2 = block.match(/^\s{0,}##\s+(.*)$/);
        if (mdHeading2) {
          return <h2 key={idx}>{mdHeading2[1]}</h2>;
        }

        if (isCodeBlock(block)) {
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
              className="rounded-md p-3 bg-classroom-surface-2 text-classroom-muted overflow-auto text-sm"
            >
              {cleaned}
            </pre>
          );
        }

        return renderInlineParagraph(block, idx);
      })}
    </div>
  );
}
