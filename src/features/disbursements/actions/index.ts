"use server";

import { revalidatePath } from "next/cache";
import { CreateDisbursementSchema, ReleaseDisbursementSchema } from "../schemas";
import {
  createDisbursementService,
  releaseDisbursementService,
} from "../services";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";

export async function createDisbursementAction(formData: unknown) {
  const session = await requireSession();
  const parsed = CreateDisbursementSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };

  try {
    const disbursement = await createDisbursementService(parsed.data, {
      userId: session.userId,
      organizationId: session.organizationId,
    });
    revalidatePath(`/budgets/${parsed.data.budgetId}`);
    revalidatePath("/approvals");
    revalidatePath("/dashboard");
    return { data: disbursement };
  } catch (err) {
    return { error: { message: err instanceof Error ? err.message : "Unknown error" } };
  }
}

export async function releaseDisbursementAction(formData: unknown) {
  const session = await requireSession();
  const parsed = ReleaseDisbursementSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };

  try {
    const disbursement = await releaseDisbursementService(parsed.data.disbursementId, {
      userId: session.userId,
      organizationId: session.organizationId,
    });
    revalidatePath("/approvals");
    revalidatePath(`/budgets/${disbursement.budgetId}`);
    revalidatePath("/accounts");
    revalidatePath("/dashboard");
    return { data: disbursement };
  } catch (err) {
    return { error: { message: err instanceof Error ? err.message : "Unknown error" } };
  }
}

export async function getAccountsAction() {
  const session = await requireSession();
  try {
    const accounts = await prisma.financialAccount.findMany({
      where: { organizationId: session.organizationId, isActive: true },
      select: { id: true, name: true, type: true, balance: true, currency: true },
      orderBy: { name: "asc" },
    });
    return { data: accounts };
  } catch (err) {
    return { error: { message: err instanceof Error ? err.message : "Unknown error" } };
  }
}