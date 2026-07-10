"use client";

import { createContext, useContext, useState, useCallback, useRef } from "react";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";

let nextId = 1;

interface Toast { id: number; message: string; type: "info" | "success" | "error" }
interface ToastCtx { toast: (message: string, type?: Toast["type"]) => void }

const ToastContext = createContext<ToastCtx>({ toast: () => {} });

export function useToast() { return useContext(ToastContext); }

const ICONS = {
  success: <CheckCircle2 size={15} className="shrink-0 text-(--success)" />,
  error:   <AlertCircle  size={15} className="shrink-0 text-(--danger)" />,
  info:    <Info         size={15} className="shrink-0 text-(--primary)" />,
};

const DURATION = 4000;

export function ToastProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const scheduleDismiss = useCallback((id: number, delay: number) => {
    const existing = timers.current.get(id);
    if (existing) clearTimeout(existing);
    timers.current.set(
      id,
      setTimeout(() => {
        timers.current.delete(id);
        setToasts((p) => p.filter((t) => t.id !== id));
      }, delay)
    );
  }, []);

  const toast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = nextId++;
    setToasts((p) => [...p, { id, message, type }]);
    scheduleDismiss(id, DURATION);
  }, [scheduleDismiss]);

  const dismiss = useCallback((id: number) => {
    const existing = timers.current.get(id);
    if (existing) clearTimeout(existing);
    timers.current.delete(id);
    setToasts((p) => p.filter((t) => t.id !== id));
  }, []);

  const handleMouseEnter = useCallback((id: number) => {
    const existing = timers.current.get(id);
    if (existing) clearTimeout(existing);
    timers.current.delete(id);
  }, []);

  const handleMouseLeave = useCallback((id: number) => {
    scheduleDismiss(id, DURATION);
  }, [scheduleDismiss]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        style={{ position: "fixed", top: "1.25rem", right: "1.25rem", width: "360px", maxWidth: "calc(100vw - 2.5rem)", zIndex: 9999 }}
        className="flex flex-col gap-2 pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="alert"
            onMouseEnter={() => handleMouseEnter(t.id)}
            onMouseLeave={() => handleMouseLeave(t.id)}
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl bg-(--surface) border border-(--border) shadow-lg shadow-black/8 dark:shadow-black/40 text-[14px] text-(--text) w-full"
          >
            {ICONS[t.type]}
            <span className="flex-1 leading-snug">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="shrink-0 text-(--muted) hover:text-(--text) transition-colors"
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
