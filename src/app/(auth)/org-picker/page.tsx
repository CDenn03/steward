"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOrg } from "@/lib/org/context";
import { Building2, ChevronRight, CheckCircle2, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const roleLabels: Record<string, string> = {
  admin:           "Administrator",
  chairperson:     "Chairperson",
  finance:         "Finance Officer",
  department_head: "Department Head",
  member:          "Member",
};

export default function OrgPickerPage() {
  const router = useRouter();
  const { allMemberships, setActive } = useOrg();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelect = async (orgId: string) => {
    if (loading) return;
    setSelected(orgId);
    setLoading(true);

    // Brief pause so the selection registers visually before navigating
    await new Promise((r) => setTimeout(r, 180));
    setActive(orgId);

    // Navigate to splash screen, which redirects to dashboard after animation
    router.push(`/splash/${orgId}`);
  };

  return (
    <div className="w-full max-w-[480px]">
      {/* Header */}
      <div className="flex items-center justify-center gap-2.5 mb-10">
        <div className="w-10 h-10 bg-[var(--primary)] rounded-[10px] flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6L12 2z"/>
            <polyline points="9 12 11 14 15 10"/>
          </svg>
        </div>
        <div>
          <p className="text-[18px] font-semibold tracking-tight">Steward</p>
          <p className="text-[10px] text-[var(--muted)] uppercase tracking-[0.5px]">Financial Governance</p>
        </div>
      </div>

      <div className="mb-6 text-center">
        <h1 className="text-[22px] font-semibold tracking-tight mb-1">Choose an organisation</h1>
        <p className="text-[13px] text-[var(--muted)]">
          You are a member of {allMemberships.length} organisation{allMemberships.length !== 1 ? "s" : ""}.
          Select one to continue.
        </p>
      </div>

      <div className="space-y-3">
        {allMemberships.map((m) => {
          const isSelected = selected === m.orgId;
          return (
            <button
              key={m.orgId}
              onClick={() => handleSelect(m.orgId)}
              disabled={loading}
              className={cn(
                "w-full text-left bg-[var(--surface)] border rounded-[var(--r-card)] p-4",
                "hover:border-[var(--primary)] hover:shadow-card-hover transition-all duration-150",
                "disabled:cursor-not-allowed group",
                isSelected
                  ? "border-[var(--primary)] ring-2 ring-[var(--primary)] ring-opacity-20"
                  : "border-[var(--border)]"
              )}
            >
              <div className="flex items-center gap-3.5">
                {/* Org logo */}
                <div
                  className="w-11 h-11 rounded-[10px] flex items-center justify-center text-white font-semibold text-[15px] flex-shrink-0"
                  style={{ background: m.orgColor }}
                >
                  {m.orgInitials}
                </div>

                {/* Org info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[14px] font-semibold truncate">{m.orgName}</p>
                  </div>
                  <p className="text-[12px] text-[var(--muted)]">{m.orgDescription}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium"
                      style={{
                        background: m.orgColor + "18",
                        color: m.orgColor,
                      }}
                    >
                      {roleLabels[m.role] ?? m.role}
                    </span>
                    {m.departmentName && (
                      <span className="text-[11px] text-[var(--muted)]">· {m.departmentName}</span>
                    )}
                  </div>
                </div>

                {/* Arrow or check */}
                <div className="flex-shrink-0">
                  {isSelected && loading ? (
                    <svg className="animate-spin w-5 h-5 text-[var(--primary)]" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                  ) : (
                    <ChevronRight
                      size={18}
                      className={cn(
                        "transition-colors",
                        isSelected ? "text-[var(--primary)]" : "text-[var(--border)] group-hover:text-[var(--muted)]"
                      )}
                    />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Sign out */}
      <button
        className="w-full mt-6 flex items-center justify-center gap-2 text-[12px] text-[var(--muted)] hover:text-[var(--text)] transition-colors py-2"
        onClick={() => router.push("/login")}
      >
        <LogOut size={13} />
        Sign out
      </button>
    </div>
  );
}
