"use server";

import { revalidatePath } from "next/cache";
import { CreateBudgetSchema, ReviewBudgetSchema } from "../schemas";
import { createBudgetService, submitBudgetService, reviewBudgetService } from "../services";
import { requireSession } from "@/lib/auth/session";

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
    revalidatePath("/approvals");
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
    revalidatePath("/approvals");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}
