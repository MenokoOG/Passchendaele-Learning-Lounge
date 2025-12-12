// src/pages/Files.tsx
import React, { useEffect, useRef, useState } from "react";
import { apiListFiles } from "../api";
import { apiUploadFile } from "../api";

export default function FilesPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function load() {
    setError(null);
    try {
      const r = await apiListFiles();
      setFiles(Array.isArray(r) ? r : []);
    } catch (err: any) {
      console.error("list files failed", err);
      setError(err?.response?.data?.error ?? err?.message ?? "Failed");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onUpload(e: React.FormEvent) {
    e.preventDefault();
    const f = fileRef.current?.files?.[0];
    if (!f) return alert("Select a file first");
    setBusy(true);
    try {
      await apiUploadFile(f);
      fileRef.current!.value = "";
      await load();
    } catch (err: any) {
      console.error("upload failed", err);
      alert(err?.response?.data?.error ?? err?.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Files</h2>

      <div className="card-surface border border-surface-border p-4 rounded mb-4">
        <form onSubmit={onUpload} className="flex flex-wrap gap-3 items-center">
          <input ref={fileRef} type="file" className="p-1" />
          <button className="btn-classroom" disabled={busy}>
            {busy ? "Uploading..." : "Upload"}
          </button>
        </form>
        {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
      </div>

      <div className="space-y-3">
        {files.length === 0 ? (
          <div className="text-classroom-muted">No uploaded files yet.</div>
        ) : (
          files.map((f) => (
            <div
              key={f._id || f.id}
              className="card-surface border border-surface-border p-3 rounded"
            >
              <div className="font-medium">{f.originalName}</div>
              <div className="text-sm text-classroom-muted">
                {f.mimeType} • {(f.size ?? 0).toLocaleString()} bytes
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
