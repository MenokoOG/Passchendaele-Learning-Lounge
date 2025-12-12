// src/components/Toast.tsx
import React from "react";

export default function Toast({
  visible,
  message,
  type = "info",
  onClose,
}: {
  visible: boolean;
  message: string;
  type?: "info" | "success" | "error";
  onClose?: () => void;
}) {
  if (!visible) return null;
  const cls =
    type === "success"
      ? "toast-success"
      : type === "error"
      ? "toast-error"
      : "toast-info";

  return (
    <div className={`toast-root ${cls}`} role="status" aria-live="polite">
      <div className="toast-content">
        <div className="toast-message">{message}</div>
        <button className="toast-close" onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  );
}
