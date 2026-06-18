import { create } from "zustand";
import type { MemberRole } from "@/types";

// ─── Session / current user ───────────────────────────────────────────────────

interface SessionState {
  userId: string | null;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
  role: MemberRole | null;
  /** null means not yet resolved; undefined means no active org */
  organizationId: string | null;
  departmentId: string | null;

  setSession: (data: Omit<SessionState, "setSession" | "clearSession">) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  userId: null,
  name: null,
  email: null,
  avatarUrl: null,
  role: null,
  organizationId: null,
  departmentId: null,

  setSession: (data) => set(data),
  clearSession: () =>
    set({
      userId: null,
      name: null,
      email: null,
      avatarUrl: null,
      role: null,
      organizationId: null,
      departmentId: null,
    }),
}));

// ─── Active organisation ──────────────────────────────────────────────────────

interface OrgState {
  id: string | null;
  name: string | null;
  slug: string | null;
  currency: string;
  logoUrl: string | null;

  setOrg: (data: Omit<OrgState, "setOrg" | "clearOrg">) => void;
  clearOrg: () => void;
}

export const useOrgStore = create<OrgState>((set) => ({
  id: null,
  name: null,
  slug: null,
  currency: "KES",
  logoUrl: null,

  setOrg: (data) => set(data),
  clearOrg: () =>
    set({ id: null, name: null, slug: null, currency: "KES", logoUrl: null }),
}));
