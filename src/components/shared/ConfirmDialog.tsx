"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AlertTriangle, Trash2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export type ConfirmVariant = "danger" | "warning" | "confirm";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const variantConfig: Record<
  ConfirmVariant,
  {
    iconBg: string;
    iconColor: string;
    Icon: React.ElementType;
    buttonVariant: "primary" | "danger" | "warning";
  }
> = {
  danger: {
    iconBg:        "bg-(--danger-bg)",
    iconColor:     "text-(--danger)",
    Icon:          Trash2,
    buttonVariant: "danger",
  },
  warning: {
    iconBg:        "bg-[#FEF3C7]",
    iconColor:     "text-[#D97706]",
    Icon:          AlertTriangle,
    buttonVariant: "warning",
  },
  confirm: {
    iconBg:        "bg-(--primary-light)",
    iconColor:     "text-(--primary)",
    Icon:          CheckCircle,
    buttonVariant: "primary",
  },
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "confirm",
  loading = false,
  onConfirm,
  onCancel,
}: Readonly<ConfirmDialogProps>) {
  const { iconBg, iconColor, Icon, buttonVariant } = variantConfig[variant];

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(v) => { if (!v) onCancel(); }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-60 bg-black/30 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed z-60 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
            "w-full max-w-sm mx-4",
            "bg-(--surface) border border-(--border) rounded-(--r-card) shadow-xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          )}
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          aria-describedby="confirm-dialog-message"
        >
          <div className="p-5">
            <div className={cn("w-9 h-9 rounded-full flex items-center justify-center mb-4", iconBg)}>
              <Icon size={16} className={iconColor} />
            </div>
            <DialogPrimitive.Title className="text-[16px] font-semibold mb-1.5">
              {title}
            </DialogPrimitive.Title>
            <p id="confirm-dialog-message" className="text-[14px] text-(--muted) leading-relaxed">
              {message}
            </p>
          </div>

          <div className="flex justify-end gap-2 px-5 py-4 border-t border-(--border)">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={loading}
            >
              {cancelLabel}
            </Button>
            <Button
              variant={buttonVariant}
              size="sm"
              onClick={onConfirm}
              loading={loading}
            >
              {confirmLabel}
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
