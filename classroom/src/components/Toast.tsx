// src/components/Toast.tsx
import React, { useEffect } from "react";

type ToastType = "success" | "error" | "info";

export default function Toast({
  visible,
  message,
  type = "info",
  onClose,
  duration = 3000,
}: {
  visible: boolean;
  message: string;
  type?: ToastType;
  onClose?: () => void;
  duration?: number;
}) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(t);
  }, [visible, duration, onClose]);

  if (!visible) return null;

  const base =
    "fixed right-4 bottom-6 z-50 max-w-xs w-full shadow-lg rounded-md px-4 py-3 flex items-start gap-3 transition-transform transform";
  const typeClasses =
    type === "success"
      ? "bg-emerald-600 text-white"
      : type === "error"
      ? "bg-red-600 text-white"
      : "bg-slate-800 text-slate-100";

  return (
    <div className={`${base} ${typeClasses}`} role="status" aria-live="polite">
      <div className="flex-1 text-sm leading-tight">{message}</div>
      <button
        onClick={() => onClose?.()}
        aria-label="Close toast"
        className="opacity-90 hover:opacity-100 ml-2 text-xs"
      >
        ✕
      </button>
    </div>
  );
}
