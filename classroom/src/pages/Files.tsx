// src/pages/Files.tsx
import React, { JSX, useEffect, useRef, useState } from "react";

/**
 * Files page (presign + PUT upload approach).
 *
 * Expects server endpoints (or `../api` helpers):
 *  - POST /api/files/presign  -> { url, key, id }
 *  - POST /api/files/confirm/:id -> { ok: true } (optional; updates metadata)
 *  - GET  /api/files -> [FileMeta]
 *  - GET  /api/files/download/:id -> { url } (presigned GET) OR file meta with publicUrl
 *  - DELETE /api/files/:id -> { ok: true }
 *
 * This file includes fallback fetch calls if you don't have client wrappers.
 */

type FileMeta = {
  _id?: string;
  id?: string;
  originalName?: string;
  mimeType?: string;
  size?: number;
  uploader?: string;
  path?: string;
  publicUrl?: string;
  createdAt?: string;
};

export default function FilesPage(): JSX.Element {
  const [files, setFiles] = useState<FileMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingMap, setUploadingMap] = useState<Record<string, number>>({});
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Helper: use project's ../api helpers if present, otherwise use fetch fallback.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const api: any = (globalThis as any).__APP_API__ || null;

  async function fetchFiles() {
    setLoading(true);
    setError(null);
    try {
      let data: FileMeta[] = [];
      if (api?.apiListFiles) {
        data = await api.apiListFiles();
      } else {
        const res = await fetch("/api/files");
        if (!res.ok) throw new Error(`Failed to list files: ${res.status}`);
        data = await res.json();
      }
      setFiles(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("fetchFiles error", err);
      setError(err?.message ?? "Failed to load files");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFiles();
  }, []);

  function fmtSize(n?: number) {
    if (!n) return "—";
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / (1024 * 1024)).toFixed(2)} MB`;
  }

  async function handleSelectFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const list = e.target.files;
    if (!list || list.length === 0) return;
    for (let i = 0; i < list.length; i++) {
      await uploadFile(list[i]);
    }
    // clear input so selecting same file again triggers change
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    await fetchFiles();
  }

  async function uploadFile(file: File) {
    setError(null);
    // 1) request presigned url from server
    try {
      let pres: { url: string; key?: string; id?: string } | null = null;
      if (api?.apiPresignUpload) {
        pres = await api.apiPresignUpload({
          filename: file.name,
          contentType: file.type,
        });
      } else {
        const r = await fetch("/api/files/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name, contentType: file.type }),
        });
        if (!r.ok) throw new Error("Failed to obtain presign");
        pres = await r.json();
      }
      if (!pres?.url)
        throw new Error("Presign URL missing from server response");

      // 2) PUT to presigned url using XHR so we can track progress
      await doUploadWithProgress(pres.url, file, pres.id);

      // 3) Notify server to finalize metadata (optional endpoint)
      try {
        if (api?.apiConfirmUpload && pres.id) {
          await api.apiConfirmUpload(pres.id, {
            size: file.size,
            key: pres.key,
          });
        } else if (pres.id) {
          await fetch(`/api/files/confirm/${pres.id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ size: file.size, key: pres.key }),
          });
        }
      } catch (ignored) {
        // not fatal — metadata may be updated by ingestion job on server
        console.warn("confirm upload failed (nonfatal)", ignored);
      }
    } catch (err: any) {
      console.error("uploadFile error", err);
      setError(err?.message ?? "Upload failed");
    } finally {
      setUploadingMap((m) => {
        const copy = { ...m };
        // remove any zero/finished entries after brief delay handled in doUploadWithProgress
        return copy;
      });
    }
  }

  function doUploadWithProgress(url: string, file: File, metaId?: string) {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url, true);
      xhr.setRequestHeader(
        "Content-Type",
        file.type || "application/octet-stream"
      );

      const idKey = metaId ?? `${file.name}-${Date.now().toString(36)}`;
      setUploadingMap((m) => ({ ...m, [idKey]: 0 }));

      xhr.upload.onprogress = (ev) => {
        if (!ev.lengthComputable) return;
        const pct = Math.round((ev.loaded / ev.total) * 100);
        setUploadingMap((m) => ({ ...m, [idKey]: pct }));
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          // finalize progress at 100% then remove after short delay
          setUploadingMap((m) => ({ ...m, [idKey]: 100 }));
          setTimeout(() => {
            setUploadingMap((m) => {
              const c = { ...m };
              delete c[idKey];
              return c;
            });
          }, 700);
          resolve();
        } else {
          reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
        }
      };

      xhr.onerror = (e) => {
        reject(new Error("Network error during upload"));
      };

      xhr.send(file);
    });
  }

  async function handleDelete(id?: string) {
    if (!id) return;
    if (!confirm("Delete this file? This action cannot be undone.")) return;
    try {
      if (api?.apiDeleteFile) {
        await api.apiDeleteFile(id);
      } else {
        const res = await fetch(`/api/files/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Delete failed");
      }
      await fetchFiles();
    } catch (err: any) {
      console.error("delete error", err);
      setError(err?.message ?? "Delete failed");
    }
  }

  async function handleDownload(id?: string, publicUrl?: string) {
    if (!id && !publicUrl) return;
    try {
      if (publicUrl) {
        // if metadata includes a public URL, open it
        window.open(publicUrl, "_blank");
        return;
      }
      let downloadUrl: string | null = null;
      if (api?.apiGetDownloadUrl) {
        const payload = await api.apiGetDownloadUrl(id);
        downloadUrl = payload?.url ?? null;
      } else {
        const r = await fetch(`/api/files/download/${id}`);
        if (!r.ok) throw new Error("Failed to get download url");
        const j = await r.json();
        downloadUrl = j?.url ?? null;
      }
      if (!downloadUrl) throw new Error("No download URL returned");
      window.open(downloadUrl, "_blank");
    } catch (err: any) {
      console.error("download error", err);
      setError(err?.message ?? "Download failed");
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Files & Uploads</h2>

      <div className="card-surface border border-surface-border p-4 rounded">
        <label className="block text-sm font-medium mb-2">Upload files</label>
        <div className="flex items-center gap-3 flex-wrap">
          <input
            ref={inputRef}
            type="file"
            onChange={handleSelectFiles}
            className="text-sm"
            aria-label="Select file to upload"
          />
          <button
            onClick={() => inputRef.current?.click()}
            className="btn-classroom"
            type="button"
          >
            Choose file
          </button>
          <div className="text-sm text-classroom-muted">
            Max single file: server-limited. Files stored in cloud (metadata in
            DB).
          </div>
        </div>

        {error && <div className="text-sm text-red-600 mt-3">{error}</div>}
      </div>

      <section>
        <h3 className="text-lg font-semibold">Uploaded files</h3>

        {loading && <div className="text-classroom-muted">Loading…</div>}

        {!loading && files.length === 0 && (
          <div className="text-classroom-muted">No files yet.</div>
        )}

        <div className="space-y-3 mt-3">
          {files.map((f) => {
            const id = f._id ?? f.id;
            const progress = id ? uploadingMap[id] ?? 0 : 0;
            return (
              <div
                key={id ?? f.originalName}
                className="card-surface border border-surface-border p-3 rounded flex items-start gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="font-medium truncate">
                      {f.originalName ?? f.path}
                    </div>
                    <div className="text-xs text-classroom-muted">
                      {fmtSize(f.size)}
                    </div>
                    <div className="text-xs text-classroom-muted">
                      {f.mimeType}
                    </div>
                    <div className="ml-auto text-xs text-classroom-muted">
                      {f.createdAt
                        ? new Date(f.createdAt).toLocaleString()
                        : ""}
                    </div>
                  </div>

                  {progress > 0 && progress < 100 && (
                    <div className="mt-2">
                      <div className="w-full bg-surface-contrast rounded h-2 overflow-hidden">
                        <div
                          className="h-2"
                          style={{
                            width: `${progress}%`,
                            background:
                              "linear-gradient(90deg,var(--classroom-primary),var(--classroom-strip))",
                          }}
                        />
                      </div>
                      <div className="text-xs text-classroom-muted mt-1">
                        {progress}%
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(id, f.publicUrl)}
                    className="btn-surface text-sm"
                    title="Download"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => handleDelete(id)}
                    className="btn-surface text-sm"
                    title="Delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
