"use server";

import { revalidatePath } from "next/cache";
import { requirePlatformAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";

export async function updateMembershipAction(membershipId: string, data: { role?: string; departmentId?: string | null }) {
  const session = await requirePlatformAdmin();

  const membership = await prisma.membership.findFirst({
    where: { id: membershipId, organizationId: session.organizationId },
  });
  if (!membership) return { error: "Membership not found" };

  await prisma.membership.update({
    where: { id: membershipId },
    data: {
      ...(data.role ? { role: data.role as never } : {}),
      ...(data.departmentId !== undefined ? { departmentId: data.departmentId } : {}),
    },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function removeMembershipAction(membershipId: string) {
  const session = await requirePlatformAdmin();

  const membership = await prisma.membership.findFirst({
    where: { id: membershipId, organizationId: session.organizationId },
  });
  if (!membership) return { error: "Membership not found" };

  await prisma.membership.update({
    where: { id: membershipId },
    data: { isActive: false },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function createOrganizationAction(data: {
  name: string;
  slug: string;
  currency?: string;
  fiscalYearStart?: string;
}) {
  const session = await requirePlatformAdmin();

  const existing = await prisma.organization.findUnique({ where: { slug: data.slug } });
  if (existing) return { error: { message: "An organisation with this slug already exists" } };

  const org = await prisma.organization.create({
    data: {
      name: data.name,
      slug: data.slug,
      currency: data.currency ?? "KES",
      fiscalYearStart: data.fiscalYearStart ?? "01-01",
    },
  });

  revalidatePath("/platform-admin/organisations");
  revalidatePath("/admin/organisations");
  return { data: org };
}
