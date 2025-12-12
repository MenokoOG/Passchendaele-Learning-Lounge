// src/pages/admin/Ingest.tsx
import React, { useEffect, useState } from "react";
import { adminGetDashboard } from "../../api/admin";

export default function AdminIngestPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const r = await adminGetDashboard();
        setData(r);
      } catch (e: any) {
        console.error("adminGetDashboard error", e);
        setErr(e?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Ingest / Admin Dashboard</h2>

      {loading && <div className="text-classroom-muted">Loading…</div>}
      {err && <div className="text-red-600">{err}</div>}

      {!loading && data && (
        <div className="space-y-3">
          <div className="card-surface border border-surface-border p-3 rounded">
            <h3 className="font-semibold">Role: {String(data.role)}</h3>
            <div className="text-sm text-classroom-muted">
              Widgets below (raw):
            </div>
          </div>

          <div className="card-surface border border-surface-border p-3 rounded">
            <pre className="text-xs whitespace-pre-wrap">
              {JSON.stringify(data.widgets || data, null, 2)}
            </pre>
          </div>

          <div className="card-surface border border-surface-border p-3 rounded">
            <h4 className="font-semibold mb-2">Useful actions</h4>
            <p className="text-sm text-classroom-muted">
              Add controls here to re-run scrapers, view ingestion logs, or
              trigger background jobs (server endpoints required).
            </p>
            <div className="mt-2">
              <button className="btn-classroom mr-2" disabled>
                Re-run ingest (server endpoint required)
              </button>
              <button className="btn-surface" disabled>
                View ingest logs
              </button>
            </div>
          </div>
        </div>
      )}

      {!loading && !data && !err && (
        <div className="text-classroom-muted">No data.</div>
      )}
    </div>
  );
}
