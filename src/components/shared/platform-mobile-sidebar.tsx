"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlatformSidebar } from "./platform-sidebar";

export function PlatformMobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed top-3 left-3 z-50 w-9 h-9 flex items-center justify-center rounded-(--r-btn) bg-(--surface) border border-(--border) text-(--muted) hover:text-(--text) hover:border-(--primary) transition-colors shadow-sm md:hidden"
        aria-label="Open navigation menu"
      >
        <Menu size={16} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[232px] transition-transform duration-200 ease-in-out md:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="relative h-full shadow-xl">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-3 w-7 h-7 flex items-center justify-center rounded-(--r-btn) bg-(--bg) border border-(--border) text-(--muted) hover:text-(--text) z-10 transition-colors"
            aria-label="Close navigation menu"
          >
            <X size={14} />
          </button>
          <PlatformSidebar onNavClick={() => setOpen(false)} />
        </div>
      </div>
    </>
  );
}