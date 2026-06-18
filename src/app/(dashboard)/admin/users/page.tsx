import { Plus } from "lucide-react";
import { getPlatformStats, getUsersWithMemberships } from "@/features/admin/repositories";
import { prisma } from "@/lib/prisma/client";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserActions } from "./user-actions";

const roleLabels: Record<string, string> = {
  admin: "Admin",
  chairperson: "Chairperson",
  finance: "Finance",
  department_head: "Dept Head",
  member: "Member",
  platform_admin: "Platform Admin",
};

const roleVariants: Record<string, "default"|"info"|"success"|"gold"|"warning"|"draft"> = {
  admin: "info",
  platform_admin: "info",
  chairperson: "default",
  finance: "success",
  department_head: "gold",
  member: "draft",
};

export default async function AdminUsersPage() {
  const [users, stats, allDepartments] = await Promise.all([
    getUsersWithMemberships(),
    getPlatformStats(),
    prisma.department.findMany({ select: { id: true, name: true, organizationId: true } }),
  ]);

  const deptsByOrg = new Map<string, Array<{ id: string; name: string }>>();
  for (const dept of allDepartments) {
    const list = deptsByOrg.get(dept.organizationId) ?? [];
    list.push({ id: dept.id, name: dept.name });
    deptsByOrg.set(dept.organizationId, list);
  }

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
        <div className="divide-y divide-(--border)">
          {users.map((user) => (
            <div key={user.id} className="px-5 py-4">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-[13px] font-semibold text-(--primary) shrink-0">
                  {user.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium">{user.name}</p>
                  <p className="text-[11px] text-(--muted)">{user.email}</p>
                </div>
              </div>

              <div className="mt-3 space-y-2.5">
                {user.memberships.map((membership) => (
                  <div
                    key={membership.id}
                    className="flex items-center gap-3 bg-(--bg) border border-(--border) rounded-[10px] px-3.5 py-3"
                  >
                    <div
                      className="w-7 h-7 rounded-[7px] flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                      style={{ background: membership.org.primaryColor }}
                    >
                      {membership.org.logoInitials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium">{membership.org.name}</p>
                      <p className="text-[11px] text-(--muted)">
                        {membership.department ? `${membership.department.name} · ` : ""}
                        {roleLabels[membership.role] ?? membership.role}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant={roleVariants[membership.role] ?? "draft"}>
                        {roleLabels[membership.role] ?? membership.role}
                      </Badge>
                      <UserActions
                        membershipId={membership.id}
                        currentRole={membership.role}
                        currentDeptId={membership.department?.id ?? null}
                        departments={deptsByOrg.get(membership.org.id) ?? []}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
