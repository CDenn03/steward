"use server";

import { revalidatePath } from "next/cache";
import { CreateAccountSchema } from "../schemas";
import { createAccountService } from "../services";
import { requireSession } from "@/lib/auth/session";

export async function createAccountAction(formData: unknown) {
  const session = await requireSession();
  const parsed = CreateAccountSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };

  try {
    const account = await createAccountService(parsed.data, {
      userId: session.userId,
      organizationId: session.organizationId,
    });
    revalidatePath("/accounts");
    revalidatePath("/dashboard");
    return { data: account };
  } catch (err) {
    return { error: { message: err instanceof Error ? err.message : "Unknown error" } };
  }
}