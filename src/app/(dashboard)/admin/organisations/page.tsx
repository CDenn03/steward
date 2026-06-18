import Link from "next/link";
import { Users, DollarSign, Building2, Settings } from "lucide-react";
import { getOrganizationOverviews } from "@/features/admin/repositories";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { NewOrgButton } from "./new-org-button";

export default async function AdminOrgsPage() {
  const organizations = await getOrganizationOverviews();

  return (
    <>
      <PageHeader
        title="Organisations"
        subtitle="All organisations on this Steward instance"
      >
        <NewOrgButton />
      </PageHeader>

      <div className="grid grid-cols-2 gap-4">
        {organizations.map((org) => (
          <Card key={org.id} className="hover:shadow-card-hover transition-shadow">
            <CardBody>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-[12px] flex items-center justify-center text-white font-bold text-[16px]"
                    style={{ background: org.primaryColor }}
                  >
                    {org.logoInitials}
                  </div>
                  <div>
                    <h3 className="text-[14px] font-semibold">{org.name}</h3>
                    <p className="text-[12px] text-(--muted)">{org.description}</p>
                    <p className="text-[10px] text-(--muted) font-mono mt-0.5">/{org.slug}</p>
                  </div>
                </div>
                <Link href={`/admin/organisations/${org.id}`} className="w-7 h-7 flex items-center justify-center rounded-lg border border-(--border) text-(--muted) hover:bg-(--bg) transition-colors">
                  <Settings size={13} />
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-2.5 mb-4">
                {[
                  { icon: Users, label: "Members", value: org.members.length },
                  { icon: DollarSign, label: "Active Budgets", value: org.approvedBudgetCount },
                  { icon: Building2, label: "Liquid Assets", value: formatCurrency(org.totalLiquidity, org.currency, true) },
                ].map((stat) => (
                  <div key={stat.label} className="bg-(--bg) border border-(--border) rounded-[10px] px-2.5 py-2">
                    <p className="text-[10px] text-(--muted) mb-1">{stat.label}</p>
                    <p className="text-[13px] font-semibold">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center -space-x-1.5">
                  {org.members.slice(0, 5).map((member, index) => (
                    <div
                      key={member.id}
                      className="w-6 h-6 rounded-full border-2 border-[var(--surface)] flex items-center justify-center text-[9px] font-bold text-white"
                      style={{ background: org.primaryColor, opacity: 0.7 + index * 0.06, zIndex: 5 - index }}
                      title={member.userId}
                    >
                      {member.userId.slice(-1).toUpperCase()}
                    </div>
                  ))}
                  {org.members.length > 5 && (
                    <div className="w-6 h-6 rounded-full border-2 border-[var(--surface)] bg-(--border) flex items-center justify-center text-[9px] font-medium text-(--muted)">
                      +{org.members.length - 5}
                    </div>
                  )}
                </div>
                <span
                  className="text-[10px] font-medium px-2 py-0.5 rounded-md"
                  style={{ background: org.primaryColor + "18", color: org.primaryColor }}
                >
                  {org.currency} · {org.fiscalYearStart}
                </span>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </>
  );
}
