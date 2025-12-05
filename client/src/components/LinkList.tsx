import React, { useState } from "react";
import { LINKS } from "../links";
import { scrapeLinks } from "../api";

export default function LinkList({ onDone }: { onDone?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  async function start() {
    setLoading(true);
    setLog([]);
    try {
      // attach usePuppeteer:true per link if you want dynamic capture:
      const linksWithFlag = LINKS.map((l) => ({ ...l, usePuppeteer: true }));
      const result = await scrapeLinks(linksWithFlag as any);
      setLog((l) => [...l, "Scrape complete."]);
      console.log(result);
      onDone?.();
    } catch (err: any) {
      setLog((l) => [...l, `Error: ${err.message || err}`]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 16, border: "1px solid #ddd", borderRadius: 8 }}>
      <h3>Google Python Links</h3>
      <ol>
        {LINKS.map((l) => (
          <li key={l.url}>
            <a href={l.url} target="_blank" rel="noreferrer">
              {l.title}
            </a>
          </li>
        ))}
      </ol>
      <button onClick={start} disabled={loading} style={{ marginTop: 8 }}>
        {loading ? "Scraping…" : "Fetch & Save to DB"}
      </button>
      <div style={{ marginTop: 8 }}>
        {log.map((s, i) => (
          <div key={i}>{s}</div>
        ))}
      </div>
    </div>
  );
}
