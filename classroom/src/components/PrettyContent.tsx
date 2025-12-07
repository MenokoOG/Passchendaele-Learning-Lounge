import React from "react";

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
    const parts = block.split("\n").map((l, i) => (
      <span key={i}>
        {l}
        {i < block.split("\n").length - 1 ? <br /> : null}
      </span>
    ));
    return (
      <p key={idx} className="leading-relaxed text-classroom-muted">
        {parts}
      </p>
    );
  }

  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      {blocks.map((block, idx) => {
        const hd = block.match(/^\s{0,}#{1,6}\s+(.*)$/);
        if (hd) {
          const level = block.match(/^(\s{0,})(#{1,6})\s+/)?.[2].length ?? 2;
          const text = hd[1];
          if (level === 1) return <h1 key={idx}>{text}</h1>;
          if (level === 2) return <h2 key={idx}>{text}</h2>;
          if (level === 3) return <h3 key={idx}>{text}</h3>;
          return <h4 key={idx}>{text}</h4>;
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
