"use client";

import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { formatCurrency, pct } from "@/lib/utils";
import type { BudgetStatus } from "@/types";

export type BudgetRow = {
  id: string;
  title: string;
  status: BudgetStatus;
  department: { name: string } | null;
  totalAmount: number;
  spentAmount: number;
};

const columns = [
  {
    key: "name",
    header: "Department / Event",
    render: (budget: BudgetRow) => (
      <div>
        <p className="font-medium">{budget.title}</p>
        <p className="text-[11px] text-[var(--muted)]">{budget.department?.name ?? "General"}</p>
      </div>
    ),
  },
  {
    key: "amount",
    header: "Amount",
    render: (budget: BudgetRow) => (
      <span className="font-mono text-[12.5px]">{formatCurrency(budget.totalAmount)}</span>
    ),
  },
  {
    key: "utilisation",
    header: "Utilisation",
    render: (budget: BudgetRow) => {
      if (!budget.spentAmount) return <span className="text-[var(--muted)] text-[12px]">-</span>;
      const value = pct(budget.spentAmount, budget.totalAmount);
      return (
        <div className="w-24">
          <span className="text-[12px] text-[var(--muted)]">{value}%</span>
          <ProgressBar value={value} className="mt-1" />
        </div>
      );
    },
  },
  {
    key: "status",
    header: "Status",
    render: (budget: BudgetRow) => <StatusBadge status={budget.status} />,
  },
];

export function BudgetOverviewTable({ data }: { data: BudgetRow[] }) {
  return <DataTable columns={columns} data={data} />;
}
