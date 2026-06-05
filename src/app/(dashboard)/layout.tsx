"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOrg } from "@/lib/org/context";
import { Sidebar } from "@/components/shared/sidebar";
import { Topbar } from "@/components/shared/topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { active } = useOrg();

  useEffect(() => {
    if (active === null) {
      // Only redirect if we've had a chance to rehydrate (brief timeout)
      const t = setTimeout(() => {
        if (!sessionStorage.getItem("steward_active_org")) {
          router.replace("/org-picker");
        }
      }, 200);
      return () => clearTimeout(t);
    }
  }, [active, router]);

  if (!active) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="flex items-center gap-2.5 text-[var(--muted)] text-[13px]">
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          Loading workspace…
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="ml-[224px] flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-7">{children}</main>
      </div>
    </div>
  );
}
