import { getOrganizationDetail } from "@/features/admin/repositories";
import { OrgProfileHeader } from "@/features/admin/components/organizations/OrgProfileHeader";
import { OrgStatsCards } from "@/features/admin/components/organizations/OrgStatsCards";
import { MembersSection } from "@/features/admin/components/organizations/MembersSection";
import { DepartmentsSection } from "@/features/admin/components/organizations/DepartmentsSection";
import { InvitesSection } from "@/features/admin/components/organizations/InvitesSection";

export default async function OrganizationProfilePage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const org = await getOrganizationDetail(id);

  if (!org) {
    return (
      <div className="p-7 text-[13px] text-(--muted)">
        Organisation not found
      </div>
    );
  }

  const activeMemberCount = org.members.filter((m) => m.isActive).length;
  const departmentOptions = org.departments
    .filter((d) => d.isActive)
    .map((d) => ({ id: d.id, name: d.name }));

  return (
    <>
      <h2 className="sr-only">
        Organization profile page for {org.name}
      </h2>

      <OrgProfileHeader
        name={org.name}
        slug={org.slug}
        description={org.description}
        initials={org.initials}
        timezone={org.timezone}
        createdAt={org.createdAt}
      />

      <OrgStatsCards
        memberCount={org.members.length}
        departmentCount={org.departments.length}
        inviteCount={org.invites.length}
        activeMemberCount={activeMemberCount}
      />

      <MembersSection
        members={org.members}
        departments={departmentOptions}
      />

      <DepartmentsSection departments={org.departments} />

      <InvitesSection invites={org.invites} />
    </>
  );
}
