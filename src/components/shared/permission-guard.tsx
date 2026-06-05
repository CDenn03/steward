"use client";
import { hasPermission } from "@/lib/auth/permissions";
import type { MemberRole } from "@/types";

type Permission =
  | "budget.create" | "budget.edit_own" | "budget.submit" | "budget.review"
  | "budget.approve_finance" | "budget.approve_chair" | "expenditure.create"
  | "expenditure.review" | "receipt.upload" | "income.record" | "account.manage"
  | "disbursement.create" | "disbursement.approve" | "analytics.view"
  | "organization.manage" | "users.manage" | "*";

interface PermissionGuardProps {
  role: MemberRole;
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGuard({ role, permission, children, fallback = null }: PermissionGuardProps) {
  if (!hasPermission(role, permission)) return <>{fallback}</>;
  return <>{children}</>;
}
