import { Plus } from "lucide-react";
import { getPlatformStats, getUsersWithMemberships } from "@/features/admin/repositories";
import { prisma } from "@/lib/prisma/client";
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AdminUserTable } from '@/features/admin/components/users/AdminUsersTable';
import type { MembershipRow } from '@/features/admin/components/users/AdminUsersTable';

export default async function AdminUsersPage() {
  const [{ users }, stats, allDepartments] = await Promise.all([
    getUsersWithMemberships(),
    getPlatformStats(),
    prisma.department.findMany({ select: { id: true, name: true, organizationId: true } }),
  ]);

  const deptsByOrg: Record<string, Array<{ id: string; name: string }>> = {};
  for (const dept of allDepartments) {
    if (!deptsByOrg[dept.organizationId]) deptsByOrg[dept.organizationId] = [];
    deptsByOrg[dept.organizationId].push({ id: dept.id, name: dept.name });
  }

  const rows: MembershipRow[] = users.flatMap((user) =>
    user.memberships.map((membership) => ({
      membershipId: membership.id,
      userName: user.name,
      userEmail: user.email,
      userInitials: user.initials,
      orgName: membership.org.name,
      orgColor: membership.org.primaryColor,
      orgInitials: membership.org.logoInitials,
      role: membership.role,
      departmentName: membership.department?.name ?? null,
      departmentId: membership.department?.id ?? null,
      orgId: membership.org.id,
    }))
  );

  return (
    <>
      <PageHeader
        title="User Management"
        subtitle="Manage all users and their organisation memberships"
      >
        <Button size="sm">
          <Plus size={13} /> Invite User
        </Button>
      </PageHeader>

      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Total Users", value: stats.users },
          { label: "Organisations", value: stats.organizations },
          { label: "Total Memberships", value: stats.memberships },
        ].map((stat) => (
          <div key={stat.label} className="bg-(--surface) border border-(--border) rounded-(--r-card) px-4 py-3.5">
            <p className="text-[11px] text-(--muted) uppercase tracking-[0.5px] font-medium mb-1">{stat.label}</p>
            <p className="text-[22px] font-semibold tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      <Card>
        <AdminUserTable data={rows} departmentsByOrg={deptsByOrg} />
      </Card>
    </>
  );
}
