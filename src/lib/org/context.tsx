"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { mockOrgs, mockMemberships, mockCurrentUser, mockDepartments } from "@/lib/mock/data";

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
  role: string;
  departmentId: string | null;
  departmentName: string | null;
  membershipId: string;
}

interface OrgContextValue {
  active: ActiveOrg | null;
  setActive: (orgId: string) => void;
  clearActive: () => void;
  allMemberships: ActiveOrg[];
}

const OrgContext = createContext<OrgContextValue | null>(null);
const STORAGE_KEY = "steward_active_org";

function buildActiveOrg(orgId: string): ActiveOrg | null {
  const org = mockOrgs.find((o) => o.id === orgId);
  const membership = mockMemberships.find(
    (m) => m.userId === mockCurrentUser.id && m.organizationId === orgId
  );
  if (!org || !membership) return null;

  const department = membership.departmentId
    ? mockDepartments.find((d) => d.id === membership.departmentId) ?? null
    : null;

  return {
    orgId: org.id,
    orgName: org.name,
    orgSlug: org.slug,
    orgInitials: org.logoInitials,
    orgColor: org.primaryColor,
    orgDescription: org.description,
    currency: org.currency,
    userId: mockCurrentUser.id,
    userName: mockCurrentUser.name,
    userInitials: mockCurrentUser.initials,
    userEmail: mockCurrentUser.email,
    role: membership.role,
    departmentId: membership.departmentId,
    departmentName: department?.name ?? null,
    membershipId: membership.id,
  };
}

export function OrgProvider({ children }: { children: ReactNode }) {
  const [active, setActiveState] = useState<ActiveOrg | null>(null);

  // Derive all orgs this user belongs to
  const allMemberships: ActiveOrg[] = mockMemberships
    .filter((m) => m.userId === mockCurrentUser.id)
    .map((m) => buildActiveOrg(m.organizationId))
    .filter(Boolean) as ActiveOrg[];

  const setActive = useCallback((orgId: string) => {
    const built = buildActiveOrg(orgId);
    if (built) {
      setActiveState(built);
      sessionStorage.setItem(STORAGE_KEY, orgId);
    }
  }, []);

  const clearActive = useCallback(() => {
    setActiveState(null);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  // Rehydrate from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      const built = buildActiveOrg(stored);
      if (built) setActiveState(built);
    }
  }, []);

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
