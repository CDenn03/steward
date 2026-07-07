"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { DataTable, createColumnHelper } from '@/components/shared/DataTable';
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import type { BudgetStatus } from "@/types";

type BudgetRow = {
  id: string;
  title: string;
  status: string;
  department: { name: string } | null;
  periodStart: Date | null;
  periodEnd: Date | null;
  totalAmount: number;
  updatedAt: Date;
};

const helper = createColumnHelper<BudgetRow>();

const FILTERS = [
  { label: "All",             value: "all" },
  { label: "Draft",           value: "draft" },
  { label: "Pending Review",  value: "submitted" },
  { label: "Needs Changes",   value: "needs_changes" },
  { label: "Finance Approved",value: "finance_approved" },
  { label: "Approved",        value: "chair_approved" },
  { label: "Rejected",        value: "rejected" },
];

export function BudgetsTable({ budgets }: Readonly<{ budgets: BudgetRow[] }>) {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = budgets.filter((b) => {
    const matchStatus = filter === "all" || b.status === filter;
    const matchSearch =
      !search ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.department?.name.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const columns = [
    helper.accessor("title", {
      header: "Budget Name",
      cell: (info) => (
        <div>
          <p className="font-medium">{info.row.original.title}</p>
          {info.row.original.department && (
            <p className="text-[11px] text-(--muted)">{info.row.original.department.name}</p>
          )}
        </div>
      ),
    }),
    helper.accessor("periodStart", {
      header: "Period",
      cell: (info) => {
        const start = info.row.original.periodStart;
        const end = info.row.original.periodEnd;
        return start ? (
          <span className="text-(--muted)">
            {formatDate(start)}{end ? ` – ${formatDate(end)}` : ""}
          </span>
        ) : <span className="text-(--muted)">—</span>;
      },
    }),
    helper.accessor("totalAmount", {
      header: "Allocated",
      cell: (info) => (
        <span className="font-mono text-[12.5px]">{formatCurrency(info.getValue())}</span>
      ),
    }),
    helper.accessor("status", {
      header: "Status",
      cell: (info) => <StatusBadge status={info.getValue() as BudgetStatus} />,
    }),
    helper.display({
      id: "actions",
      header: "",
      cell: (info) => (
        <Button variant="ghost" size="sm" className="text-[11px] px-2 py-1"
          onClick={(e) => { e.stopPropagation(); router.push(`/budgets/${info.row.original.id}`); }}>
          {info.row.original.status === "draft" ? "Edit" : "View"}
        </Button>
      ),
    }),
  ];

  return (
    <>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {FILTERS.map((f) => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={cn(
              "px-3 py-1.5 text-[12px] font-medium rounded-[var(--r-btn)] border transition-all",
              filter === f.value
                ? "bg-(--primary) text-white border-(--primary)"
                : "bg-transparent text-(--muted) border-(--border) hover:bg-(--bg) hover:text-(--text)"
            )}>
            {f.label}
          </button>
        ))}
        <div className="ml-auto relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-(--muted)" />
          <input type="text" placeholder="Search budgets…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-7 pr-3 py-1.5 text-[12px] bg-(--surface) border border-(--border) rounded-(--r-input) outline-none w-48 focus:border-(--primary) text-(--text) placeholder:text-(--muted) transition-colors" />
        </div>
      </div>
      <Card>
        <DataTable columns={columns} data={filtered} emptyMessage="No budgets match your filter"
          onRowClick={(b) => router.push(`/budgets/${b.id}`)} />
      </Card>
    </>
  );
}
