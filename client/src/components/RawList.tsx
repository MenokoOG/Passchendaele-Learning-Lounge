import React, { useEffect, useState } from "react";
import { listRaw, exportRaw, rewrite } from "../api";

export default function RawList() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await listRaw();
      setRows(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h3>Stored raw lessons</h3>
      <button onClick={load} disabled={loading}>
        Refresh
      </button>
      <button
        onClick={() => {
          exportRaw().then((d) => {
            const s = JSON.stringify(d);
            const blob = new Blob([s], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `google_raw_${Date.now()}.json`;
            a.click();
          });
        }}
        style={{ marginLeft: 8 }}
      >
        Download JSON
      </button>
      <ul>
        {rows.map((r) => (
          <li
            key={r._id}
            style={{ marginTop: 12, padding: 8, border: "1px solid #eee" }}
          >
            <strong>{r.title ?? "(no title)"}</strong> — <em>{r.type}</em>
            <br />
            <a href={r.url} target="_blank" rel="noreferrer">
              {r.url}
            </a>
            <br />
            <small>Fetched: {new Date(r.fetchedAt).toLocaleString()}</small>
            <br />
            <button
              onClick={async () => {
                const sample = prompt(
                  "Paste a short voice-sample (or leave blank)"
                );
                const out = await rewrite(
                  r._id,
                  undefined,
                  sample ?? undefined
                );
                alert("Rewritten result returned (server response logged)");
                console.log(out);
              }}
              style={{ marginTop: 6 }}
            >
              Rewrite (server)
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
