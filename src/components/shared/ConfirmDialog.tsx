"use client";

import { Button } from '@/components/ui/Button';
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: "danger" | "default";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  variant = "default",
  loading = false,
  onConfirm,
  onCancel,
}: Readonly<ConfirmDialogProps>) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" role="dialog" aria-modal="true" aria-label={title}>
      <div className="bg-(--surface) border border-(--border) rounded-(--r-card) shadow-xl w-full max-w-sm mx-4">
        <div className="p-5">
          {variant === "danger" && (
            <div className="w-8 h-8 rounded-full bg-danger-bg flex items-center justify-center mb-3">
              <AlertTriangle size={15} className="text-danger" />
            </div>
          )}
          <p className="text-[16px] font-semibold mb-1">{title}</p>
          <p className="text-[14px] text-(--muted) leading-relaxed">{message}</p>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-(--border)">
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={loading}>Cancel</Button>
          <Button size="sm" onClick={onConfirm} loading={loading}
            className={variant === "danger" ? "bg-danger text-white hover:bg-danger/90" : ""}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
