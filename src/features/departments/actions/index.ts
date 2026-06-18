"use server";

import { revalidatePath } from "next/cache";
import { CreateDepartmentSchema, SetDepartmentAllocationSchema } from "../schemas";
import { createDepartmentService, setDepartmentAllocationService } from "../services";
import { requireSession } from "@/lib/auth/session";

export async function createDepartmentAction(formData: unknown) {
  const session = await requireSession();
  const parsed = CreateDepartmentSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };

  try {
    const department = await createDepartmentService(parsed.data, {
      userId: session.userId,
      organizationId: session.organizationId,
    });
    revalidatePath("/departments");
    revalidatePath("/budgets/new");
    revalidatePath("/dashboard");
    return { data: department };
  } catch (err) {
    return { error: { message: err instanceof Error ? err.message : "Unknown error" } };
  }
}

export async function setDepartmentAllocationAction(formData: unknown) {
  const session = await requireSession();
  const parsed = SetDepartmentAllocationSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };

  try {
    const allocation = await setDepartmentAllocationService(parsed.data, {
      userId: session.userId,
      organizationId: session.organizationId,
    });
    revalidatePath("/departments");
    revalidatePath("/dashboard");
    return { data: allocation };
  } catch (err) {
    return { error: { message: err instanceof Error ? err.message : "Unknown error" } };
  }
}