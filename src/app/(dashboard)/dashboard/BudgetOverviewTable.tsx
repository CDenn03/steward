"use client";

import { DataTable, createColumnHelper } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/Progress';
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

const helper = createColumnHelper<BudgetRow>();

const columns = [
  helper.accessor("title", {
    header: "Department / Event",
    cell: (info) => (
      <div>
        <p className="font-medium">{info.getValue()}</p>
        <p className="text-[12px] text-(--muted)">{info.row.original.department?.name ?? "General"}</p>
      </div>
    ),
  }),
  helper.accessor("totalAmount", {
    header: "Amount",
    cell: (info) => <span className="font-mono text-[12.5px]">{formatCurrency(info.getValue())}</span>,
  }),
  helper.display({
    id: "utilisation",
    header: "Utilisation",
    cell: (info) => {
      const { spentAmount, totalAmount } = info.row.original;
      if (!spentAmount) return <span className="text-(--muted) text-[13px]">-</span>;
      const value = pct(spentAmount, totalAmount);
      return (
        <div className="w-24">
          <span className="text-[13px] text-(--muted)">{value}%</span>
          <ProgressBar value={value} className="mt-1" />
        </div>
      );
    },
  }),
  helper.accessor("status", {
    header: "Status",
    cell: (info) => <StatusBadge status={info.getValue()} />,
  }),
];

export function BudgetOverviewTable({ data }: { data: BudgetRow[] }) {
  return <DataTable columns={columns} data={data} />;
}
