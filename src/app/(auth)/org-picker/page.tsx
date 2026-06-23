import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/client";
import { OrgPickerClient } from "@/features/auth/components/org-picker-client";

const ORG_COLORS = ["#1F4B99", "#15803D", "#7C3AED", "#B45309", "#0F766E"];
function orgColor(name: string) {
  let n = 0;
  for (const c of name) n += c.charCodeAt(0);
  return ORG_COLORS[n % ORG_COLORS.length];
}
function initials(name: string) {
  return name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export default async function OrgPickerPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const memberships = await prisma.membership.findMany({
    where: { userId: session.user.id, isActive: true },
    include: { organization: true, department: true },
  });

  if (memberships.some((m: (typeof memberships)[number]) => m.role === "PLATFORM_ADMIN")) {
    redirect("/platform-admin");
  }

  try {
    const cookieStore = await cookies();
    const orgSlug = cookieStore.get("org_slug")?.value;
    if (orgSlug) {
      const match = memberships.find((m: (typeof memberships)[number]) => m.organization.slug === orgSlug);
      if (match) {
        redirect(`/splash/${match.organizationId}`);
      }
    }
  } catch {
  }

  const data = memberships.map((m: (typeof memberships)[number]) => ({
    membershipId: m.id,
    orgId: m.organizationId,
    orgName: m.organization.name,
    orgInitials: initials(m.organization.name),
    orgColor: orgColor(m.organization.name),
    orgDescription: m.organization.slug,
    role: m.role,
    departmentName: m.department?.name ?? null,
  }));

  return <OrgPickerClient memberships={data} />;
}
