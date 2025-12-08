// src/pages/Files.tsx
import React, { useEffect, useState } from "react";
import { apiListFiles } from "../api";

export default function FilesPage() {
  const [files, setFiles] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const r = await apiListFiles();
        setFiles(Array.isArray(r) ? r : []);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Files</h2>
      {files.length === 0 ? (
        <div className="text-classroom-muted">No files found.</div>
      ) : (
        <div className="space-y-2">
          {files.map((f) => (
            <div
              key={f._id || f.id}
              className="card-surface border border-surface-border p-3 rounded flex items-center justify-between"
            >
              <div>
                <div className="font-medium">{f.name}</div>
                <div className="text-sm text-classroom-muted">
                  {f.size ? `${f.size} bytes` : ""}
                </div>
              </div>
              <a
                href={f.url}
                target="_blank"
                rel="noreferrer"
                className="btn-surface"
              >
                Download
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
