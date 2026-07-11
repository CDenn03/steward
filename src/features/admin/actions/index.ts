"use server";


import { revalidatePath } from "next/cache";
import { requirePlatformAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";
import { getSignedUploadUrl } from "@/lib/storage/r2";
import { validateFileMeta } from "@/lib/storage/validation";
import { sendPlatformUserWelcomeEmail } from "@/lib/email/resend";
import {
  UpdateMembershipSchema,
  UpdateUserSchema,
  CreateMembershipSchema,
  CreateOrganizationSchema,
  UpdateOrganizationSchema,
  CreateDepartmentSchema,
  AddMemberSchema,
  UpdateDepartmentSchema,
  CreatePlatformUserSchema,
} from "../schemas";
import bcrypt from "bcryptjs";
import crypto from "crypto"

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

export type MemberActionResult =
  | { success: true }
  | { success: false; error: { message: string } };

export async function addMemberAction(
  organizationId: string,
  formData: unknown
): Promise<MemberActionResult> {
  await requirePlatformAdmin();
  const parsed = AddMemberSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: { message: parsed.error.errors.map(e => e.message).join(", ") } };

  try {
    let user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: parsed.data.name,
          email: parsed.data.email,
        },
      });
    }

    const existing = await prisma.membership.findUnique({
      where: { userId_organizationId: { userId: user.id, organizationId } },
    });
    if (existing) {
      return { success: false, error: { message: "User is already a member of this organisation" } };
    }

    await prisma.membership.create({
      data: {
        userId: user.id,
        organizationId,
        role: parsed.data.role,
        departmentId: parsed.data.departmentId ?? null,
      },
    });

    revalidatePath(`/platform-admin/organisations/${organizationId}`);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: {
        message: err instanceof Error ? err.message : "Failed to add member",
      },
    };
  }
}

export async function updateDepartmentAction(
  departmentId: string,
  organizationId: string,
  formData: unknown
): Promise<DepartmentActionResult> {
  await requirePlatformAdmin();
  const parsed = UpdateDepartmentSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: { message: parsed.error.errors.map(e => e.message).join(", ") } };

  try {
    await prisma.department.update({
      where: { id: departmentId },
      data: {
        ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
        ...(parsed.data.description !== undefined ? { description: parsed.data.description } : {}),
        ...(parsed.data.headId !== undefined ? { headId: parsed.data.headId } : {}),
        ...(parsed.data.isActive !== undefined ? { isActive: parsed.data.isActive } : {}),
      },
    });

    revalidatePath(`/platform-admin/organisations/${organizationId}`);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: {
        message: err instanceof Error ? err.message : "Failed to update department",
      },
    };
  }
}

export type DeleteDepartmentResult =
  | { success: true }
  | { success: false; error: { message: string } };

export async function deleteDepartmentAction(
  departmentId: string,
  organizationId: string
): Promise<DeleteDepartmentResult> {
  await requirePlatformAdmin();

  try {
    await prisma.$transaction([
      prisma.membership.updateMany({
        where: { departmentId },
        data: { departmentId: null },
      }),

      prisma.department.delete({
        where: { id: departmentId },
      }),
    ]);

    revalidatePath(`/platform-admin/organisations/${organizationId}`);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: {
        message: err instanceof Error ? err.message : "Failed to delete department",
      },
    };
  }
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
    const temporaryPassword = `Pass@${crypto.randomInt(100000, 999999)}`;
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    const organization = await prisma.organization.findUnique({
      where: {
        id: parsed.data.organizationId,
      },
    });

    if (!organization) {
      return {
        error: "Organization not found",
      };
    }
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
try {
  await sendPlatformUserWelcomeEmail({
    to: user.email,
    name: user.name,
    organizationName: organization!.name,
    temporaryPassword,
    loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
  });
} catch (error) {
  console.error("Failed to send welcome email:", error);
}

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

export type DepartmentActionResult =
  | { success: true }
  | { success: false; error: { message: string } };

export async function createDepartmentAction(
  organizationId: string,
  formData: unknown
): Promise<DepartmentActionResult> {
  await requirePlatformAdmin();
  const parsed = CreateDepartmentSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: { message: parsed.error.errors.map(e => e.message).join(", ") } };

  try {
    await prisma.department.create({
      data: {
        organizationId,
        name: parsed.data.name,
        description: parsed.data.description ?? null,
      },
    });

    revalidatePath(`/platform-admin/organisations/${organizationId}`);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: {
        message: err instanceof Error ? err.message : "Failed to create department",
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

export type UpdateOrganizationResult =
  | { success: true }
  | { success: false; error: { message: string } };

export async function updateOrganizationAction(
  organizationId: string,
  formData: unknown
): Promise<UpdateOrganizationResult> {
  await requirePlatformAdmin();
  const parsed = UpdateOrganizationSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: { message: parsed.error.errors.map(e => e.message).join(", ") } };

  const { name, description, currency, fiscalYearStart, logoUrl, timezone } = parsed.data;

  try {
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        ...(name ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(currency ? { currency } : {}),
        ...(fiscalYearStart ? { fiscalYearStart } : {}),
        ...(logoUrl !== undefined ? { logoUrl } : {}),
        ...(timezone ? { timezone } : {}),
      },
    });

    revalidatePath("/platform-admin/organisations");
    revalidatePath(`/platform-admin/organisations/${organizationId}`);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: {
        message:
          err instanceof Error ? err.message : "Failed to update organisation",
      },
    };
  }
}


export async function saveOrgCreationUploadAction(_storageKey: string) {
  return { success: true };
}

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
