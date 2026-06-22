"use client";

import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./theme-toggle";
import { useOrg } from "@/lib/org/context";
import { cn } from "@/lib/utils";
import { getUnreadCountAction } from "@/features/notifications/actions";

const pageTitles: Record<string, string> = {
  "/dashboard":          "Dashboard",
  "/analytics":          "Analytics",
  "/events":             "Events",
  "/budgets":            "Budgets",
  "/approvals":          "Approvals",
  "/accounts":           "Accounts",
  "/income":             "Income",
  "/expenditures":       "Expenditures",
  "/departments":        "Departments",
  "/audit":              "Audit Log",
  "/notifications":      "Notifications",
  "/settings":           "Settings",
  "/admin/users":               "User Management",
  "/admin/organisations":       "Organisations",
  "/platform-admin":            "Platform Overview",
  "/platform-admin/organisations": "Organisations",
  "/platform-admin/users":      "All Users",
};

export function Topbar() {
  const pathname = usePathname();
  const { active } = useOrg();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try { setUnreadCount(await getUnreadCountAction()); } catch { /* ignore */ }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);


  const matchedKey = Object.keys(pageTitles)
    .filter(k => pathname === k || pathname.startsWith(k + "/"))
    .sort((a, b) => b.length - a.length)[0];

  const title = pageTitles[matchedKey ?? ""] ?? "Steward";
  const isRoot = matchedKey === "/dashboard";

  return (
    <header className="sticky top-0 z-40 h-14 bg-(--surface) border-b border-(--border) flex items-center gap-4 px-7">
      <div className="flex items-center gap-1.5 text-[13px]">
        {!isRoot && (
          <>
            <Link href="/dashboard" className="text-(--muted) hover:text-(--text) transition-colors">
              {active?.orgName ?? "Steward"}
            </Link>
            <span className="text-(--muted)">›</span>
          </>
        )}
        <span className="font-medium text-(--text)">{title}</span>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <div className="relative w-48">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-(--muted)" />
          <input
            type="text"
            placeholder="Search…"
            className={cn(
              "w-full h-8 pl-7 pr-3 text-[12px] bg-(--surface) border border-(--border)",
              "rounded-(--r-input) outline-none text-(--text) placeholder:text-(--muted)",
              "focus:border-(--primary) transition-colors"
            )}
          />
        </div>
        <ThemeToggle />
        <Link
          href="/notifications"
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
          className="relative w-8 h-8 flex items-center justify-center rounded-lg border border-(--border) text-(--muted) hover:bg-(--bg) hover:text-(--text) transition-colors"
        >
          <Bell size={14} />
          {unreadCount > 0 && (
            <span
              aria-hidden="true"
              className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] flex items-center justify-center bg-danger text-white text-[9px] font-bold rounded-full px-0.5 border border-[var(--surface)]"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
