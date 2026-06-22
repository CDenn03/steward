"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { X } from "lucide-react";

interface Toast { id: number; message: string; type?: "info" | "success" | "error" }
interface ToastCtx { toast: (message: string, type?: Toast["type"]) => void }

const ToastContext = createContext<ToastCtx>({ toast: () => {} });

export function useToast() { return useContext(ToastContext); }

export function ToastProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 5000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 items-end">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-[10px] shadow-lg text-[13px] font-medium min-w-[260px] max-w-[380px] border
              ${t.type === "error"   ? "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300" :
                t.type === "success" ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300" :
                "bg-(--surface) border-(--border) text-(--text)"}`}
          >
            <span className="flex-1">{t.message}</span>
            <button onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))}
              className="text-current opacity-50 hover:opacity-100 shrink-0">
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
