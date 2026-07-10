import Link from "next/link";
import { getOrganizationDetail, getOrganizationOverviews } from "@/features/admin/repositories";
import { OrgProfileHeader } from "@/features/admin/components/organisations/OrgProfileHeader";
import { OrgStatsCards } from "@/features/admin/components/organisations/OrgStatsCards";
import { MembersSection } from "@/features/admin/components/organisations/MembersSection";
import { DepartmentsSection } from "@/features/admin/components/organisations/DepartmentsSection";
import { InvitesSection } from "@/features/admin/components/organisations/InvitesSection";
import { ChevronLeft } from "lucide-react";

export default async function OrganizationProfilePage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; dept?: string; role?: string; page?: string }>;
}) {
  const { id } = await props.params;
  const sp = await props.searchParams;

  const [org, allOrgs] = await Promise.all([
    getOrganizationDetail(id),
    getOrganizationOverviews(),
  ]);

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

  const orgInfo = {
    id: org.id,
    name: org.name,
    slug: org.slug,
    primaryColor: "#4B6650",
    logoInitials: org.initials,
  };

  const organizations = allOrgs.map((o) => ({
    id: o.id,
    name: o.name,
    slug: o.slug,
    primaryColor: "#4B6650",
    logoInitials: o.logoInitials,
  }));

  return (
    <div className="min-h-screen">
      <h2 className="sr-only">
        Organization profile page for {org.name}
      </h2>

      <div className="flex items-center gap-2 mb-6">
        <Link
          href="/platform-admin/organisations"
          className="inline-flex items-center gap-1.5 text-[13px] text-(--muted) hover:text-(--text) transition-colors"
        >
          <ChevronLeft size={14} />
          Organisations
        </Link>
        <span className="text-(--muted) text-[13px]">/</span>
        <span className="text-[13px] text-(--text) font-medium">{org.name}</span>
      </div>

      <OrgProfileHeader
        organizationId={org.id}
        name={org.name}
        description={org.description}
        initials={org.initials}
        timezone={org.timezone}
        logoUrl={org.logoUrl}
      />

      <OrgStatsCards
        memberCount={org.members.length}
        departmentCount={org.departments.length}
        inviteCount={org.invites.length}
        activeMemberCount={activeMemberCount}
      />

      <DepartmentsSection
        organizationId={org.id}
        departments={org.departments}
      />

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
        orgInfo={orgInfo}
        organizations={organizations}
      />

      <InvitesSection invites={org.invites} />
    </div>
  );
}
