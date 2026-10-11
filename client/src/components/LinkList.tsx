import React, { useEffect, useState } from "react";
import { scrapeLinks, listSources, signIn, signOut, getToken } from "../api";

type Source = {
  id: string;
  title: string;
  url: string;
  institution: string;
  scrape: boolean;
  note?: string;
};

export default function LinkList({ onDone }: { onDone?: () => void }) {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [signedIn, setSignedIn] = useState(!!getToken());
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function login(e: React.FormEvent) {
    e.preventDefault();
    try {
      await signIn(username, password);
      setPassword("");
      setSignedIn(true);
      setLog([]);
    } catch (err: any) {
      setLog([`Sign-in failed: ${err?.response?.data?.error || err.message || err}`]);
    }
  }

  useEffect(() => {
    listSources()
      .then((d) => setSources(d.sources || []))
      .catch((e) => setLog([`Could not load sources: ${e.message || e}`]));
  }, []);

  async function start() {
    setLoading(true);
    setLog([]);
    try {
      const links = sources
        .filter((s) => s.scrape)
        .map((s) => ({ title: s.title, url: s.url }));
      const res = await scrapeLinks(links);
      const rows: any[] = res.results || [];
      setLog(rows.map((r) => `${r.status}: ${r.url}${r.error ? " (" + r.error + ")" : ""}`));
      onDone?.();
    } catch (err: any) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        signOut();
        setSignedIn(false);
      }
      setLog((l) => [...l, `Error: ${err?.response?.data?.error || err.message || err}`]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 16, border: "1px solid #ddd", borderRadius: 8 }}>
      <h3>Passchendaele sources ({sources.length})</h3>
      <ol>
        {sources.map((s) => (
          <li key={s.id}>
            <a href={s.url} target="_blank" rel="noreferrer">
              {s.title}
            </a>{" "}
            <small>
              {s.institution}
              {!s.scrape && s.note ? ` — link-out only: ${s.note}` : ""}
            </small>
          </li>
        ))}
      </ol>
      {!signedIn && (
        <form onSubmit={login} style={{ marginTop: 8, display: "flex", gap: 8 }}>
          <input
            placeholder="instructor or admin username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <button type="submit">Sign in</button>
        </form>
      )}
      <button onClick={start} disabled={loading || !signedIn || !sources.length} style={{ marginTop: 8 }}>
        {loading ? "Scraping…" : "Fetch & save to DB"}
      </button>
      <div style={{ marginTop: 8 }}>
        {log.map((s, i) => (
          <div key={i}>{s}</div>
        ))}
      </div>
    </div>
  );
}
