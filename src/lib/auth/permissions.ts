import type { MemberRole } from "@/types";

type Permission =
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
  | "platform.manage"
  | "*";

const rolePermissions: Record<MemberRole, Permission[]> = {
  platform_admin: ["*"],
  admin: ["*"],
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

export function hasPermission(role: MemberRole, permission: Permission): boolean {
  const perms = rolePermissions[role];
  return perms.includes("*") || perms.includes(permission);
}

export function can(role: MemberRole, ...permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}
