// src/contexts/ToastContext.tsx
import React, { createContext, useContext, useState, useCallback } from "react";
import Toast from "../components/Toast";

type ToastType = "info" | "success" | "error";

interface ToastContextShape {
  show: (msg: string, type?: ToastType, timeoutMs?: number) => void;
}

const Ctx = createContext<ToastContextShape | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ msg: string; type: ToastType } | null>(
    null
  );

  const show = useCallback(
    (msg: string, type: ToastType = "info", timeoutMs = 3500) => {
      setToast({ msg, type });
      if (timeoutMs > 0) {
        setTimeout(() => setToast(null), timeoutMs);
      }
    },
    []
  );

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      <Toast
        visible={!!toast}
        message={toast?.msg ?? ""}
        type={toast?.type ?? "info"}
        onClose={() => setToast(null)}
      />
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
