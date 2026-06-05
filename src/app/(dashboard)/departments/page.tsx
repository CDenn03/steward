"use client";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { formatCurrency, pct } from "@/lib/utils";
import { mockDepartments, mockBudgets } from "@/lib/mock/data";

export default function DepartmentsPage() {
  return (
    <>
      <PageHeader title="Departments" subtitle="Manage departments, heads, and budget allocations">
        <Button variant="ghost" size="sm"><Plus size={13} /> Add Department</Button>
      </PageHeader>
      <div className="grid grid-cols-3 gap-4">
        {mockDepartments.map((dept) => {
          const budgets = mockBudgets.filter((b) => b.departmentId === dept.id);
          const totalAllocated = budgets.reduce((s, b) => s + b.totalAmount, 0);
          const totalSpent = budgets.reduce((s, b) => s + (b.spentAmount ?? 0), 0);
          const utilPct = pct(totalSpent, totalAllocated);
          return (
            <Card key={dept.id} className="hover:shadow-card-hover transition-shadow cursor-pointer">
              <CardBody>
                <div className="w-10 h-10 rounded-[10px] bg-[var(--primary-light)] flex items-center justify-center text-xl mb-3">🏛️</div>
                <h3 className="text-[15px] font-medium mb-1">{dept.name}</h3>
                <p className="text-[12px] text-[var(--muted)] mb-4">{budgets.length} active budget{budgets.length !== 1 ? "s" : ""}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-[var(--muted)]">Allocated</span>
                    <span className="font-mono">{formatCurrency(totalAllocated, "KES", true)}</span>
                  </div>
                  <div className="flex justify-between text-[12px]">
                    <span className="text-[var(--muted)]">Spent</span>
                    <span className="font-mono">{totalSpent > 0 ? formatCurrency(totalSpent, "KES", true) : "—"}</span>
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
