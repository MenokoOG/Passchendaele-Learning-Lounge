// src/pages/admin/SystemStatus.tsx
import React, { useEffect, useState } from "react";
import { adminGetSystemStatus, adminTriggerBackup } from "../../api/admin";

export default function AdminSystemPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const s = await adminGetSystemStatus();
        setStatus(s);
      } catch (e: any) {
        console.warn("adminGetSystemStatus failed", e);
        setErr(
          e?.response?.data?.error ||
            e?.message ||
            "Status endpoint not available"
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleBackup() {
    if (!confirm("Trigger backup?")) return;
    setBusy(true);
    setErr(null);
    try {
      const r = await adminTriggerBackup();
      setStatus((s: any) => ({
        ...s,
        lastBackup: new Date().toISOString(),
        backupResult: r,
      }));
      alert("Backup triggered (server response shown in status if available).");
    } catch (e: any) {
      console.error("trigger backup failed", e);
      setErr(e?.message || "Backup failed (endpoint may be missing)");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">System Status</h2>

      {loading && <div className="text-classroom-muted">Loading…</div>}
      {err && <div className="text-sm text-red-600 mb-3">{err}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card-surface border border-surface-border p-3 rounded">
          <h3 className="font-semibold">Status</h3>
          <pre className="text-xs whitespace-pre-wrap mt-2">
            {JSON.stringify(
              status || { message: "No status available" },
              null,
              2
            )}
          </pre>
        </div>

        <div className="card-surface border border-surface-border p-3 rounded">
          <h3 className="font-semibold">Actions</h3>
          <p className="text-sm text-classroom-muted mt-2">
            Trigger server maintenance actions (endpoints must exist on server).
          </p>
          <div className="mt-3 flex gap-2">
            <button
              className="btn-classroom"
              onClick={handleBackup}
              disabled={busy}
            >
              Trigger backup
            </button>
            <button
              className="btn-surface"
              onClick={() => window.location.reload()}
            >
              Reload status
            </button>
          </div>
          {busy && (
            <div className="text-sm text-classroom-muted mt-2">
              Waiting for server…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
