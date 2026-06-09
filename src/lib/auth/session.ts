import { auth } from "./auth";
import { prisma } from "@/lib/prisma/client";
import { redirect } from "next/navigation";

/**
 * Get the current user's membership context.
 * Redirects to /login if unauthenticated, /org-picker if no active membership.
 */
export async function requireSession(organizationSlug?: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const membership = await prisma.membership.findFirst({
    where: {
      userId: session.user.id,
      isActive: true,
      ...(organizationSlug ? { organization: { slug: organizationSlug } } : {}),
    },
    include: { organization: true, user: true, department: true },
  });

  if (!membership) redirect("/org-picker");
  return membership;
}
