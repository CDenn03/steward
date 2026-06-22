"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";
import { generateStorageKey, getSignedUploadUrl } from "@/lib/storage/r2";
import { validateFileMeta } from "@/lib/storage/validation";
import {
  UpdateOrganizationSchema,
  UpdateUserProfileSchema,
} from "../schemas";

export async function updateOrganizationAction(formData: unknown) {
  const session = await requireSession();
  const parsed = UpdateOrganizationSchema.safeParse(formData);
  if (!parsed.success) return { error: "Invalid input" };

  const { name, currency, fiscalYearStart } = parsed.data;

  try {
    await prisma.organization.update({
      where: { id: session.organizationId },
      data: {
        ...(name ? { name } : {}),
        ...(currency ? { currency } : {}),
        ...(fiscalYearStart ? { fiscalYearStart } : {}),
      },
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Update failed" };
  }

  revalidatePath("/settings");
  return { success: true };
}

export async function updateUserProfileAction(formData: unknown) {
  const session = await requireSession();
  const parsed = UpdateUserProfileSchema.safeParse(formData);
  if (!parsed.success) return { error: "Invalid input" };

  const { name, email } = parsed.data;

  try {
    await prisma.user.update({
      where: { id: session.userId },
      data: { name, email },
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Update failed" };
  }

  revalidatePath("/settings");
  return { success: true };
}

export async function updateNotificationPreferencesAction(
  preferences: Record<string, boolean>
) {
  const session = await requireSession();

  try {
    await prisma.membership.update({
      where: { id: session.membershipId },
      data: { notificationPreferences: preferences },
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Update failed" };
  }

  revalidatePath("/settings");
  return { success: true };
}

export async function getProfilePhotoUploadUrlAction(
  fileName: string,
  mimeType: string
) {
  const session = await requireSession();

  const validationError = validateFileMeta(fileName, mimeType);
  if (validationError) return { error: { message: validationError } };

  try {
    const storageKey = generateStorageKey(
      session.organizationId,
      "avatars",
      session.userId,
      fileName
    );
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

export async function saveProfilePhotoAction(storageKey: string) {
  const session = await requireSession();

  try {
    await prisma.user.update({
      where: { id: session.userId },
      data: { avatarUrl: storageKey },
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Save failed" };
  }

  revalidatePath("/settings");
  return { success: true };
}

export async function getLogoUploadUrlAction(
  fileName: string,
  mimeType: string
) {
  const session = await requireSession();

  const validationError = validateFileMeta(fileName, mimeType);
  if (validationError) return { error: { message: validationError } };

  try {
    const storageKey = generateStorageKey(
      session.organizationId,
      "logos",
      session.organizationId,
      fileName
    );
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

export async function saveLogoAction(storageKey: string) {
  const session = await requireSession();

  try {
    await prisma.organization.update({
      where: { id: session.organizationId },
      data: { logoUrl: storageKey },
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Save failed" };
  }

  revalidatePath("/settings");
  return { success: true };
}
