import { requireOrgSession } from "@/lib/auth/session";
import { OrgProvider, type ActiveOrg } from "@/lib/org/context";
import { Sidebar } from "@/components/shared/sidebar";
import { Topbar } from "@/components/shared/topbar";
import { MobileSidebar } from "@/components/shared/mobile-sidebar";

function initials(name: string) {
  return name.split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

// Deterministic colour from org name
const ORG_COLORS = ["#1F4B99", "#15803D", "#7C3AED", "#B45309", "#0F766E"];
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

  return (
    <OrgProvider initialOrg={initialOrg}>
      <div className="flex min-h-screen">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <MobileSidebar />
        <div className="md:ml-[224px] flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 p-4 md:p-7 pt-14 md:pt-4">{children}</main>
        </div>
      </div>
    </OrgProvider>
  );
}
