import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { auth } from "./auth";
import { prisma } from "@/lib/prisma/client";
import { can, isPlatformAdmin, isOrgRole, type Permission } from "./permissions";
import type { MemberRole } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SessionContext {
  userId: string;
  organizationId: string;
  role: MemberRole;
  membershipId: string;
  user: { id: string; name: string; email: string };
  organization: { id: string; name: string; slug: string; currency: string };
  departmentId: string | null;
}

// ─── Session fetch ────────────────────────────────────────────────────────────

export async function requireSession(organizationSlug?: string): Promise<SessionContext> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Try cookie-based org slug as default if none provided explicitly
  if (!organizationSlug) {
    try {
      const cookieStore = await cookies();
      organizationSlug = cookieStore.get("org_slug")?.value;
    } catch {
      // cookies() may be unavailable outside request context
    }
  }

  const membership = await prisma.membership.findFirst({
    where: {
      userId: session.user.id,
      isActive: true,
      ...(organizationSlug ? { organization: { slug: organizationSlug } } : {}),
    },
    include: { organization: true, user: true },
  });

  if (!membership) redirect("/org-picker");

  return {
    userId: membership.userId,
    organizationId: membership.organizationId,
    role: membership.role.toLowerCase() as MemberRole,
    membershipId: membership.id,
    departmentId: membership.departmentId,
    user: {
      id: membership.user.id,
      name: membership.user.name,
      email: membership.user.email,
    },
    organization: {
      id: membership.organization.id,
      name: membership.organization.name,
      slug: membership.organization.slug,
      currency: membership.organization.currency,
    },
  };
}

// ─── Access guards ────────────────────────────────────────────────────────────
// Call these in layouts/pages. They redirect rather than throw so the
// user sees a proper 403 page, not a crash.

/** Require the session role to be platform_admin. */
export async function requirePlatformAdmin(): Promise<SessionContext> {
  const session = await requireSession();
  if (!isPlatformAdmin(session.role)) redirect("/dashboard");
  return session;
}

/** Require the session role to be any org role (not platform_admin). */
export async function requireOrgSession(organizationSlug?: string): Promise<SessionContext> {
  const session = await requireSession(organizationSlug);
  if (!isOrgRole(session.role)) redirect("/platform-admin");
  return session;
}

/** Require the session to have a specific permission; redirect to /403 otherwise. */
export async function requirePermission(
  permission: Permission,
  organizationSlug?: string,
): Promise<SessionContext> {
  const session = await requireOrgSession(organizationSlug);
  if (!can(session.role, permission)) redirect("/403");
  return session;
}

/** Require an exact role match; redirect to /403 otherwise. */
export async function requireRole(
  role: MemberRole | MemberRole[],
  organizationSlug?: string,
): Promise<SessionContext> {
  const session = await requireOrgSession(organizationSlug);
  const allowed = Array.isArray(role) ? role : [role];
  if (!allowed.includes(session.role)) redirect("/403");
  return session;
}
