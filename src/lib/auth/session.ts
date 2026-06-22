import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { auth } from "./auth";
import { prisma } from "@/lib/prisma/client";
import { can, isPlatformAdmin, isOrgRole, type Permission } from "./permissions";
import type { MemberRole } from "@/types";

export interface SessionContext {
  userId: string;
  organizationId: string;
  role: MemberRole;
  membershipId: string;
  user: { id: string; name: string; email: string };
  organization: { id: string; name: string; slug: string; currency: string };
  departmentId: string | null;
}


export async function requireSession(organizationSlug?: string): Promise<SessionContext> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

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

export async function requirePlatformAdmin(): Promise<SessionContext> {
  const session = await requireSession();
  if (!isPlatformAdmin(session.role)) redirect("/dashboard");
  return session;
}

export async function requireOrgSession(organizationSlug?: string): Promise<SessionContext> {
  const session = await requireSession(organizationSlug);
  if (!isOrgRole(session.role)) redirect("/platform-admin");
  return session;
}

export async function requirePermission(
  permission: Permission,
  organizationSlug?: string,
): Promise<SessionContext> {
  const session = await requireOrgSession(organizationSlug);
  if (!can(session.role, permission)) redirect("/403");
  return session;
}

export async function requireRole(
  role: MemberRole | MemberRole[],
  organizationSlug?: string,
): Promise<SessionContext> {
  const session = await requireOrgSession(organizationSlug);
  const allowed = Array.isArray(role) ? role : [role];
  if (!allowed.includes(session.role)) redirect("/403");
  return session;
}
