"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Building2, Users, LogOut,
} from "lucide-react";

const navItems = [
  { label: "Overview",       href: "/platform-admin",                icon: LayoutDashboard },
  { label: "Organisations",  href: "/platform-admin/organisations",  icon: Building2 },
  { label: "All Users",      href: "/platform-admin/users",          icon: Users },
];

export function PlatformSidebar({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname();
  const router   = useRouter();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[232px] bg-(--surface) border-r border-(--border) flex flex-col z-50">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-(--border) flex items-center gap-2.5">
        <div>
          <p className="font-display text-[17px] font-semibold tracking-tight text-(--text) leading-tight">Steward</p>
          <p className="text-[11px] text-(--muted) uppercase tracking-[0.6px] mt-0.5">Platform Console</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        <p className="px-5 pt-5 pb-2 text-[11px] font-medium text-(--muted) uppercase tracking-[0.8px]">
          Platform
        </p>
        <div className="space-y-0.5 px-2.5">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || (href !== "/platform-admin" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={onNavClick}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-(--r-btn) text-[13.5px] transition-all duration-150",
                  active
                    ? "bg-(--primary-light) text-(--primary) font-medium"
                    : "text-(--muted) hover:bg-(--bg) hover:text-(--text)"
                )}
              >
                <Icon size={16} className={cn("shrink-0", active ? "opacity-100" : "opacity-60")} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User footer */}
      <div className="border-t border-(--border) p-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[8px] bg-(--primary-light) flex items-center justify-center text-[11.5px] font-semibold text-(--primary) shrink-0">
            PA
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12.5px] font-medium text-(--text) truncate">Platform Admin</p>
            <p className="text-[10.5px] text-(--muted) truncate">Super Administrator</p>
          </div>
          <button
            title="Sign out"
            onClick={() => router.push("/login")}
            className="w-7 h-7 flex items-center justify-center rounded-(--r-btn) text-(--muted) hover:text-(--danger) hover:bg-(--danger-bg) transition-colors shrink-0"
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </aside>
  );
}