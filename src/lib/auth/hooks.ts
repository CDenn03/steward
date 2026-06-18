"use client";

import { useOrg } from "@/lib/org/context";
import { can, isPlatformAdmin, type Permission } from "@/lib/auth/permissions";
import type { MemberRole } from "@/types";

/** Returns the current user's role. */
export function useRole(): MemberRole {
  return useOrg().active!.role;
}

/** Returns true if the current user has all of the given permissions. */
export function usePermission(...permissions: Permission[]): boolean {
  const role = useRole();
  return can(role, ...permissions);
}

/** Returns true if the current user is a platform admin. */
export function useIsPlatformAdmin(): boolean {
  return isPlatformAdmin(useRole());
}
