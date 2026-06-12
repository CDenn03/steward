import type { MemberRole } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Permission =
  | "budget.create"
  | "budget.edit_own"
  | "budget.submit"
  | "budget.review"
  | "budget.approve_finance"
  | "budget.approve_chair"
  | "expenditure.create"
  | "expenditure.review"
  | "receipt.upload"
  | "income.record"
  | "account.manage"
  | "disbursement.create"
  | "disbursement.approve"
  | "analytics.view"
  | "organization.manage"
  | "users.manage"
  | "platform.manage";

// ─── Role → Permission map ────────────────────────────────────────────────────
// Single source of truth. "*" means all non-platform permissions.

const WILDCARD = "*" as const;

const rolePermissions: Record<MemberRole, Permission[] | typeof WILDCARD> = {
  platform_admin: WILDCARD,
  admin:          WILDCARD,
  chairperson: [
    "budget.approve_chair",
    "budget.review",
    "analytics.view",
    "organization.manage",
    "users.manage",
  ],
  finance: [
    "budget.review",
    "budget.approve_finance",
    "account.manage",
    "disbursement.approve",
    "expenditure.review",
    "income.record",
    "analytics.view",
  ],
  department_head: [
    "budget.create",
    "budget.edit_own",
    "budget.submit",
    "expenditure.create",
    "receipt.upload",
    "disbursement.create",
  ],
  member: ["receipt.upload"],
};

// ─── Route access map ─────────────────────────────────────────────────────────
// Maps route prefixes to the minimum permission required to enter.
// Layouts/pages call requirePermission(session, "budget.approve_chair") etc.

export const routePermissions: Record<string, Permission> = {
  "/analytics":    "analytics.view",
  "/accounts":     "account.manage",
  "/income":       "income.record",
  "/approvals":    "budget.review",
  "/audit":        "analytics.view",
  "/departments":  "organization.manage",
  "/settings":     "organization.manage",
  "/admin":        "users.manage",
};

// ─── Core helpers ─────────────────────────────────────────────────────────────

export function can(role: MemberRole, ...permissions: Permission[]): boolean {
  const perms = rolePermissions[role];
  if (perms === WILDCARD) return true;
  return permissions.every((p) => perms.includes(p));
}

export function isPlatformAdmin(role: MemberRole): boolean {
  return role === "platform_admin";
}

export function isOrgRole(role: MemberRole): boolean {
  return role !== "platform_admin";
}
