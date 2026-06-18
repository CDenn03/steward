"use server";

import { revalidatePath } from "next/cache";
import { CreateEventSchema } from "../schemas";
import { createEventService } from "../services";
import { requireSession } from "@/lib/auth/session";

export async function createEventAction(formData: unknown) {
  const session = await requireSession();
  const parsed = CreateEventSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };

  try {
    const event = await createEventService(parsed.data, {
      userId: session.userId,
      organizationId: session.organizationId,
    });
    revalidatePath("/events");
    revalidatePath("/budgets/new");
    revalidatePath("/dashboard");
    return { data: event };
  } catch (err) {
    return { error: { message: err instanceof Error ? err.message : "Unknown error" } };
  }
}