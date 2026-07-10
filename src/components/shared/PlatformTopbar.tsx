"use client";

import { Search, X } from "lucide-react";
import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { ThemeToggle } from './ThemeToggle';
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";

function useSalutation(firstName: string) {
  return useMemo(() => {
    const hour = new Date().getHours();
    const greeting =
      hour < 12 ? "Good morning" :
      hour < 17 ? "Good afternoon" :
                  "Good evening";
    return firstName ? `${greeting}, ${firstName}` : greeting;
  }, [firstName]);
}

export function PlatformTopbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 767px)");
  const { data: session } = useSession();

  const firstName = session?.user?.name?.split(" ")[0] ?? "";
  const salutation = useSalutation(firstName);

  return (
    <header className="sticky top-0 z-40 h-14 bg-(--surface) border-b border-(--border) flex items-center gap-4 px-4 md:px-7">
      <p className="text-[14px] font-medium text-(--text) truncate min-w-0">
        {salutation}
      </p>
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
                    "w-full h-8 pl-3 pr-3 text-[13px] bg-(--surface) border border-(--border)",
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
                "w-full h-8 pl-3 pr-3 text-[13px] bg-(--surface) border border-(--border)",
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
