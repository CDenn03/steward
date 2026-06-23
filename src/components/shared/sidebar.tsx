"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useOrg } from "@/lib/org/context";
import {
  LayoutDashboard, Calendar, DollarSign, CheckSquare,
  CreditCard, TrendingUp, Users, Shield, Bell, Settings,
  ChevronDown, TrendingDown, LogOut, ArrowLeftRight, UserCog, Building2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { getUnreadCountAction } from "@/features/notifications/actions";

const roleLabels: Record<string, string> = {
  admin: "Administrator", chairperson: "Chairperson",
  finance: "Finance Officer", department_head: "Department Head", member: "Member",
};

function buildNavItems(role: string, unreadCount = 0) {
  const items = [
    {
      section: "Overview",
      items: [
        { label: "Dashboard",    href: "/dashboard",  icon: LayoutDashboard },
        { label: "Analytics",    href: "/analytics",  icon: TrendingUp },
      ],
    },
    {
      section: "Planning",
      items: [
        { label: "Events",       href: "/events",     icon: Calendar },
        { label: "Budgets",      href: "/budgets",    icon: DollarSign,   badge: role === "finance" || role === "chairperson" ? 3 : 0 },
        { label: "Approvals",    href: "/approvals",  icon: CheckSquare,  badge: role === "finance" || role === "chairperson" ? 5 : 0 },
      ],
    },
    {
      section: "Finance",
      items: [
        { label: "Accounts",     href: "/accounts",     icon: CreditCard },
        { label: "Income",       href: "/income",       icon: TrendingUp },
        { label: "Expenditures", href: "/expenditures", icon: TrendingDown },
      ],
    },
    {
      section: "Organisation",
      items: [
        { label: "Departments",   href: "/departments",  icon: Users },
        { label: "Audit Log",     href: "/audit",        icon: Shield },
        { label: "Notifications", href: "/notifications",icon: Bell,   badge: unreadCount },
        { label: "Settings",      href: "/settings",     icon: Settings },
      ],
    },
  ];

  if (role === "admin") {
    items.push({
      section: "Admin",
      items: [
        { label: "All Users",      href: "/admin/users",         icon: UserCog,    badge: 0 },
        { label: "Organisations",  href: "/admin/organisations",  icon: Building2,  badge: 0 },
      ],
    });
  }

  return items;
}

export function Sidebar({ onNavClick }: { onNavClick?: () => void }) {
  const pathname   = usePathname();
  const router     = useRouter();
  const { active, clearActive, allMemberships } = useOrg();
  const [orgMenuOpen, setOrgMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try { setUnreadCount(await getUnreadCountAction()); } catch { /* ignore */ }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const navItems = buildNavItems(active?.role ?? "member", unreadCount);

  const handleSwitchOrg = () => {
    clearActive();
    router.push("/org-picker");
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[232px] bg-(--surface) border-r border-(--border) flex flex-col z-50">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-(--border) flex items-center gap-2.5">
        <div>
          <p className="text-[16px] font-semibold tracking-tight text-(--text) leading-tight">Steward</p>
          <p className="text-[10px] text-(--muted) uppercase tracking-[0.6px] mt-0.5">Financial Governance</p>
        </div>
      </div>

      {/* Org switcher */}
      <div className="relative mx-3 mt-4 mb-2">
        <button
          onClick={() => setOrgMenuOpen(v => !v)}
          className="w-full text-left px-3.5 py-3 rounded-(--r-btn) flex items-center gap-3 hover:opacity-90 active:scale-[0.98] transition-all"
          style={{ background: active ? active.orgColor + "18" : "var(--primary-light)" }}
        >
          <div
            className="w-7 h-7 rounded-[8px] flex items-center justify-center text-white text-[10.5px] font-bold shrink-0"
            style={{ background: active?.orgColor ?? "var(--primary)" }}
          >
            {active?.orgInitials ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold truncate leading-tight" style={{ color: active?.orgColor ?? "var(--primary)" }}>
              {active?.orgName ?? "Select org"}
            </p>
            <p className="text-[10.5px] text-(--muted) mt-0.5 truncate">
              {active?.orgDescription ?? "No org selected"}
            </p>
          </div>
          <ChevronDown size={13} className={cn("text-(--muted) shrink-0 transition-transform duration-200", orgMenuOpen && "rotate-180")} />
        </button>

        {orgMenuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOrgMenuOpen(false)} />
            <div className="absolute top-full left-0 right-0 mt-2 bg-(--surface) border border-(--border) rounded-(--r-card) shadow-lg z-20 overflow-hidden">
              <div className="px-3.5 py-2.5 border-b border-(--border)">
                <p className="text-[10px] font-medium text-(--muted) uppercase tracking-[0.6px]">Your organisations</p>
              </div>
              {allMemberships.map((m) => (
                <button
                  key={m.orgId}
                  onClick={() => {
                    setOrgMenuOpen(false);
                    if (m.orgId !== active?.orgId) router.push(`/splash/${m.orgId}`);
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-(--bg) transition-colors text-left"
                >
                  <div
                    className="w-7 h-7 rounded-[8px] flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                    style={{ background: m.orgColor }}
                  >
                    {m.orgInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-medium text-(--text) truncate">{m.orgName}</p>
                    <p className="text-[10.5px] text-(--muted)">{roleLabels[m.role] ?? m.role}</p>
                  </div>
                  {m.orgId === active?.orgId && (
                    <div className="w-1.5 h-1.5 rounded-full bg-(--success) shrink-0" />
                  )}
                </button>
              ))}
              <div className="border-t border-(--border)">
                <button
                  onClick={() => { setOrgMenuOpen(false); handleSwitchOrg(); }}
                  className="w-full flex items-center gap-2 px-3.5 py-2.5 text-[12px] text-(--muted) hover:text-(--text) hover:bg-(--bg) transition-colors"
                >
                  <ArrowLeftRight size={12} /> Switch organisation
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        {navItems.map((group) => (
          <div key={group.section}>
            <p className="px-5 pt-5 pb-2 text-[10px] font-medium text-(--muted) uppercase tracking-[0.8px]">
              {group.section}
            </p>
            <div className="space-y-0.5 px-2.5">
              {group.items.map((item) => {
                const Icon   = item.icon;
                const active_link = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavClick}
                    aria-label={item.label}
                    aria-current={active_link ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-(--r-btn) text-[13.5px] transition-all duration-150",
                      active_link
                        ? "bg-(--primary-light) text-(--primary) font-medium"
                        : "text-(--muted) hover:bg-(--bg) hover:text-(--text)"
                    )}
                  >
                    <Icon size={16} className={cn("shrink-0", active_link ? "opacity-100" : "opacity-60")} />
                    <span className="flex-1">{item.label}</span>
                    {!!item.badge && (
                      <span className="bg-(--primary) text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-tight">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-(--border) p-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[8px] bg-(--primary-light) flex items-center justify-center text-[11.5px] font-semibold text-(--primary) shrink-0">
            {active?.userInitials ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12.5px] font-medium text-(--text) truncate">{active?.userName ?? "—"}</p>
            <p className="text-[10.5px] text-(--muted) truncate">
              {active ? (roleLabels[active.role] ?? active.role) : ""}
            </p>
          </div>
          <button
            title="Sign out"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-7 h-7 flex items-center justify-center rounded-(--r-btn) text-(--muted) hover:text-(--danger) hover:bg-(--danger-bg) transition-colors shrink-0"
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </aside>
  );
}