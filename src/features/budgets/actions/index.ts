"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { CreateBudgetSchema, ReviewBudgetSchema, EditBudgetSchema } from "../schemas";
import { createBudgetService, submitBudgetService, reviewBudgetService, updateBudgetService } from "../services";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";
import { generateStorageKey, getSignedUploadUrl } from "@/lib/storage/r2";
import { validateFileMeta } from "@/lib/storage/validation";

export async function createBudgetAction(formData: unknown) {
  const session = await requireSession();
  const parsed = CreateBudgetSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };

  try {
    const budget = await createBudgetService(parsed.data, {
      userId: session.userId,
      organizationId: session.organizationId,
    });
    revalidatePath("/budgets");
    revalidatePath("/dashboard");
    return { data: budget };
  } catch (err) {
    return { error: { message: err instanceof Error ? err.message : "Unknown error" } };
  }
}

export async function submitBudgetAction(budgetId: string) {
  const session = await requireSession();
  try {
    await submitBudgetService(budgetId, {
      userId: session.userId,
      organizationId: session.organizationId,
    });
    revalidatePath("/budgets");
    revalidatePath(`/budgets/${budgetId}`);
    revalidatePath("/approvals");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function reviewBudgetAction(formData: unknown) {
  const session = await requireSession();
  const parsed = ReviewBudgetSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };

  try {
    await reviewBudgetService(parsed.data, {
      userId: session.userId,
      organizationId: session.organizationId,
    });
    revalidatePath("/budgets");
    revalidatePath(`/budgets/${parsed.data.budgetId}`);
    revalidatePath("/approvals");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function addApprovalCommentAction(approvalId: string, body: string) {
  const session = await requireSession();

  const trimmed = body.trim();
  if (!trimmed) return { error: "Comment cannot be empty" };

  // Verify the approval belongs to this org
  const approval = await prisma.approval.findFirst({
    where: { id: approvalId, budget: { organizationId: session.organizationId } },
  });
  if (!approval) return { error: "Approval not found" };

  const comment = await prisma.approvalComment.create({
    data: { approvalId, authorId: session.userId, body: trimmed },
  });

  revalidatePath("/budgets/[budgetId]", "page");
  return { data: comment };
}

export async function updateBudgetAction(budgetId: string, formData: unknown) {
  const session = await requireSession();
  const parsed = EditBudgetSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };

  try {
    const budget = await updateBudgetService(
      budgetId,
      {
        ...parsed.data,
        items: parsed.data.items.map((item) => ({
          ...item,
          totalCost: item.quantity * item.unitCost,
        })),
      },
      {
        userId: session.userId,
        organizationId: session.organizationId,
      }
    );
    revalidatePath("/budgets");
    revalidatePath(`/budgets/${budgetId}`);
    revalidatePath("/dashboard");
    return { data: budget };
  } catch (err) {
    return { error: { message: err instanceof Error ? err.message : "Unknown error" } };
  }
}

export async function getBudgetUploadUrlAction(fileName: string, mimeType: string, budgetId: string) {
  const session = await requireSession();

  const validationError = validateFileMeta(fileName, mimeType);
  if (validationError) return { error: { message: validationError } };

  try {
    const storageKey = generateStorageKey(
      session.organizationId,
      "budget-attachments",
      budgetId,
      fileName
    );
    const uploadUrl = await getSignedUploadUrl(storageKey, mimeType);
    return { data: { storageKey, uploadUrl } };
  } catch (err) {
    return { error: { message: err instanceof Error ? err.message : "Unknown error" } };
  }
}

export async function saveBudgetAttachmentAction(data: {
  storageKey: string;
  fileName: string;
  mimeType: string;
  size: number;
  budgetId: string;
}) {
  const session = await requireSession();

  const validationError = validateFileMeta(data.fileName, data.mimeType, data.size);
  if (validationError) return { error: { message: validationError } };

  try {
    const attachment = await prisma.attachment.create({
      data: {
        storageKey: data.storageKey,
        fileName: data.fileName,
        mimeType: data.mimeType,
        size: data.size,
        entityType: "Budget",
        entityId: data.budgetId,
        uploadedById: session.userId,
      },
    });
    revalidatePath(`/budgets/${data.budgetId}`);
    return { data: attachment };
  } catch (err) {
    return { error: { message: err instanceof Error ? err.message : "Unknown error" } };
  }
}
