"use client";

import { usePathname } from "next/navigation";
import { Shield } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";

const pageTitles: Record<string, string> = {
  "/platform-admin":                   "Platform Overview",
  "/platform-admin/organisations":     "Organisations",
  "/platform-admin/users":             "All Users",
};

export function PlatformTopbar() {
  const pathname = usePathname();

  const matchedKey = Object.keys(pageTitles)
    .filter((k) => pathname === k || pathname.startsWith(k + "/"))
    .sort((a, b) => b.length - a.length)[0];

  const title = pageTitles[matchedKey ?? ""] ?? "Platform Console";

  return (
    <header className="sticky top-0 z-40 h-14 bg-(--surface) border-b border-(--border) flex items-center gap-4 px-7">
      <div className="flex items-center gap-2 text-[13px]">
        <Shield size={13} className="text-(--primary)" />
        <span className="text-(--muted)">Platform Console</span>
        <span className="text-(--muted)">›</span>
        <span className="font-medium text-(--text)">{title}</span>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-2">
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
        <ThemeToggle />
      </div>
    </header>
  );
}
