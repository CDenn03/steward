import { requireOrgSession } from "@/lib/auth/session";
import { OrgProvider, type ActiveOrg } from "@/lib/org/context";
import { Sidebar } from '@/components/shared/Sidebar';
import { Topbar } from '@/components/shared/Topbar';
import { MobileSidebar } from '@/components/shared/MobileSidebar';
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/client";

function initials(name: string) {
  return name.split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

const ORG_COLORS = ["#4B6650", "#A6672E", "#79766B", "#B94A3F", "#1E2A24"];
function orgColor(name: string) {
  let n = 0;
  for (const c of name) n += c.charCodeAt(0);
  return ORG_COLORS[n % ORG_COLORS.length];
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireOrgSession();
  const color = orgColor(session.organization.name);

  const initialOrg: ActiveOrg = {
    orgId: session.organizationId,
    orgName: session.organization.name,
    orgSlug: session.organization.slug,
    orgInitials: initials(session.organization.name),
    orgColor: color,
    orgDescription: session.organization.slug,
    currency: session.organization.currency,
    userId: session.userId,
    userName: session.user.name,
    userInitials: initials(session.user.name),
    userEmail: session.user.email,
    role: session.role,
    departmentId: session.departmentId,
    departmentName: null,
    membershipId: session.membershipId,
  };

  const authSession = await auth();
  const rawMemberships = authSession?.user?.id
    ? await prisma.membership.findMany({
        where: { userId: authSession.user.id, isActive: true },
        include: { organization: true },
      })
    : [];

  const initialMemberships: ActiveOrg[] = rawMemberships.map(
    (m: {
      id: string;
      userId: string;
      organizationId: string;
      role: string;
      departmentId: string | null;
      organization: { name: string; slug: string; currency: string };
    }) => ({
    orgId: m.organizationId,
    orgName: m.organization.name,
    orgSlug: m.organization.slug,
    orgInitials: initials(m.organization.name),
    orgColor: orgColor(m.organization.name),
    orgDescription: m.organization.slug,
    currency: m.organization.currency,
    userId: m.userId,
    userName: session.user.name,
    userInitials: initials(session.user.name),
    userEmail: session.user.email,
    role: m.role.toLowerCase() as ActiveOrg["role"],
    departmentId: m.departmentId,
    departmentName: null,
    membershipId: m.id,
  }));

  return (
    <OrgProvider initialOrg={initialOrg} initialMemberships={initialMemberships}>
      <div className="flex min-h-screen">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <MobileSidebar />
        <div className="md:ml-[232px] flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 p-4 md:p-7 pt-14 md:pt-4">{children}</main>
        </div>
      </div>
    </OrgProvider>
  );
}