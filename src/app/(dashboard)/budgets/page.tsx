"use client";
import { useState } from "react";
import { Plus, Search, Download } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { DataTable } from "@/components/shared/data-table";
import { formatCurrency, formatDate, pct } from "@/lib/utils";
import { mockBudgets } from "@/lib/mock/data";
import type { Budget, BudgetStatus } from "@/types";
import { cn } from "@/lib/utils";

const filters: { label: string; value: BudgetStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Pending Review", value: "submitted" },
  { label: "Needs Changes", value: "needs_changes" },
  { label: "Finance Approved", value: "finance_approved" },
  { label: "Approved", value: "chair_approved" },
  { label: "Rejected", value: "rejected" },
];

export default function BudgetsPage() {
  const [activeFilter, setActiveFilter] = useState<BudgetStatus | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = mockBudgets.filter((b) => {
    const matchStatus = activeFilter === "all" || b.status === activeFilter;
    const matchSearch =
      !search ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.department?.name.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const columns = [
    {
      key: "title",
      header: "Budget Name",
      render: (b: Budget) => (
        <div>
          <p className="font-medium">{b.title}</p>
          {b.periodStart && (
            <p className="text-[11px] text-[var(--muted)]">{b.department?.name}</p>
          )}
        </div>
      ),
    },
    {
      key: "dept",
      header: "Department",
      render: (b: Budget) => <span className="text-[var(--muted)]">{b.department?.name ?? "—"}</span>,
    },
    {
      key: "period",
      header: "Period",
      render: (b: Budget) =>
        b.periodStart ? (
          <span className="text-[var(--muted)]">
            {formatDate(b.periodStart)}
            {b.periodEnd ? ` – ${formatDate(b.periodEnd)}` : ""}
          </span>
        ) : <span className="text-[var(--muted)]">—</span>,
    },
    {
      key: "amount",
      header: "Allocated",
      render: (b: Budget) => (
        <span className="font-mono text-[12.5px]">{formatCurrency(b.totalAmount).replace("KES ", "")}</span>
      ),
    },
    {
      key: "spent",
      header: "Spent",
      render: (b: Budget) => (
        <span className="font-mono text-[12.5px] text-[var(--muted)]">
          {b.spentAmount ? formatCurrency(b.spentAmount).replace("KES ", "") : "—"}
        </span>
      ),
    },
    {
      key: "variance",
      header: "Remaining",
      render: (b: Budget) => {
        if (!b.spentAmount) return <span className="text-[var(--muted)]">—</span>;
        const remaining = b.totalAmount - b.spentAmount;
        return (
          <span className={cn("font-mono text-[12.5px]", remaining >= 0 ? "text-success" : "text-danger")}>
            {remaining >= 0 ? "+" : ""}{formatCurrency(remaining).replace("KES ", "")}
          </span>
        );
      },
    },
    {
      key: "utilisation",
      header: "Utilisation",
      render: (b: Budget) => {
        if (!b.spentAmount) return <span className="text-[var(--muted)] text-[12px]">—</span>;
        const p = pct(b.spentAmount, b.totalAmount);
        return (
          <div className="w-20">
            <span className="text-[11px] text-[var(--muted)]">{p}%</span>
            <ProgressBar value={p} className="mt-1" />
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (b: Budget) => <StatusBadge status={b.status} />,
    },
    {
      key: "actions",
      header: "",
      render: (b: Budget) => (
        <Button variant="ghost" size="sm" className="text-[11px] px-2 py-1">
          {b.status === "draft" ? "Edit" : "View"}
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Budgets"
        subtitle="Manage and track all department and event budgets"
      >
        <Button variant="ghost" size="sm"><Download size={13} /> Export</Button>
        <Button size="sm"><Plus size={13} /> New Budget</Button>
      </PageHeader>

      {/* Summary row */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total Budgets", value: mockBudgets.length, sub: "This cycle" },
          { label: "Approved", value: mockBudgets.filter(b => b.status === "chair_approved").length, sub: "Fully approved" },
          { label: "Pending Review", value: mockBudgets.filter(b => b.status === "submitted" || b.status === "finance_approved").length, sub: "In review queue" },
          { label: "Total Allocated", value: formatCurrency(mockBudgets.reduce((s, b) => s + b.totalAmount, 0), "KES", true), sub: "All budgets combined" },
        ].map((s) => (
          <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-card)] px-4 py-3.5">
            <p className="text-[11px] text-[var(--muted)] uppercase tracking-[0.5px] font-medium">{s.label}</p>
            <p className="text-[20px] font-semibold tracking-tight mt-1">{s.value}</p>
            <p className="text-[11px] text-[var(--muted)] mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters & search */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={cn(
              "px-3 py-1.5 text-[12px] font-medium rounded-[var(--r-btn)] border transition-all",
              activeFilter === f.value
                ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                : "bg-transparent text-[var(--muted)] border-[var(--border)] hover:bg-[var(--bg)] hover:text-[var(--text)]"
            )}
          >
            {f.label}
          </button>
        ))}
        <div className="ml-auto relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Search budgets…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-7 pr-3 py-1.5 text-[12px] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-input)] outline-none w-48 focus:border-[var(--primary)] text-[var(--text)] placeholder:text-[var(--muted)] transition-colors"
          />
        </div>
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={filtered}
          emptyMessage="No budgets match your filter"
        />
      </Card>
    </>
  );
}
