// server/src/utils/local_rewrite.ts
import { splitIntoSections } from "./splitter.js";

/**
 * localRewriteDocument
 * - title: string
 * - html: original HTML (optional)
 * - text: plain text (optional)
 *
 * returns: a readable markdown-style paraphrase suitable as a fallback
 */
export function localRewriteDocument({
  title = "",
  html = "",
  text = "",
}: {
  title?: string;
  html?: string;
  text?: string;
}): string {
  // choose source: prefer html if it's article-like, else fallback to text
  const source = html && html.length > 200 ? html : text || "";
  if (!source) return "(no content)";

  const sections = splitIntoSections(source, text, title);
  if (!sections || sections.length === 0) {
    // fallback single "section" rewrite
    const raw = (text || String(source)).replace(/\s+/g, " ").trim();
    const first = raw
      .split(/(?<=[.!?])\s+/)
      .slice(0, 3)
      .join(" ");
    const take = raw
      .split(/(?<=[.!?])\s+/)
      .slice(0, 3)
      .map((s) => s.trim().slice(0, 120));
    const out =
      `# ${title || "Lesson (local fallback)"}\n\n` +
      `**Summary**\n\n${first}\n\n` +
      `**Takeaways**\n\n- ${take.join("\n- ")}\n\n` +
      `${raw.slice(0, 2000)}\n\n` +
      `_(Local fallback rewrite — lower fidelity than cloud LLM)_`;
    return out;
  }

  const parts: string[] = [];
  for (const s of sections) {
    const heading = s.heading ? `## ${s.heading}\n\n` : "";
    const content = (s.text || s.html || "").replace(/\s{2,}/g, " ").trim();
    if (!content) {
      parts.push(heading + "(no text for this section)");
      continue;
    }

    // crude summary and takeaways
    const paras = content
      .split(/\n{2,}/)
      .map((p: string) => p.trim())
      .filter(Boolean);
    const firstPara = paras.length ? paras[0] : content;
    const sentences = firstPara.split(/(?<=[.!?])\s+/).filter(Boolean);
    const summary = sentences.slice(0, 2).join(" ");
    const takeaways = sentences
      .slice(0, 3)
      .map((s: string) => s.trim().slice(0, 140));

    // preserve fenced code blocks roughly by leaving them in the excerpt (splitter already leaves code)
    const excerpt = paras.slice(0, 2).join("\n\n").slice(0, 1200);

    const sectionText =
      heading +
      `**Summary**\n\n${summary}\n\n` +
      `**Takeaways**\n\n- ${takeaways.join("\n- ")}\n\n` +
      (excerpt ? `**Excerpt**\n\n${excerpt}\n\n` : "") +
      `_(Local fallback rewrite — lower fidelity than cloud LLM)_`;

    parts.push(sectionText);
  }

  const header = `# ${title || "Lesson (local fallback)"}\n\n`;
  return header + parts.join("\n\n---\n\n");
}
