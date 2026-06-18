"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const roleLabels: Record<string, string> = {
  PLATFORM_ADMIN:  "Platform Admin",
  CHAIRPERSON:     "Chairperson",
  FINANCE:         "Finance Officer",
  DEPARTMENT_HEAD: "Department Head",
  MEMBER:          "Member",
};

interface Membership {
  membershipId: string;
  orgId: string;
  orgName: string;
  orgInitials: string;
  orgColor: string;
  orgDescription: string;
  role: string;
  departmentName: string | null;
}

export function OrgPickerClient({ memberships }: Readonly<{ memberships: Membership[] }>) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Auto-select if only one membership
  useEffect(() => {
    if (memberships.length === 1) {
      router.replace(`/splash/${memberships[0].orgId}`);
    }
  }, [memberships, router]);

  const handleSelect = async (orgId: string) => {
    if (loading) return;
    setSelected(orgId);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 180));
    router.push(`/splash/${orgId}`);
  };

  return (
    <div className="w-full max-w-[480px]">
      <div className="flex items-center justify-center gap-2.5 mb-10">
        <div className="w-10 h-10 bg-(--primary) rounded-[10px] flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6L12 2z"/>
            <polyline points="9 12 11 14 15 10"/>
          </svg>
        </div>
        <div>
          <p className="text-[18px] font-semibold tracking-tight">Steward</p>
          <p className="text-[10px] text-(--muted) uppercase tracking-[0.5px]">Financial Governance</p>
        </div>
      </div>

      <div className="mb-6 text-center">
        <h1 className="text-[22px] font-semibold tracking-tight mb-1">Choose an organisation</h1>
        <p className="text-[13px] text-(--muted)">
          You are a member of {memberships.length} organisation{memberships.length !== 1 ? "s" : ""}. Select one to continue.
        </p>
      </div>

      <div className="space-y-3">
        {memberships.map((m) => {
          const isSelected = selected === m.orgId;
          return (
            <button
              key={m.orgId}
              onClick={() => handleSelect(m.orgId)}
              disabled={loading}
              className={cn(
                "w-full text-left bg-(--surface) border rounded-(--r-card) p-4",
                "hover:border-(--primary) hover:shadow-card-hover transition-all duration-150",
                "disabled:cursor-not-allowed group",
                isSelected
                  ? "border-(--primary) ring-2 ring-(--primary) ring-opacity-20"
                  : "border-(--border)"
              )}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className="w-11 h-11 rounded-[10px] flex items-center justify-center text-white font-semibold text-[15px] shrink-0"
                  style={{ background: m.orgColor }}
                >
                  {m.orgInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold truncate mb-0.5">{m.orgName}</p>
                  <p className="text-[12px] text-(--muted)">{m.orgDescription}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium"
                      style={{ background: m.orgColor + "18", color: m.orgColor }}
                    >
                      {roleLabels[m.role] ?? m.role}
                    </span>
                    {m.departmentName && (
                      <span className="text-[11px] text-(--muted)">· {m.departmentName}</span>
                    )}
                  </div>
                </div>
                <div className="shrink-0">
                  {isSelected && loading ? (
                    <svg className="animate-spin w-5 h-5 text-(--primary)" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                  ) : (
                    <ChevronRight size={18} className={cn("transition-colors", isSelected ? "text-(--primary)" : "text-(--border) group-hover:text-(--muted)")} />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <button
        className="w-full mt-6 flex items-center justify-center gap-2 text-[12px] text-(--muted) hover:text-(--text) transition-colors py-2"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        <LogOut size={13} />
        Sign out
      </button>
    </div>
  );
}
