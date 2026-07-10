"use server";

import { revalidatePath } from "next/cache";
import { requirePlatformAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";

export async function updateOrgAction(formData: FormData): Promise<void> {
  const session = await requirePlatformAdmin();
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;

  if (!id || !name || !slug) throw new Error("Name and slug are required");

  const existing = await prisma.organization.findUnique({ where: { slug } });
  if (existing && existing.id !== id) throw new Error("Slug already in use");

  await prisma.organization.update({
    where: { id },
    data: { name, slug },
  });

  revalidatePath(`/admin/organisations/${id}`);
  revalidatePath("/admin/organisations");
}
