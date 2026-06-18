import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get("orgId");
  const path = searchParams.get("path") ?? "/dashboard";

  if (!orgId) {
    redirect(path);
    return;
  }

  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/api/redirect?orgId=${orgId}&path=${encodeURIComponent(path)}`);
    return;
  }

  // Check if user has an active membership in the target org
  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id, organizationId: orgId, isActive: true },
    include: { organization: true },
  });

  if (!membership) {
    // User doesn't belong to this org — redirect to org-picker
    redirect(`/org-picker?redirect=${encodeURIComponent(path)}`);
    return;
  }

  // Redirect through splash for the target org, then to the final path
  redirect(`/splash/${orgId}?redirect=${encodeURIComponent(path)}`);
}
