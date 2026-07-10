import { prisma } from "@/lib/prisma/client";
import { getUsersWithMemberships } from "@/features/admin/repositories";
import { PageHeader } from '@/components/shared/PageHeader';
import { PlatformUsersTable } from '@/features/admin/components/users/PlatformUsersTable';

function computeOrgMeta(org: { id: string; name: string; slug: string }) {
  const initials = org.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return { ...org, primaryColor: "#4B6650", logoInitials: initials };
}

export default async function PlatformUsersPage(props: Readonly<{ searchParams?: Promise<Record<string, string>> }>) {
  const searchParams = (await props.searchParams) ?? {};

  const search = searchParams.search ?? "";
  const orgId = searchParams.orgId ?? "";
  const role = searchParams.role ?? "";
  const page = Math.max(1, Number(searchParams.page) || 1);

  const [{ users, total, page: currentPage, totalPages }, orgs] = await Promise.all([
    getUsersWithMemberships({
      search: search || undefined,
      orgId: orgId || undefined,
      role: role || undefined,
      page,
      pageSize: 20,
    }),
    prisma.organization.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const organizations = orgs.map(computeOrgMeta);

  return (
    <>
      <PageHeader title="All Users" subtitle={`${total} users across all organisations`} />

      <PlatformUsersTable
        data={users}
        organizations={organizations}
        search={search}
        orgFilter={orgId}
        roleFilter={role}
        page={currentPage - 1}
        totalPages={totalPages}
      />
    </>
  );
}
