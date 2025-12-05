// server/src/utils/splitter.ts
import { load } from "cheerio";

export type Section = {
  heading: string | null;
  html: string;
  text: string;
  words: number;
  estSeconds: number;
};

export function countWords(s: string) {
  const m = s.trim().match(/\S+/g);
  return m ? m.length : 0;
}

/**
 * Split html/text into sections using headings, fallback to paragraphs or word chunks.
 */
export function splitIntoSections(
  html: string,
  fallbackText = "",
  title = ""
): Section[] {
  const $ = load(html || "<body></body>");

  // find headings
  const headings = $("h1,h2,h3,h4,h5,h6").toArray();
  const sections: Section[] = [];

  if (headings.length) {
    headings.forEach((h) => {
      const headingText = $(h).text().trim();
      const contentNodes: string[] = [];
      let sib = $(h).next();
      while (
        sib.length &&
        !/^h[1-6]$/i.test(((sib[0] as any)?.tagName || "").toString())
      ) {
        contentNodes.push($.html(sib));
        sib = sib.next();
      }
      const contentHtml = contentNodes.join("\n");
      const loaded = load(contentHtml);
      const contentText = loaded.root().text();
      const text = `${headingText}\n${contentText}`
        .replace(/\s{2,}/g, " ")
        .trim();
      const words = countWords(text);
      const estSeconds = Math.ceil((words / 200) * 60);
      sections.push({
        heading: headingText || null,
        html: contentHtml,
        text,
        words,
        estSeconds,
      });
    });
    return sections;
  }

  // fallback: paragraphs
  const paraTexts: string[] = [];
  $("p").each((i, el) => {
    const t = $(el).text().trim();
    if (t) paraTexts.push(t);
  });

  if (paraTexts.length) {
    let chunk: string[] = [];
    let chunkWords = 0;
    for (const p of paraTexts) {
      const w = countWords(p);
      if (chunkWords + w > 600 && chunk.length) {
        const text = chunk.join("\n\n");
        const words = countWords(text);
        sections.push({
          heading: null,
          html: "",
          text,
          words,
          estSeconds: Math.ceil((words / 200) * 60),
        });
        chunk = [];
        chunkWords = 0;
      }
      chunk.push(p);
      chunkWords += w;
    }
    if (chunk.length) {
      const text = chunk.join("\n\n");
      const words = countWords(text);
      sections.push({
        heading: null,
        html: "",
        text,
        words,
        estSeconds: Math.ceil((words / 200) * 60),
      });
    }
    return sections;
  }

  // final fallback: use fallbackText or all body text split into 500-word chunks
  const txt =
    fallbackText || (($ as any).text && ($ as any).text()) || title || "";
  if (!txt) return [];
  const wordsPerChunk = 500;
  const tokens = txt.split(/\s+/);
  for (let i = 0; i < tokens.length; i += wordsPerChunk) {
    const chunkTokens = tokens.slice(i, i + wordsPerChunk);
    const text = chunkTokens.join(" ");
    const words = chunkTokens.length;
    sections.push({
      heading: null,
      html: "",
      text,
      words,
      estSeconds: Math.ceil((words / 200) * 60),
    });
  }
  return sections;
}

export default splitIntoSections;
