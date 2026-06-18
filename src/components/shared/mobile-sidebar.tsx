"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar } from "./sidebar";

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed top-3 left-3 z-50 w-8 h-8 flex items-center justify-center rounded-lg bg-(--surface) border border-(--border) text-(--muted) hover:text-(--text) md:hidden"
        aria-label="Open navigation menu"
      >
        <Menu size={16} />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[224px] transition-transform duration-200 ease-in-out md:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="relative h-full">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-md bg-(--surface) border border-(--border) text-(--muted) hover:text-(--text) z-10"
            aria-label="Close navigation menu"
          >
            <X size={14} />
          </button>
          <Sidebar />
        </div>
      </div>
    </>
  );
}
