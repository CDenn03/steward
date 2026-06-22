"use client";

import { useOrg } from "@/lib/org/context";
import { can, isPlatformAdmin, type Permission } from "@/lib/auth/permissions";
import type { MemberRole } from "@/types";


export function useRole(): MemberRole {
  return useOrg().active!.role;
}

export function usePermission(...permissions: Permission[]): boolean {
  const role = useRole();
  return can(role, ...permissions);
}

export function useIsPlatformAdmin(): boolean {
  return isPlatformAdmin(useRole());
}
