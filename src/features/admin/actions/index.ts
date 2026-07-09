"use server";

import { revalidatePath } from "next/cache";
import { requirePlatformAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";
import bcrypt from "bcryptjs";
import {
  UpdateMembershipSchema,
  UpdateUserSchema,
  CreateMembershipSchema,
  CreateOrganizationSchema,
  CreatePlatformUserSchema
} from "../schemas";

export async function updateMembershipAction(
  membershipId: string,
  formData: unknown
) {
  const session = await requirePlatformAdmin();
  const parsed = UpdateMembershipSchema.safeParse(formData);
  if (!parsed.success) return { error: "Invalid input" };

  const membership = await prisma.membership.findFirst({
    where: { id: membershipId, organizationId: session.organizationId },
  });
  if (!membership) return { error: "Membership not found" };

  try {
    await prisma.membership.update({
      where: { id: membershipId },
      data: {
        ...(parsed.data.role ? { role: parsed.data.role as never } : {}),
        ...(parsed.data.departmentId !== undefined
          ? { departmentId: parsed.data.departmentId }
          : {}),
      },
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Update failed" };
  }

  revalidatePath("/admin/users");
  return { success: true };
}

export async function removeMembershipAction(membershipId: string) {
  const session = await requirePlatformAdmin();

  const membership = await prisma.membership.findFirst({
    where: { id: membershipId, organizationId: session.organizationId },
  });
  if (!membership) return { error: "Membership not found" };

  try {
    await prisma.membership.update({
      where: { id: membershipId },
      data: { isActive: false },
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Remove failed" };
  }

  revalidatePath("/admin/users");
  return { success: true };
}

export async function createOrganizationAction(formData: unknown) {
  const session = await requirePlatformAdmin();
  const parsed = CreateOrganizationSchema.safeParse(formData);
  if (!parsed.success) return { error: { message: "Invalid input" } };

  const { name, slug, currency, fiscalYearStart } = parsed.data;

  try {
    const existing = await prisma.organization.findUnique({
      where: { slug },
    });
    if (existing)
      return {
        error: { message: "An organisation with this slug already exists" },
      };

    const org = await prisma.organization.create({
      data: { name, slug, currency, fiscalYearStart },
    });

    revalidatePath("/platform-admin/organisations");
    revalidatePath("/admin/organisations");
    return { data: org };
  } catch (err) {
    return {
      error: {
        message: err instanceof Error ? err.message : "Creation failed",
      },
    };
  }
}

export async function updateUserAction(userId: string, formData: unknown) {
  await requirePlatformAdmin();
  const parsed = UpdateUserSchema.safeParse(formData);
  if (!parsed.success) return { error: "Invalid input" };

  try {
    await prisma.user.update({
      where: { id: userId },
      data: parsed.data,
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Update failed" };
  }

  revalidatePath("/platform-admin/users");
  return { success: true };
}

export async function deleteUserAction(userId: string) {
  await requirePlatformAdmin();

  try {
    await prisma.user.delete({ where: { id: userId } });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Delete failed" };
  }

  revalidatePath("/platform-admin/users");
  return { success: true };
}

export async function updatePlatformMembershipAction(
  membershipId: string,
  formData: unknown
) {
  await requirePlatformAdmin();
  const parsed = UpdateMembershipSchema.safeParse(formData);
  if (!parsed.success) return { error: "Invalid input" };

  try {
    await prisma.membership.update({
      where: { id: membershipId },
      data: {
        ...(parsed.data.role ? { role: parsed.data.role as never } : {}),
      },
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Update failed" };
  }

  revalidatePath("/platform-admin/users");
  return { success: true };
}

export async function removePlatformMembershipAction(membershipId: string) {
  await requirePlatformAdmin();

  try {
    await prisma.membership.delete({ where: { id: membershipId } });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Remove failed" };
  }

  revalidatePath("/platform-admin/users");
  return { success: true };
}

export async function createPlatformMembershipAction(formData: unknown) {
  await requirePlatformAdmin();
  const parsed = CreateMembershipSchema.safeParse(formData);
  if (!parsed.success) return { error: "Invalid input" };

  try {
    await prisma.membership.create({
      data: {
        userId: parsed.data.userId,
        organizationId: parsed.data.organizationId,
        role: parsed.data.role as never,
      },
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Create failed" };
  }

  revalidatePath("/platform-admin/users");
  return { success: true };
}

export async function createPlatformUserAction(formData: unknown) {
  await requirePlatformAdmin();

  const parsed = CreatePlatformUserSchema.safeParse(formData);

  if (!parsed.success) {
    return { error: "Invalid input" };
  }

  try {
    // Check whether email already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: parsed.data.email,
      },
    });

    if (existingUser) {
      return {
        error: "A user with this email already exists",
      };
    }

    const hashedPassword = await bcrypt.hash(parsed.data.password, 10);
    const user = await prisma.user.create({
  data: {
    name: parsed.data.name,
    email: parsed.data.email,
    password: hashedPassword,
  },
});

await prisma.membership.create({
  data: {
    userId: user.id,
    organizationId: parsed.data.organizationId,
    role: parsed.data.role,
  },
});
    revalidatePath("/platform-admin/users");

    return {
      success: true,
    };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to create user",
    };
  }
}
