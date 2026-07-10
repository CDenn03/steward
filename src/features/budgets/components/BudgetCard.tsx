import Link from "next/link";
import { formatCurrency, pct, formatRelative } from "@/lib/utils";
import { StatusBadge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/Progress';
import type { Budget } from "@/types";

interface BudgetCardProps {
  budget: Budget;
}

export function BudgetCard({ budget }: Readonly<BudgetCardProps>) {
  const utilPct = budget.spentAmount ? pct(budget.spentAmount, budget.totalAmount) : 0;

  return (
    <Link
      href={`/budgets/${budget.id}`}
      className="block bg-(--surface) border border-(--border) rounded-(--r-card) p-5 hover:shadow-card-hover transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-3">
          <p className="text-[14px] font-medium truncate">{budget.title}</p>
          <p className="text-[12px] text-(--muted) mt-0.5">{budget.department?.name}</p>
        </div>
        <StatusBadge status={budget.status} />
      </div>

      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-[12px] text-(--muted) mb-0.5">Total</p>
          <p className="text-[17px] font-semibold font-mono tracking-tight">{formatCurrency(budget.totalAmount)}</p>
        </div>
        {budget.spentAmount && (
          <div className="text-right">
            <p className="text-[12px] text-(--muted) mb-0.5">Spent</p>
            <p className="text-[14px] font-mono">{formatCurrency(budget.spentAmount)}</p>
          </div>
        )}
      </div>

      {budget.spentAmount && (
        <div>
          <ProgressBar value={utilPct} />
          <div className="flex justify-between mt-1.5">
            <span className="text-[11px] text-(--muted)">{utilPct}% utilised</span>
            <span className="text-[11px] text-(--muted)">{formatRelative(budget.updatedAt)}</span>
          </div>
        </div>
      )}

      {!budget.spentAmount && (
        <p className="text-[12px] text-(--muted)">{formatRelative(budget.updatedAt)}</p>
      )}
    </Link>
  );
}
