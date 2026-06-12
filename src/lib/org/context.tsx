"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { signOut } from "next-auth/react";
import type { MemberRole } from "@/types";

export interface ActiveOrg {
  orgId: string;
  orgName: string;
  orgSlug: string;
  orgInitials: string;
  orgColor: string;
  orgDescription: string;
  currency: string;
  userId: string;
  userName: string;
  userInitials: string;
  userEmail: string;
  role: MemberRole;
  departmentId: string | null;
  departmentName: string | null;
  membershipId: string;
}

interface OrgContextValue {
  active: ActiveOrg | null;
  setActive: (org: ActiveOrg) => void;
  clearActive: () => void;
  allMemberships: ActiveOrg[];
}

const OrgContext = createContext<OrgContextValue | null>(null);

export function OrgProvider({
  initialOrg,
  children,
}: {
  initialOrg?: ActiveOrg | null;
  children: ReactNode;
}) {
  const [active, setActiveState] = useState<ActiveOrg | null>(initialOrg ?? null);

  const setActive = useCallback((org: ActiveOrg) => setActiveState(org), []);

  const clearActive = useCallback(() => {
    setActiveState(null);
    signOut({ callbackUrl: "/login" });
  }, []);

  // For now, allMemberships is just the single active org.
  // Multi-org switching via the org picker will re-populate this once implemented.
  const allMemberships: ActiveOrg[] = active ? [active] : [];

  return (
    <OrgContext.Provider value={{ active, setActive, clearActive, allMemberships }}>
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg(): OrgContextValue {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error("useOrg must be used inside OrgProvider");
  return ctx;
}
