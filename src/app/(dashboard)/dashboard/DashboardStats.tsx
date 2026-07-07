"use client";

import { CheckSquare, TrendingUp, TrendingDown, FileText } from "lucide-react";
import { StatCard } from '@/components/shared/StatCard';
import { formatCurrency } from "@/lib/utils";

type Stats = {
  approvedBudget: number;
  totalIncome: number;
  totalExpenditure: number;
  outstandingReports: number;
  expenditurePct: number;
  accountabilityRate: number;
};

export function DashboardStats({ stats, pendingCount }: { stats: Stats; pendingCount: number }) {
  const expenditurePct = stats.expenditurePct;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 mb-6">
      <StatCard
        icon={CheckSquare}
        label="Approved Budget"
        value={formatCurrency(stats.approvedBudget, "KES", true)}
      />
      <StatCard
        icon={TrendingUp}
        label="Total Income"
        value={formatCurrency(stats.totalIncome, "KES", true)}
      />
      <StatCard
        icon={TrendingDown}
        label="Total Expenditure"
        value={formatCurrency(stats.totalExpenditure, "KES", true)}
        trend={{
          value: `${expenditurePct}%`,
          label: "of approved",
          direction: expenditurePct > 50 ? "up" : "down",
        }}
      />
      <StatCard
        icon={FileText}
        label="Outstanding Reports"
        value={String(stats.outstandingReports)}
        ring={{
          current: stats.outstandingReports,
          total: stats.outstandingReports + pendingCount,
          centerLabel: `${stats.accountabilityRate}%`,
        }}
      />
    </div>
  );
}
