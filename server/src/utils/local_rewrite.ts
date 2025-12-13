// server/src/utils/local_rewrite.ts
import { splitIntoSections } from "./splitter.js";

/**
 * Local rewrite/paraphrase fallback.
 * Produces a Markdown-style summary tailored for lessons.
 *
 * Input:
 *  - title?: string
 *  - html?: string
 *  - text?: string
 *
 * Output: markdown string (limited length)
 */

const MAX_OUTPUT_CHARS = 18_000; // safety cap

function firstSentences(text: string, maxSentences = 2) {
  const sents = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  return sents.slice(0, maxSentences).join(" ");
}

function sanitizeExcerpt(s: string, max = 1200) {
  // keep code fences intact; otherwise collapse whitespace
  return s.replace(/\r\n/g, "\n").replace(/\s{2,}/g, " ").trim().slice(0, max);
}

export function localRewriteDocument({
  title = "",
  html = "",
  text = "",
}: {
  title?: string;
  html?: string;
  text?: string;
}): string {
  const source = html && html.length > 200 ? html : text || "";
  if (!source) return "(no content)";

  const sections = splitIntoSections(source, text, title);
  // If splitIntoSections failed, fallback to a compact paragraph rewrite
  if (!sections || sections.length === 0) {
    const raw = (text || String(source)).replace(/\s+/g, " ").trim();
    const first = firstSentences(raw, 2);
    const take = raw
      .split(/(?<=[.!?])\s+/)
      .slice(0, 4)
      .map((s) => s.trim().slice(0, 140));
    let out = `# ${title || "Lesson (local fallback)"}\n\n` + `**Summary**\n\n${first}\n\n` + `**Takeaways**\n\n- ${take.join("\n- ")}\n\n`;
    out += `**Excerpt**\n\n${sanitizeExcerpt(raw, 2000)}\n\n`;
    out += `_(Local fallback rewrite — lower fidelity than cloud LLM)_`;
    return out.slice(0, MAX_OUTPUT_CHARS);
  }

  const parts: string[] = [];

  for (const s of sections) {
    const heading = s.heading ? `## ${s.heading}\n\n` : "";
    // prefer text; if empty, try html
    const content = (s.text || (s.html || "") || "").replace(/\s{2,}/g, " ").trim();
    if (!content) {
      parts.push(heading + "(no text for this section)");
      continue;
    }

    // Preserve fenced code blocks that splitter may have left in html -> detect triple-backticks
    const hasCodeFence = /```/.test(content) || /<code>|<pre>/.test(s.html || "");
    // Summary = first 1-2 sentences
    const summary = firstSentences(content, 2);
    // Takeaways: up to 3 short sentences from beginning
    const takeaways = content
      .split(/(?<=[.!?])\s+/)
      .slice(0, 4)
      .map((x) => x.trim().slice(0, 140));

    // excerpt: preserve code blocks if present; else first two paragraphs
    let excerpt = "";
    if (hasCodeFence) {
      // try to preserve any ``` fenced blocks (rough)
      const codeMatch = content.match(/```[\s\S]*?```/);
      const before = content.split(/```/)[0].slice(0, 800);
      excerpt = (before + (codeMatch ? "\n\n" + (codeMatch[0].slice(0, 1200)) : "")).slice(0, 2000);
    } else {
      const paras = content.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
      excerpt = (paras.slice(0, 2).join("\n\n")).slice(0, 1200);
    }

    const sectionText =
      heading +
      `**Summary**\n\n${summary}\n\n` +
      `**Takeaways**\n\n- ${takeaways.join("\n- ")}\n\n` +
      (excerpt ? `**Excerpt**\n\n${sanitizeExcerpt(excerpt, 2000)}\n\n` : "") +
      `_(Local fallback rewrite — lower fidelity than cloud LLM)_`;

    parts.push(sectionText);
    // stop if we're getting too long
    if (parts.join("\n\n---\n\n").length > MAX_OUTPUT_CHARS * 0.9) break;
  }

  const header = `# ${title || "Lesson (local fallback)"}\n\n`;
  const out = header + parts.join("\n\n---\n\n");
  return out.slice(0, MAX_OUTPUT_CHARS);
}

export default localRewriteDocument;
