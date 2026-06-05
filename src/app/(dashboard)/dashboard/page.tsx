"use client";

import Link from "next/link";
import { AlertCircle, Download, Plus } from "lucide-react";
import { useOrg } from "@/lib/org/context";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { DataTable } from "@/components/shared/data-table";
import { formatCurrency, formatRelative, pct } from "@/lib/utils";
import {
  mockDashboardStats, mockBudgets, mockAccounts,
  mockApprovals, mockAuditLogs, mockEvents,
} from "@/lib/mock/data";
import type { Budget } from "@/types";

export default function DashboardPage() {
  const { active } = useOrg();
  const orgId = active?.orgId ?? "org-1";

  // Scope all data to the active org
  const stats    = mockDashboardStats[orgId] ?? mockDashboardStats["org-1"];
  const budgets  = mockBudgets.filter((b) => b.organizationId === orgId);
  const accounts = mockAccounts.filter((a) => a.organizationId === orgId);
  const events   = mockEvents.filter((e) => e.organizationId === orgId);

  const {
    approvedBudget, approvedBudgetDelta, totalIncome, totalIncomeDelta,
    totalExpenditure, expenditurePct, outstandingReports, outstandingReportsDelta,
    accountabilityRate,
  } = stats;

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);

  const budgetColumns = [
    {
      key: "name", header: "Department / Event",
      render: (b: Budget) => (
        <div>
          <p className="font-medium">{b.title}</p>
          <p className="text-[11px] text-[var(--muted)]">{b.department?.name}</p>
        </div>
      ),
    },
    {
      key: "amount", header: "Amount",
      render: (b: Budget) => <span className="font-mono text-[12.5px]">{formatCurrency(b.totalAmount)}</span>,
    },
    {
      key: "utilisation", header: "Utilisation",
      render: (b: Budget) => {
        if (!b.spentAmount) return <span className="text-[var(--muted)] text-[12px]">—</span>;
        const p = pct(b.spentAmount, b.totalAmount);
        return (
          <div className="w-24">
            <span className="text-[12px] text-[var(--muted)]">{p}%</span>
            <ProgressBar value={p} className="mt-1" />
          </div>
        );
      },
    },
    {
      key: "status", header: "Status",
      render: (b: Budget) => <StatusBadge status={b.status} />,
    },
  ];

  const greetingTime = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <>
      <PageHeader
        title={`${greetingTime()}, ${active?.userName?.split(" ")[0] ?? "there"}`}
        subtitle={`${active?.orgName ?? "—"} · ${active ? (active.departmentName ? active.departmentName + " · " : "") + (active.role === "department_head" ? "Department Head" : active.role === "finance" ? "Finance Officer" : active.role === "chairperson" ? "Chairperson" : active.role) : ""}`}
      >
        <Button variant="ghost" size="sm"><Download size={13} /> Export</Button>
        <Button size="sm"><Plus size={13} /> New Budget</Button>
      </PageHeader>

      {/* Pending-review alert */}
      <div className="flex items-center gap-2 bg-warning-bg border border-yellow-200 rounded-[var(--r-btn)] px-4 py-2.5 text-[12.5px] text-warning mb-6">
        <AlertCircle size={14} className="flex-shrink-0" />
        <span><strong>3 budgets</strong> are pending your review before the Finance Committee meeting on Friday.</span>
        <Link href="/approvals" className="ml-auto font-medium underline-offset-2 hover:underline flex-shrink-0">Review now</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3.5 mb-6">
        <StatCard label="Approved Budget"     value={formatCurrency(approvedBudget, "KES", true)}    delta={approvedBudgetDelta}  deltaLabel="vs last quarter" />
        <StatCard label="Total Income"        value={formatCurrency(totalIncome, "KES", true)}        delta={totalIncomeDelta}     deltaLabel="year to date"    accentColor="success" />
        <StatCard label="Total Expenditure"   value={formatCurrency(totalExpenditure, "KES", true)}   delta={expenditurePct}       deltaLabel="of approved"     accentColor="gold" />
        <StatCard
          label="Outstanding Reports" value={String(outstandingReports)}
          delta={outstandingReportsDelta} deltaLabel="from last month" accentColor="warning"
          progress={accountabilityRate} progressLabel={`${accountabilityRate}% submitted`}
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-[1fr_360px] gap-3.5 mb-3.5">
        <Card>
          <CardHeader>
            <CardTitle>
              <p className="text-[14px] font-medium">Budget Overview</p>
              <p className="text-[12px] text-[var(--muted)]">All active budgets this cycle</p>
            </CardTitle>
            <Link href="/budgets"><Button variant="ghost" size="sm">View all</Button></Link>
          </CardHeader>
          <DataTable columns={budgetColumns} data={budgets.slice(0, 6)} onRowClick={() => {}} />
        </Card>

        <div className="flex flex-col gap-3.5">
          {/* Approvals */}
          <Card>
            <CardHeader>
              <CardTitle>
                <p className="text-[14px] font-medium">Pending Approvals</p>
                <p className="text-[12px] text-[var(--muted)]">Awaiting your action</p>
              </CardTitle>
              <span className="text-[11px] font-medium bg-warning-bg text-warning px-2 py-0.5 rounded-md">
                {mockApprovals.filter(a => mockBudgets.find(b => b.id === a.budgetId)?.organizationId === orgId).length} items
              </span>
            </CardHeader>
            <CardBody className="p-0 divide-y divide-[var(--border)]">
              {mockApprovals
                .filter(a => mockBudgets.find(b => b.id === a.budgetId)?.organizationId === orgId)
                .slice(0, 3)
                .map((a) => {
                  const b = mockBudgets.find((bud) => bud.id === a.budgetId);
                  return (
                    <div key={a.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-[var(--bg)] cursor-pointer transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-[var(--primary-light)] flex items-center justify-center text-[13px] flex-shrink-0">💰</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium truncate">{b?.title}</p>
                        <p className="text-[11px] text-[var(--muted)]">{b ? formatCurrency(b.totalAmount) : ""} · Pending {a.type} review</p>
                      </div>
                      <span className="text-[10px] font-medium bg-[var(--primary-light)] text-[var(--primary)] px-1.5 py-0.5 rounded flex-shrink-0 capitalize">{a.type}</span>
                    </div>
                  );
                })}
            </CardBody>
          </Card>

          {/* Accounts */}
          <Card>
            <CardHeader>
              <CardTitle>
                <p className="text-[14px] font-medium">Account Balances</p>
                <p className="text-[12px] text-[var(--muted)]">As of today</p>
              </CardTitle>
              <Link href="/accounts"><Button variant="ghost" size="sm">Manage</Button></Link>
            </CardHeader>
            <div className="divide-y divide-[var(--border)]">
              {accounts.map((acc) => (
                <div key={acc.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg)] cursor-pointer transition-colors">
                  <div className="w-9 h-9 rounded-[10px] bg-[var(--primary-light)] flex items-center justify-center text-base flex-shrink-0">
                    {acc.type === "mpesa" ? "📱" : acc.type === "savings" ? "💰" : "🏦"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate">{acc.name}</p>
                    <p className="text-[11px] text-[var(--muted)]">{acc.provider}</p>
                  </div>
                  <p className="font-mono text-[13px] font-medium">{formatCurrency(acc.balance, "KES", true)}</p>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 border-t border-[var(--border)] flex justify-between items-center">
              <span className="text-[12px] text-[var(--muted)]">Total liquid assets</span>
              <span className="font-mono font-semibold text-[13px]">{formatCurrency(totalBalance, "KES", true)}</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>
              <p className="text-[14px] font-medium">Upcoming Events</p>
              <p className="text-[12px] text-[var(--muted)]">Events with active budgets</p>
            </CardTitle>
          </CardHeader>
          <CardBody className="p-0 divide-y divide-[var(--border)]">
            {events.slice(0, 4).map((ev) => {
              const budget = budgets.find((b) => b.departmentId === ev.departmentId);
              const day = ev.startDate.getDate();
              const mon = ev.startDate.toLocaleString("en", { month: "short" }).toUpperCase();
              return (
                <div key={ev.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[var(--bg)] cursor-pointer transition-colors">
                  <div className="text-center w-9 flex-shrink-0">
                    <p className="text-[18px] font-semibold leading-none text-[var(--primary)]">{day}</p>
                    <p className="text-[10px] text-[var(--muted)] tracking-wide">{mon}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate">{ev.name}</p>
                    <p className="text-[11px] text-[var(--muted)]">
                      {budget ? `Budget ${formatCurrency(budget.totalAmount, "KES", true)}` : "Budget not started"}
                    </p>
                  </div>
                  <StatusBadge status={budget?.status ?? "draft"} />
                </div>
              );
            })}
          </CardBody>
        </Card>

        {/* Activity */}
        <Card>
          <CardHeader>
            <CardTitle>
              <p className="text-[14px] font-medium">Recent Activity</p>
              <p className="text-[12px] text-[var(--muted)]">Audit trail · last 24 hours</p>
            </CardTitle>
          </CardHeader>
          <CardBody className="pt-3">
            {mockAuditLogs
              .filter(l => l.organizationId === orgId)
              .slice(0, 5)
              .map((log, i, arr) => (
              <div key={log.id} className="flex gap-3.5 pb-4 relative">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className={`w-2 h-2 rounded-full mt-1.5 z-10 ${i < 2 ? "bg-[var(--primary)]" : "bg-[var(--border)]"}`} />
                  {i < arr.length - 1 && <div className="w-px flex-1 bg-[var(--border)] mt-1" />}
                </div>
                <div className="flex-1 min-w-0 pb-1">
                  <p className="text-[13px] leading-snug">
                    <span className="font-medium">{log.actor?.name}</span>{" "}
                    {log.action === "submitted"    && "submitted a budget for review"}
                    {log.action === "approved"     && `approved disbursement${log.after?.amount ? " of " + formatCurrency(log.after.amount as number) : ""}`}
                    {log.action === "uploaded"     && `uploaded ${log.after?.count ?? ""} receipt${Number(log.after?.count ?? 1) !== 1 ? "s" : ""}`}
                    {log.action === "needs_changes"&& "requested changes on a budget"}
                    {log.action === "recorded"     && `recorded income${log.after?.amount ? " " + formatCurrency(log.after.amount as number) : ""}`}
                  </p>
                  <p className="text-[11px] text-[var(--muted)] mt-0.5">{formatRelative(log.createdAt)}</p>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
