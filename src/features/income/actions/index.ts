"use server";

import { revalidatePath } from "next/cache";
import { RecordIncomeSchema } from "../schemas";
import { recordIncomeService } from "../services";
import { requireSession } from "@/lib/auth/session";

export async function recordIncomeAction(formData: unknown) {
  const session = await requireSession();
  const parsed = RecordIncomeSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };

  try {
    const income = await recordIncomeService(parsed.data, {
      userId: session.userId,
      organizationId: session.organizationId,
    });
    revalidatePath("/income");
    revalidatePath("/accounts");
    revalidatePath("/dashboard");
    return { data: income };
  } catch (err) {
    return { error: { message: err instanceof Error ? err.message : "Unknown error" } };
  }
}
