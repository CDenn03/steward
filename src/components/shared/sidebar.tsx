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

  // Admin-only section
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

export function Sidebar() {
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
    <aside className="fixed left-0 top-0 bottom-0 w-[224px] bg-(--surface) border-r border-(--border) flex flex-col z-50">
      {/* Steward wordmark */}
      <div className="px-4 py-4 border-b border-(--border) flex items-center gap-2.5">
        <div className="w-8 h-8 bg-(--primary) rounded-lg flex items-center justify-center shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6L12 2z"/>
            <polyline points="9 12 11 14 15 10"/>
          </svg>
        </div>
        <div>
          <p className="text-[15px] font-semibold tracking-tight text-(--text)">Steward</p>
          <p className="text-[10px] text-(--muted) uppercase tracking-[0.5px]">Financial Governance</p>
        </div>
      </div>

      {/* Active org pill + switcher */}
      <div className="relative mx-2.5 mt-3 mb-1">
        <button
          onClick={() => setOrgMenuOpen(v => !v)}
          className="w-full text-left px-3 py-2.5 rounded-[var(--r-btn)] flex items-center gap-2.5 hover:opacity-90 active:scale-[0.98] transition-all"
          style={{ background: active ? active.orgColor + "18" : "var(--primary-light)" }}
        >
          <div
            className="w-6 h-6 rounded-[6px] flex items-center justify-center text-white text-[10px] font-bold shrink-0"
            style={{ background: active?.orgColor ?? "var(--primary)" }}
          >
            {active?.orgInitials ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold truncate leading-tight" style={{ color: active?.orgColor ?? "var(--primary)" }}>
              {active?.orgName ?? "Select org"}
            </p>
            <p className="text-[10px] text-(--muted) mt-0.5">
              {active?.orgDescription ?? "No org selected"}
            </p>
          </div>
          <ChevronDown size={13} className={cn("text-(--muted) shrink-0 transition-transform duration-200", orgMenuOpen && "rotate-180")} />
        </button>

        {/* Dropdown */}
        {orgMenuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOrgMenuOpen(false)} />
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-(--surface) border border-(--border) rounded-(--r-card) shadow-card-hover z-20 overflow-hidden">
              <div className="px-3 py-2 border-b border-(--border)">
                <p className="text-[10px] font-medium text-(--muted) uppercase tracking-[0.6px]">Your organisations</p>
              </div>
              {allMemberships.map((m) => (
                <button
                  key={m.orgId}
                  onClick={() => {
                    setOrgMenuOpen(false);
                    if (m.orgId !== active?.orgId) router.push(`/splash/${m.orgId}`);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-(--bg) transition-colors text-left"
                >
                  <div
                    className="w-6 h-6 rounded-[6px] flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                    style={{ background: m.orgColor }}
                  >
                    {m.orgInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium truncate">{m.orgName}</p>
                    <p className="text-[10px] text-(--muted)">{roleLabels[m.role] ?? m.role}</p>
                  </div>
                  {m.orgId === active?.orgId && (
                    <div className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
                  )}
                </button>
              ))}
              <div className="border-t border-(--border)">
                <button
                  onClick={() => { setOrgMenuOpen(false); handleSwitchOrg(); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-[12px] text-(--muted) hover:text-(--text) hover:bg-(--bg) transition-colors"
                >
                  <ArrowLeftRight size={12} /> Switch organisation
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-1">
        {navItems.map((group) => (
          <div key={group.section}>
            <p className="px-4 pt-4 pb-1.5 text-[10px] font-medium text-(--muted) uppercase tracking-[0.8px]">
              {group.section}
            </p>
            {group.items.map((item) => {
              const Icon   = item.icon;
              const active_link = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.label}
                  aria-current={active_link ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2.5 mx-2 px-3 py-1.5 rounded-lg text-[13.5px] transition-all duration-150",
                    active_link
                      ? "bg-[var(--primary-light)] text-(--primary) font-medium"
                      : "text-(--muted) hover:bg-(--bg) hover:text-(--text)"
                  )}
                >
                  <Icon size={15} className={cn("shrink-0", active_link ? "opacity-100" : "opacity-60")} />
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
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-(--border) p-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-[11px] font-semibold text-(--primary) shrink-0">
            {active?.userInitials ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-(--text) truncate">{active?.userName ?? "—"}</p>
            <p className="text-[10px] text-(--muted) truncate">
              {active ? (roleLabels[active.role] ?? active.role) : ""}
            </p>
          </div>
          <button
            title="Sign out"
            onClick={handleSwitchOrg}
            className="w-6 h-6 flex items-center justify-center rounded-md text-(--muted) hover:text-danger hover:bg-danger-bg transition-colors shrink-0"
          >
            <LogOut size={12} />
          </button>
        </div>
      </div>
    </aside>
  );
}
