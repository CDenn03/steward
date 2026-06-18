import { Building2 } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";
import { getDepartmentBudgetSummaries } from "@/features/budgets/repositories";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { formatCurrency, pct } from "@/lib/utils";
import { AddDepartmentButton } from "./add-department-button";

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
  const [departments, members] = await Promise.all([
    getDepartmentBudgetSummaries(session.organizationId),
    prisma.membership.findMany({
      where: { organizationId: session.organizationId, isActive: true },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { joinedAt: "asc" },
    }),
  ]);
  const deptRows = departments as DepartmentRow[];
  const memberOptions = members.map((m: { userId: string; user: { id: string; name: string } }) => ({ id: m.userId, name: m.user.name }));

  return (
    <>
      <PageHeader title="Departments" subtitle="Manage departments, heads, and budget allocations">
        <AddDepartmentButton members={memberOptions} />
      </PageHeader>
      <div className="grid grid-cols-3 gap-4">
        {deptRows.map((dept: DepartmentRow) => {
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
                <div className="w-10 h-10 rounded-[10px] bg-[var(--primary-light)] flex items-center justify-center text-(--primary) mb-3">
                  <Building2 size={18} />
                </div>
                <h3 className="text-[15px] font-medium mb-1">{dept.name}</h3>
                <p className="text-[12px] text-(--muted) mb-4">{dept.budgets.length} active budget{dept.budgets.length !== 1 ? "s" : ""}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-(--muted)">Allocated</span>
                    <span className="font-mono">{formatCurrency(totalAllocated, session.organization.currency, true)}</span>
                  </div>
                  <div className="flex justify-between text-[12px]">
                    <span className="text-(--muted)">Spent</span>
                    <span className="font-mono">{totalSpent > 0 ? formatCurrency(totalSpent, session.organization.currency, true) : "-"}</span>
                  </div>
                </div>
                {totalAllocated > 0 && (
                  <div className="mt-3">
                    <ProgressBar value={utilPct} />
                    <p className="text-[10px] text-(--muted) mt-1">{utilPct}% utilised</p>
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
