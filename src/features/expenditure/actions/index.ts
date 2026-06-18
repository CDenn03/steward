"use server";

import { revalidatePath } from "next/cache";
import {
  CreateExpenditureReportSchema,
  UploadReceiptSchema,
  AllocateReceiptSchema,
  SubmitExpenditureReportSchema,
} from "../schemas";
import {
  createExpenditureReportService,
  saveReceiptService,
  allocateReceiptsService,
  submitExpenditureReportService,
} from "../services";
import { requireSession } from "@/lib/auth/session";
import { generateStorageKey, getSignedUploadUrl } from "@/lib/storage/r2";

export async function createExpenditureReportAction(formData: unknown) {
  const session = await requireSession();
  const parsed = CreateExpenditureReportSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };

  try {
    const report = await createExpenditureReportService(parsed.data, {
      userId: session.userId,
      organizationId: session.organizationId,
    });
    revalidatePath("/expenditures");
    revalidatePath("/dashboard");
    return { data: report };
  } catch (err) {
    return { error: { message: err instanceof Error ? err.message : "Unknown error" } };
  }
}

export async function getUploadUrlAction(fileName: string, mimeType: string) {
  const session = await requireSession();
  try {
    const storageKey = generateStorageKey(
      session.organizationId,
      "receipts",
      "pending",
      fileName
    );
    const uploadUrl = await getSignedUploadUrl(storageKey, mimeType);
    return { data: { storageKey, uploadUrl } };
  } catch (err) {
    return { error: { message: err instanceof Error ? err.message : "Unknown error" } };
  }
}

export async function saveReceiptAction(formData: unknown) {
  const session = await requireSession();
  const parsed = UploadReceiptSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };

  try {
    const receipt = await saveReceiptService(parsed.data, {
      userId: session.userId,
      organizationId: session.organizationId,
    });
    revalidatePath("/expenditures");
    revalidatePath("/dashboard");
    return { data: receipt };
  } catch (err) {
    return { error: { message: err instanceof Error ? err.message : "Unknown error" } };
  }
}

export async function allocateReceiptAction(formData: unknown) {
  const session = await requireSession();
  const parsed = AllocateReceiptSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };

  try {
    const allocations = await allocateReceiptsService(parsed.data, {
      userId: session.userId,
      organizationId: session.organizationId,
    });
    revalidatePath("/expenditures");
    return { data: allocations };
  } catch (err) {
    return { error: { message: err instanceof Error ? err.message : "Unknown error" } };
  }
}

export async function submitExpenditureReportAction(formData: unknown) {
  const session = await requireSession();
  const parsed = SubmitExpenditureReportSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };

  try {
    await submitExpenditureReportService(parsed.data.expenditureReportId, {
      userId: session.userId,
      organizationId: session.organizationId,
    });
    revalidatePath("/expenditures");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    return { error: { message: err instanceof Error ? err.message : "Unknown error" } };
  }
}
