"use server";

import { revalidatePath } from "next/cache";
import { requirePlatformAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";
import { getSignedUploadUrl } from "@/lib/storage/r2";
import { validateFileMeta } from "@/lib/storage/validation";
import {
  UpdateMembershipSchema,
  UpdateUserSchema,
  CreateMembershipSchema,
  CreateOrganizationSchema,
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

export type CreateOrganizationResult =
  | { success: true }
  | { success: false; error: { message: string } };

export async function createOrganizationAction(
  formData: unknown
): Promise<CreateOrganizationResult> {
  const session = await requirePlatformAdmin();
  const parsed = CreateOrganizationSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: { message: parsed.error.errors.map(e => e.message).join(", ") } };

  const { name, slug, description, currency, fiscalYearStart, logoUrl, timezone } = parsed.data;

  try {
    const existing = await prisma.organization.findUnique({
      where: { slug },
    });
    if (existing)
      return {
        success: false,
        error: { message: "An organisation with this slug already exists" },
      };

    await prisma.organization.create({
      data: { name, slug, description, currency, fiscalYearStart, logoUrl, timezone },
    });

    revalidatePath("/platform-admin/organisations");
    revalidatePath("/admin/organisations");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: {
        message:
          err instanceof Error ? err.message : "Failed to create organisation",
      },
    };
  }
}

export async function getOrgLogoUploadUrlAction(
  fileName: string,
  mimeType: string
) {
  const session = await requirePlatformAdmin();

  const validationError = validateFileMeta(fileName, mimeType);
  if (validationError) return { error: { message: validationError } };

  try {
    const storageKey = `temp/org-creation/${session.userId}/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const uploadUrl = await getSignedUploadUrl(storageKey, mimeType);
    return { data: { storageKey, uploadUrl } };
  } catch (err) {
    return {
      error: {
        message: err instanceof Error ? err.message : "Failed to get upload URL",
      },
    };
  }
}

export async function saveOrgCreationUploadAction(_storageKey: string) {
  return { success: true };
}
