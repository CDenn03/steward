"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Building2, Users, Shield, LogOut,
} from "lucide-react";

const navItems = [
  { label: "Overview",       href: "/platform-admin",                icon: LayoutDashboard },
  { label: "Organisations",  href: "/platform-admin/organisations",  icon: Building2 },
  { label: "All Users",      href: "/platform-admin/users",          icon: Users },
];

export function PlatformSidebar() {
  const pathname = usePathname();
  const router   = useRouter();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[224px] bg-[var(--surface)] border-r border-[var(--border)] flex flex-col z-50">
      {/* Wordmark */}
      <div className="px-4 py-4 border-b border-[var(--border)] flex items-center gap-2.5">
        <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6L12 2z"/>
            <polyline points="9 12 11 14 15 10"/>
          </svg>
        </div>
        <div>
          <p className="text-[15px] font-semibold tracking-tight text-[var(--text)]">Steward</p>
          <p className="text-[10px] text-[var(--muted)] uppercase tracking-[0.5px]">Platform Console</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3">
        <p className="px-4 pb-1.5 text-[10px] font-medium text-[var(--muted)] uppercase tracking-[0.8px]">
          Platform
        </p>
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== "/platform-admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 mx-2 px-3 py-1.5 rounded-lg text-[13.5px] transition-all duration-150",
                active
                  ? "bg-[var(--primary-light)] text-[var(--primary)] font-medium"
                  : "text-[var(--muted)] hover:bg-[var(--bg)] hover:text-[var(--text)]"
              )}
            >
              <Icon size={15} className={cn("flex-shrink-0", active ? "opacity-100" : "opacity-60")} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-[var(--border)] p-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-[11px] font-semibold text-[var(--primary)] flex-shrink-0">
            PA
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-[var(--text)] truncate">Platform Admin</p>
            <p className="text-[10px] text-[var(--muted)] truncate">Super Administrator</p>
          </div>
          <button
            title="Sign out"
            onClick={() => router.push("/login")}
            className="w-6 h-6 flex items-center justify-center rounded-md text-[var(--muted)] hover:text-danger hover:bg-danger-bg transition-colors flex-shrink-0"
          >
            <LogOut size={12} />
          </button>
        </div>
      </div>
    </aside>
  );
}
