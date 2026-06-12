"use client";
import { can, type Permission } from "@/lib/auth/permissions";
import type { MemberRole } from "@/types";

interface PermissionGuardProps {
  role: MemberRole;
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGuard({ role, permission, children, fallback = null }: PermissionGuardProps) {
  if (!can(role, permission)) return <>{fallback}</>;
  return <>{children}</>;
}
