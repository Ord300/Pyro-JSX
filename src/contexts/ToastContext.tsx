"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import { ToastContainer } from "../components/ui/Toast";

export type ToastType = "success" | "error" | "info";

type Toast = { id: string; message: string; type?: ToastType; duration?: number };

type ToastContextValue = {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, duration?: number) => string;
  removeToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: ToastType = "info", duration = 3000) => {
    const id = String(Date.now()) + Math.random().toString(36).slice(2, 9);
    setToasts((t) => [{ id, message, type, duration }, ...t]);
    return id;
  };

  const removeToast = (id: string) => setToasts((t) => t.filter((x) => x.id !== id));

  const value = useMemo(() => ({ toasts, addToast, removeToast }), [toasts]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts.map((t) => ({ id: t.id, message: t.message, type: t.type, duration: t.duration }))} onClose={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}