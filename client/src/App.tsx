import React, { useState } from "react";
import { runScrapeRequest } from "./api";
import LinkList from "./components/LinkList";
import RawList from "./components/RawList";
import { LINKS } from "./links";

type ScrapeResult = {
  id: string;
  title?: string;
  url?: string;
  snippet?: string;
};

export default function App() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ScrapeResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function runScrape() {
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ links: LINKS, usePuppeteer: true }),
      });
      if (!res.ok) {
        // try to parse JSON error
        const text = await res.text();
        throw new Error(`Server returned ${res.status}: ${text}`);
      }
      const data = await res.json(); // now should be JSON
      // server returns { results: [...] }
      setResults(Array.isArray(data.results) ? data.results : []);
    } catch (err: any) {
      setError(err?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6">
      <header className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Scraper Client</h1>
        <p className="text-slate-300 mb-4">
          Lightweight UI for running the scraper and viewing results. Click{" "}
          <strong>Run Scrape</strong> to begin.
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={runScrape}
            disabled={loading}
            className="px-4 py-2 rounded bg-amber-500 text-slate-900 font-semibold disabled:opacity-60"
          >
            {loading ? "Running..." : "Run Scrape"}
          </button>

          <button
            onClick={() => {
              setResults([]);
              setError(null);
            }}
            className="px-3 py-2 rounded border border-slate-600 text-sm text-slate-200"
          >
            Clear
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto mt-7">
        <section className="mb-6">
          <LinkList />
        </section>

        <section className="mb-6">
          <RawList />
        </section>

        {error && (
          <div className="mb-4 p-3 bg-red-900 text-red-100 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        <section>
          <h2 className="text-xl font-semibold mb-3">
            Results ({results.length})
          </h2>

          {results.length === 0 ? (
            <div className="text-slate-400">No results yet.</div>
          ) : (
            <ul className="space-y-3">
              {results.map((r) => (
                <li
                  key={r.id}
                  className="p-3 bg-slate-800 rounded border border-slate-700"
                >
                  <a
                    href={r.url ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-300 font-medium"
                  >
                    {r.title ?? r.url}
                  </a>
                  {r.snippet && (
                    <p className="text-slate-300 mt-1">{r.snippet}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
