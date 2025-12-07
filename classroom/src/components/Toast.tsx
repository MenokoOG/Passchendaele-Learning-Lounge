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

  const typeClass =
    type === "success"
      ? "toast-success"
      : type === "error"
      ? "toast-error"
      : "toast-info";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`toast-root ${typeClass}`}
      onClick={() => onClose?.()}
    >
      <div className="toast-content">
        <div className="toast-message">{message}</div>
        <button
          className="toast-close"
          aria-label="Close"
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
          title="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
