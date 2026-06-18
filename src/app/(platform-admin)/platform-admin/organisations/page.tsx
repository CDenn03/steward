import { Plus } from "lucide-react";
import { getOrganizationOverviews } from "@/features/admin/repositories";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export default async function PlatformOrgsPage() {
  const organizations = await getOrganizationOverviews();

  return (
    <>
      <PageHeader title="Organisations" subtitle="All organisations on this Steward instance">
        <Button size="sm">
          <Plus size={13} /> Onboard Organisation
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4">
        {organizations.map((org) => (
          <Card key={org.id}>
            <CardBody>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-[10px] flex items-center justify-center text-white font-bold text-[14px] flex-shrink-0"
                  style={{ background: org.primaryColor }}
                >
                  {org.logoInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold truncate">{org.name}</p>
                  <p className="text-[11px] text-[var(--muted)]">{org.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 text-center">
                {[
                  { label: "Members", value: org.members.length },
                  { label: "Departments", value: org.departmentCount },
                  { label: "Budgets", value: org.budgetCount },
                  { label: "Liquidity", value: formatCurrency(org.totalLiquidity, org.currency) },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-[var(--bg)] rounded-[8px] px-2 py-2">
                    <p className="text-[11px] text-[var(--muted)] mb-0.5">{label}</p>
                    <p className="text-[13px] font-semibold">{value}</p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </>
  );
}
