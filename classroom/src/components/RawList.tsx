// classroom/src/components/RawList.tsx
import React, { useEffect, useState } from "react";
import { listRaw, rewriteRaw } from "../api/api";

export default function RawList() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await listRaw();
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load raw lessons:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h3>Stored source records</h3>

      <div style={{ marginBottom: 12, display: "flex", gap: 8 }}>
        <button onClick={load} disabled={loading}>
          Refresh
        </button>

        {/* 
        <button
          onClick={() => {
            exportRaw().then((d) => {
              const s = JSON.stringify(d);
              const blob = new Blob([s], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `passchendaele_raw_${Date.now()}.json`;
              a.click();
            });
          }}
          style={{ marginLeft: 8 }}
        >
          Download JSON
        </button>
        */}
      </div>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {rows.map((r) => (
          <li
            key={r._id}
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 8,
              border: "1px solid #eee",
              background: "#0b0b0b00",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <strong style={{ display: "block" }}>
                  {r.title ?? "(no title)"}
                </strong>
                <div style={{ marginTop: 4 }}>
                  <a href={r.url} target="_blank" rel="noreferrer">
                    {r.url}
                  </a>
                </div>
                <div style={{ marginTop: 6, color: "#666", fontSize: 12 }}>
                  Fetched:{" "}
                  {r.fetchedAt
                    ? new Date(r.fetchedAt).toLocaleString()
                    : "unknown"}
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                {r.metadata?.licenseCaptured ? (
                  <div
                    style={{
                      background: "#083e3e",
                      color: "#bfeceb",
                      padding: "4px 8px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    License captured
                  </div>
                ) : (
                  <div
                    style={{
                      background: "#2f2f2f",
                      color: "#aaa",
                      padding: "4px 8px",
                      borderRadius: 6,
                      fontSize: 12,
                    }}
                  >
                    No license detected
                  </div>
                )}
              </div>
            </div>

            {/* license text preview */}
            {r.metadata?.licenseText && (
              <div style={{ marginTop: 10 }}>
                <strong style={{ fontSize: 12 }}>License / Attribution</strong>
                <div
                  style={{
                    marginTop: 6,
                    maxHeight: 140,
                    overflow: "auto",
                    padding: 8,
                    borderRadius: 6,
                    background: "#0f1720",
                    color: "#dbeafe",
                    fontSize: 12,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {r.metadata.licenseText}
                </div>
              </div>
            )}

            <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
              <button
                onClick={async () => {
                  const sample = prompt(
                    "Paste a short voice-sample (or leave blank)"
                  );
                  try {
                    const out = await rewriteRaw(
                      r._id,
                      undefined,
                      sample ?? undefined
                    );
                    alert(
                      "Rewrite returned (server responded). Check console for full response."
                    );
                    console.log(out);
                  } catch (err) {
                    alert("Rewrite failed — check console.");
                    console.error(err);
                  }
                }}
                style={{ padding: "6px 10px" }}
              >
                Rewrite (server)
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
