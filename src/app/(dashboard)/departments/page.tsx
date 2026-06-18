import { Building2, Plus } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { getDepartmentBudgetSummaries } from "@/features/budgets/repositories";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { formatCurrency, pct } from "@/lib/utils";

type DepartmentRow = {
  id: string;
  name: string;
  budgets: Array<{
    items: Array<{ totalCost: number }>;
    expenditures: Array<{ totalClaimed: number }>;
  }>;
};

export default async function DepartmentsPage() {
  const session = await requireSession();
  const departments = await getDepartmentBudgetSummaries(session.organizationId) as DepartmentRow[];

  return (
    <>
      <PageHeader title="Departments" subtitle="Manage departments, heads, and budget allocations">
        <Button variant="ghost" size="sm"><Plus size={13} /> Add Department</Button>
      </PageHeader>
      <div className="grid grid-cols-3 gap-4">
        {departments.map((dept) => {
          const totalAllocated = dept.budgets.reduce(
            (sum, budget) => sum + budget.items.reduce((itemSum, item) => itemSum + item.totalCost, 0),
            0
          );
          const totalSpent = dept.budgets.reduce(
            (sum, budget) => sum + budget.expenditures.reduce((reportSum, report) => reportSum + report.totalClaimed, 0),
            0
          );
          const utilPct = pct(totalSpent, totalAllocated);
          return (
            <Card key={dept.id} className="hover:shadow-card-hover transition-shadow cursor-pointer">
              <CardBody>
                <div className="w-10 h-10 rounded-[10px] bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary)] mb-3">
                  <Building2 size={18} />
                </div>
                <h3 className="text-[15px] font-medium mb-1">{dept.name}</h3>
                <p className="text-[12px] text-[var(--muted)] mb-4">{dept.budgets.length} active budget{dept.budgets.length !== 1 ? "s" : ""}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-[var(--muted)]">Allocated</span>
                    <span className="font-mono">{formatCurrency(totalAllocated, session.organization.currency, true)}</span>
                  </div>
                  <div className="flex justify-between text-[12px]">
                    <span className="text-[var(--muted)]">Spent</span>
                    <span className="font-mono">{totalSpent > 0 ? formatCurrency(totalSpent, session.organization.currency, true) : "-"}</span>
                  </div>
                </div>
                {totalAllocated > 0 && (
                  <div className="mt-3">
                    <ProgressBar value={utilPct} />
                    <p className="text-[10px] text-[var(--muted)] mt-1">{utilPct}% utilised</p>
                  </div>
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>
    </>
  );
}
