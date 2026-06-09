import { Building2, Users, ShieldCheck, Activity } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { mockOrgs, mockAllUsers, mockMemberships } from "@/lib/mock/data";

const stats = [
  { label: "Organisations", value: mockOrgs.length,        icon: Building2  },
  { label: "Total Users",   value: mockAllUsers.length,    icon: Users      },
  { label: "Memberships",   value: mockMemberships.length, icon: Activity   },
  { label: "Platform",      value: "Healthy",              icon: ShieldCheck },
];

export default function PlatformAdminPage() {
  return (
    <>
      <PageHeader
        title="Platform Overview"
        subtitle="Monitor all organisations and system health"
      />

      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardBody>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] text-[var(--muted)]">{label}</span>
                <Icon size={14} className="text-[var(--muted)]" />
              </div>
              <p className="text-[22px] font-semibold tracking-tight">{value}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Quick org list */}
      <Card>
        <CardBody>
          <p className="text-[12px] font-medium text-[var(--muted)] uppercase tracking-[0.6px] mb-4">
            Organisations
          </p>
          <div className="space-y-3">
            {mockOrgs.map((org) => {
              const memberCount = mockMemberships.filter((m) => m.organizationId === org.id).length;
              return (
                <div key={org.id} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-[8px] flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                    style={{ background: org.primaryColor }}
                  >
                    {org.logoInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate">{org.name}</p>
                    <p className="text-[11px] text-[var(--muted)]">{org.description}</p>
                  </div>
                  <span className="text-[11px] text-[var(--muted)]">{memberCount} members</span>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>
    </>
  );
}
