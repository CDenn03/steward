import { Building2, Users, ShieldCheck, Activity } from "lucide-react";
import { getOrganizationOverviews, getPlatformStats } from "@/features/admin/repositories";
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardBody } from '@/components/ui/Card';

export default async function PlatformAdminPage() {
  const [stats, organizations] = await Promise.all([
    getPlatformStats(),
    getOrganizationOverviews(),
  ]);

  const statCards = [
    { label: "Organisations", value: stats.organizations, icon: Building2 },
    { label: "Total Users", value: stats.users, icon: Users },
    { label: "Memberships", value: stats.memberships, icon: Activity },
    { label: "Platform", value: "Healthy", icon: ShieldCheck },
  ];

  return (
    <>
      <PageHeader
        title="Platform Overview"
        subtitle="Monitor all organisations and system health"
      />

      <div className="grid grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardBody>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] text-(--muted)">{label}</span>
                <Icon size={14} className="text-(--muted)" />
              </div>
              <p className="text-[22px] font-semibold tracking-tight">{value}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardBody>
          <p className="text-[12px] font-medium text-(--muted) uppercase tracking-[0.6px] mb-4">
            Organisations
          </p>
          <div className="space-y-3">
            {organizations.map((org) => (
              <div key={org.id} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-[8px] flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                  style={{ background: org.primaryColor }}
                >
                  {org.logoInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate">{org.name}</p>
                  <p className="text-[11px] text-(--muted)">{org.description}</p>
                </div>
                <span className="text-[11px] text-(--muted)">{org.members.length} members</span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </>
  );
}
