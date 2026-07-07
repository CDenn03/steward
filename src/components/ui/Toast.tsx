"use client";

import { createContext, useContext, useState, useCallback, useRef } from "react";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";

let nextId = 1;

interface Toast { id: number; message: string; type: "info" | "success" | "error" }
interface ToastCtx { toast: (message: string, type?: Toast["type"]) => void }

const ToastContext = createContext<ToastCtx>({ toast: () => {} });

export function useToast() { return useContext(ToastContext); }

const ICONS = {
  success: <CheckCircle2 size={15} className="shrink-0 text-emerald-500" />,
  error:   <AlertCircle  size={15} className="shrink-0 text-red-500" />,
  info:    <Info         size={15} className="shrink-0 text-blue-500" />,
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
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-lg shadow-black/8 dark:shadow-black/40 text-[13px] text-zinc-800 dark:text-zinc-100 w-full"
          >
            {ICONS[t.type]}
            <span className="flex-1 leading-snug">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="shrink-0 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
