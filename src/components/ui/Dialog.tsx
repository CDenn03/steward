"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({
  className,
  children,
  ...props
}: Readonly<DialogPrimitive.DialogContentProps>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/30 data-[state=open]:animate-in data-[state=closed]:animate-out" />
      <DialogPrimitive.Content
        className={cn(
          "fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
          "w-full max-w-lg max-h-[90vh] flex flex-col",
          "bg-(--surface) border border-(--border) rounded-(--r-card) shadow-xl",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute top-4 right-5 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-(--bg) transition-colors text-(--muted) cursor-pointer">
          <X size={16} />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogHeader({
  className,
  children,
}: Readonly<{ className?: string; children: React.ReactNode }>) {
  return (
    <div className={cn("flex items-center justify-between px-5 py-4 border-b border-(--border) shrink-0", className)}>
      {children}
    </div>
  );
}

export function DialogTitle({
  className,
  ...props
}: Readonly<DialogPrimitive.DialogTitleProps>) {
  return (
    <DialogPrimitive.Title
      className={cn("text-[15px] font-semibold", className)}
      {...props}
    />
  );
}

export function DialogBody({
  className,
  children,
}: Readonly<{ className?: string; children: React.ReactNode }>) {
  return (
    <div className={cn("p-5 space-y-5 overflow-y-auto", className)}>
      {children}
    </div>
  );
}

export function DialogFooter({
  className,
  children,
}: Readonly<{ className?: string; children: React.ReactNode }>) {
  return (
    <div className={cn("flex justify-end gap-2 px-5 py-4 border-t border-(--border) shrink-0", className)}>
      {children}
    </div>
  );
}
