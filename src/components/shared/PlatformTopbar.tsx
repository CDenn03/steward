"use client";

import { usePathname } from "next/navigation";
import { Search, X, Shield } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from './ThemeToggle';
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";

const pageTitles: Record<string, string> = {
  "/platform-admin":                   "Platform Overview",
  "/platform-admin/organisations":     "Organisations",
  "/platform-admin/users":             "All Users",
};

export function PlatformTopbar() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 767px)");

  const matchedKey = Object.keys(pageTitles)
    .filter((k) => pathname === k || pathname.startsWith(k + "/"))
    .sort((a, b) => b.length - a.length)[0];

  const title = pageTitles[matchedKey ?? ""] ?? "Platform Console";

  return (
    <header className="sticky top-0 z-40 h-14 bg-(--surface) border-b border-(--border) flex items-center gap-4 px-4 md:px-7">
      <div className="flex items-center gap-2 text-[13px] min-w-0">
        <Shield size={13} className="text-(--primary) shrink-0" />
        <span className="text-(--muted) hidden sm:inline">Platform Console</span>
        <span className="text-(--muted) hidden sm:inline">›</span>
        <span className="font-medium text-(--text) truncate">{title}</span>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-1.5 md:gap-2">
        {isMobile ? (
          searchOpen ? (
            <div className="flex items-center gap-1.5">
              <div className="relative w-44">
                <input
                  type="text"
                  placeholder="Search…"
                  autoFocus
                  className={cn(
                    "w-full h-8 pl-3 pr-3 text-[12px] bg-(--surface) border border-(--border)",
                    "rounded-(--r-input) outline-none text-(--text) placeholder:text-(--muted)",
                    "focus:border-(--primary) transition-colors"
                  )}
                />
              </div>
              <button
                onClick={() => setSearchOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-md text-(--muted) hover:text-(--text) transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-(--border) text-(--muted) hover:bg-(--bg) hover:text-(--text) transition-colors"
            >
              <Search size={14} />
            </button>
          )
        ) : (
          <div className="relative w-48">
            <input
              type="text"
              placeholder="Search…"
              className={cn(
                "w-full h-8 pl-3 pr-3 text-[12px] bg-(--surface) border border-(--border)",
                "rounded-(--r-input) outline-none text-(--text) placeholder:text-(--muted)",
                "focus:border-(--primary) transition-colors"
              )}
            />
          </div>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
