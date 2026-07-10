import Link from "next/link";
import { getOrganizationDetail } from "@/features/admin/repositories";
import { OrgProfileHeader } from "@/features/admin/components/organisations/OrgProfileHeader";
import { OrgStatsCards } from "@/features/admin/components/organisations/OrgStatsCards";
import { MembersSection } from "@/features/admin/components/organisations/MembersSection";
import { DepartmentsSection } from "@/features/admin/components/organisations/DepartmentsSection";
import { InvitesSection } from "@/features/admin/components/organisations/InvitesSection";
import { Button } from '@/components/ui/Button';

export default async function OrganizationProfilePage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; dept?: string; role?: string; page?: string }>;
}) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  const org = await getOrganizationDetail(id);

  if (!org) {
    return (
      <div className="p-7 text-[14px] text-(--muted)">
        Organisation not found
      </div>
    );
  }

  const activeMemberCount = org.members.filter((m) => m.isActive).length;
  const inactiveMemberCount = org.members.filter((m) => !m.isActive).length;
  const departmentOptions = org.departments
    .filter((d) => d.isActive)
    .map((d) => ({ id: d.id, name: d.name }));

  const memberTab = sp.tab === "inactive" || sp.tab === "all" ? sp.tab : "active";
  const memberDept = sp.dept ?? "all";
  const memberRole = sp.role ?? "all";

  const PAGE_SIZE = 10;
  const filteredMembers = org.members.filter((m) => {
    if (memberTab === "active" && !m.isActive) return false;
    if (memberTab === "inactive" && m.isActive) return false;
    if (memberDept !== "all" && m.department?.id !== memberDept) return false;
    if (memberRole !== "all" && m.role !== memberRole) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, Number(sp.page) || 1), totalPages);
  const paginatedMembers = filteredMembers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="min-h-screen">
      <h2 className="sr-only">
        Organization profile page for {org.name}
      </h2>

      <nav className="flex items-center gap-1.5 text-[13px] text-(--muted) mb-5" aria-label="Breadcrumb">
        <Link href="/platform-admin" className="hover:text-(--text) transition-colors">Platform Console</Link>
        <span aria-hidden>›</span>
        <span className="text-(--text) font-medium">Organisations</span>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-[28px] font-semibold text-(--text)">
          Organisation profile
        </h1>
        <Link href="/platform-admin/organisations">
          <Button variant="ghost" size="sm">
            ← Back to organisations
          </Button>
        </Link>
      </div>

      <OrgProfileHeader
        organizationId={org.id}
        name={org.name}
        slug={org.slug}
        description={org.description}
        initials={org.initials}
        timezone={org.timezone}
        logoUrl={org.logoUrl}
        createdAt={org.createdAt}
      />

      <OrgStatsCards
        memberCount={org.members.length}
        departmentCount={org.departments.length}
        inviteCount={org.invites.length}
        activeMemberCount={activeMemberCount}
      />

      <DepartmentsSection departments={org.departments} />

      <MembersSection
        members={paginatedMembers}
        departments={departmentOptions}
        currentTab={memberTab}
        currentDept={memberDept}
        currentRole={memberRole}
        currentPage={currentPage}
        totalPages={totalPages}
        totalMembers={filteredMembers.length}
        tabCounts={{
          active: activeMemberCount,
          inactive: inactiveMemberCount,
          all: org.members.length,
        }}
      />

      <InvitesSection invites={org.invites} />
    </div>
  );
}
