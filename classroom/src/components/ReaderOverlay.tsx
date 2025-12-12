// src/components/ReaderOverlay.tsx
import React, { useEffect } from "react";

export default function ReaderOverlay({
  open,
  text,
  fontScale = 1.45,
  lineHeight = 1.9,
  letterSpacing = "0.02em",
  onClose,
}: {
  open: boolean;
  text: string;
  fontScale?: number;
  lineHeight?: number;
  letterSpacing?: string | number;
  onClose?: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const previously = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = previously;
    };
  }, [open]);

  if (!open) return null;

  const ls =
    typeof letterSpacing === "number"
      ? `${letterSpacing}em`
      : String(letterSpacing);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative z-10 max-w-4xl w-full bg-white dark:bg-slate-900 p-6 rounded shadow-lg overflow-auto max-h-[85vh]">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-slate-500">Reader</div>
          <button className="text-sm text-slate-600" onClick={onClose}>
            Close
          </button>
        </div>

        <div
          style={{
            fontSize: `${fontScale}rem`,
            lineHeight: lineHeight,
            letterSpacing: ls,
          }}
          className="prose max-w-none dark:prose-invert"
        >
          {text.split(/\n{2,}/).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
