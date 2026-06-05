"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useOrg } from "@/lib/org/context";
import { CheckCircle2 } from "lucide-react";

export default function SplashPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = use(params);
  const router = useRouter();
  const { active, setActive } = useOrg();
  const [phase, setPhase] = useState<"loading" | "ready" | "done">("loading");

  // Ensure the org is set (handles direct navigation / refresh)
  useEffect(() => {
    if (!active || active.orgId !== orgId) {
      setActive(orgId);
    }
  }, [orgId, active, setActive]);

  // Animation sequence: loading → ready → navigate
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("ready"),  900);
    const t2 = setTimeout(() => setPhase("done"),   1700);
    const t3 = setTimeout(() => router.replace("/dashboard"), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [router]);

  const org = active?.orgId === orgId ? active : null;
  const orgName   = org?.orgName   ?? "Loading…";
  const orgColor  = org?.orgColor  ?? "#1F4B99";
  const orgInits  = org?.orgInitials ?? "…";
  const userName  = org?.userName  ?? "";
  const userRole  = org?.role      ?? "";
  const deptName  = org?.departmentName ?? null;

  const roleLabels: Record<string, string> = {
    admin: "Administrator", chairperson: "Chairperson",
    finance: "Finance Officer", department_head: "Department Head", member: "Member",
  };

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{ background: orgColor }}
    >
      {/* Subtle radial highlight */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 40%, rgba(255,255,255,0.18) 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8 px-8 text-center">
        {/* Steward wordmark */}
        <div className="flex items-center gap-2.5 opacity-70">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6L12 2z"/>
            <polyline points="9 12 11 14 15 10"/>
          </svg>
          <span className="text-white text-[13px] font-medium tracking-[0.5px] uppercase opacity-80">Steward</span>
        </div>

        {/* Org logo */}
        <div
          className={`
            w-24 h-24 rounded-[24px] bg-white/20 backdrop-blur-sm
            flex items-center justify-center
            text-white font-bold text-[32px] tracking-tight
            shadow-2xl ring-4 ring-white/20
            transition-all duration-500
            ${phase === "loading" ? "scale-90 opacity-80" : "scale-100 opacity-100"}
          `}
        >
          {phase === "ready" || phase === "done" ? (
            <CheckCircle2 size={44} className="text-white drop-shadow-sm" strokeWidth={1.8} />
          ) : (
            orgInits
          )}
        </div>

        {/* Org name + user context */}
        <div
          className={`transition-all duration-500 ${phase === "loading" ? "opacity-60 translate-y-1" : "opacity-100 translate-y-0"}`}
        >
          <h1 className="text-white text-[24px] font-semibold tracking-tight leading-tight mb-1">
            {orgName}
          </h1>
          {userName && (
            <p className="text-white/70 text-[14px]">
              {userName} · {roleLabels[userRole] ?? userRole}
              {deptName ? ` · ${deptName}` : ""}
            </p>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-48 h-0.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all"
            style={{
              width: phase === "loading" ? "30%" : phase === "ready" ? "85%" : "100%",
              transitionDuration: phase === "loading" ? "800ms" : phase === "ready" ? "700ms" : "200ms",
              transitionTimingFunction: "ease-out",
            }}
          />
        </div>

        <p
          className={`text-white/50 text-[12px] transition-all duration-300 ${phase === "ready" ? "opacity-100" : "opacity-0"}`}
        >
          Loading your workspace…
        </p>
      </div>
    </div>
  );
}
