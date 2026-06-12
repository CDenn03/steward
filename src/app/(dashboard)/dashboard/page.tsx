import Link from "next/link";
import { AlertCircle, Download, Plus } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { getDashboardBudgets, getPendingApprovals } from "@/features/budgets/repositories";
import {
  getFinanceDashboard,
  getRecentAuditLogs,
  getUpcomingEvents,
} from "@/features/finance/repositories";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { BudgetOverviewTable, type BudgetRow } from "./budget-overview-table";
import { formatCurrency, formatRelative } from "@/lib/utils";
import type { BudgetStatus } from "@/types";

type RawDashboardBudget = {
  id: string;
  title: string;
  status: string;
  department: { name: string } | null;
  items: Array<{ totalCost: number }>;
  expenditures: Array<{ totalClaimed: number }>;
};

type AccountRow = {
  id: string;
  name: string;
  accountNumber: string | null;
  provider: string | null;
  type: string;
  balance: number;
  currency: string;
};

type ApprovalRow = {
  id: string;
  budgetId: string;
  type: string;
  createdAt: Date;
  budget: {
    title: string;
    status: string;
    department: { name: string } | null;
    items: Array<{ totalCost: number }>;
  };
};

type EventRow = {
  id: string;
  name: string;
  startDate: Date;
  budgets: Array<{ status: string; items: Array<{ totalCost: number }> }>;
};

type AuditRow = {
  id: string;
  entityType: string;
  action: string;
  createdAt: Date;
};

const status = (value: string) => value.toLowerCase() as BudgetStatus;
const roleLabel = (role: string) =>
  role === "DEPARTMENT_HEAD"
    ? "Department Head"
    : role === "FINANCE"
      ? "Finance Officer"
      : role === "CHAIRPERSON"
        ? "Chairperson"
        : role.toLowerCase();

export default async function DashboardPage() {
  const session = await requireSession();
  const [stats, rawBudgets, approvals, events, auditLogs] = await Promise.all([
    getFinanceDashboard(session.organizationId),
    getDashboardBudgets(session.organizationId),
    getPendingApprovals(session.organizationId),
    getUpcomingEvents(session.organizationId),
    getRecentAuditLogs(session.organizationId),
  ]);

  const budgets: BudgetRow[] = (rawBudgets as RawDashboardBudget[]).map((budget: RawDashboardBudget) => ({
    id: budget.id,
    title: budget.title,
    status: status(budget.status),
    department: budget.department ? { name: budget.department.name } : null,
    totalAmount: budget.items.reduce((sum: number, item: { totalCost: number }) => sum + item.totalCost, 0),
    spentAmount: budget.expenditures.reduce((sum: number, report: { totalClaimed: number }) => sum + report.totalClaimed, 0),
  }));
  const accounts = stats.accounts as AccountRow[];
  const approvalRows = approvals as ApprovalRow[];
  const eventRows = events as EventRow[];
  const auditRows = auditLogs as AuditRow[];
  const totalBalance = accounts.reduce((sum: number, account: AccountRow) => sum + account.balance, 0);

  return (
    <>
      <PageHeader
        title={`Good day, ${session.user.name.split(" ")[0] ?? "there"}`}
        subtitle={`${session.organization.name} · ${roleLabel(session.role)}`}
      >
        <Button variant="ghost" size="sm"><Download size={13} /> Export</Button>
        <Link href="/budgets/new"><Button size="sm"><Plus size={13} /> New Budget</Button></Link>
      </PageHeader>

      {approvals.length > 0 && (
        <div className="flex items-center gap-2 bg-warning-bg border border-yellow-200 rounded-[var(--r-btn)] px-4 py-2.5 text-[12.5px] text-warning mb-6">
          <AlertCircle size={14} className="flex-shrink-0" />
          <span><strong>{approvalRows.length} budget{approvalRows.length === 1 ? "" : "s"}</strong> pending review.</span>
          <Link href="/approvals" className="ml-auto font-medium underline-offset-2 hover:underline flex-shrink-0">Review now</Link>
        </div>
      )}

      <div className="grid grid-cols-4 gap-3.5 mb-6">
        <StatCard label="Approved Budget" value={formatCurrency(stats.approvedBudget, "KES", true)} deltaLabel="fully approved" />
        <StatCard label="Total Income" value={formatCurrency(stats.totalIncome, "KES", true)} deltaLabel="all time" accentColor="success" />
        <StatCard label="Total Expenditure" value={formatCurrency(stats.totalExpenditure, "KES", true)} delta={stats.expenditurePct} deltaLabel="of approved" accentColor="gold" />
        <StatCard
          label="Outstanding Reports"
          value={String(stats.outstandingReports)}
          deltaLabel="draft reports"
          accentColor="warning"
          progress={stats.accountabilityRate}
          progressLabel={`${stats.accountabilityRate}% clear`}
        />
      </div>

      <div className="grid grid-cols-[1fr_360px] gap-3.5 mb-3.5">
        <Card>
          <CardHeader>
            <CardTitle>
              <p className="text-[14px] font-medium">Budget Overview</p>
              <p className="text-[12px] text-[var(--muted)]">Latest budgets from the database</p>
            </CardTitle>
            <Link href="/budgets"><Button variant="ghost" size="sm">View all</Button></Link>
          </CardHeader>
          <BudgetOverviewTable data={budgets} />
        </Card>

        <div className="flex flex-col gap-3.5">
          <Card>
            <CardHeader>
              <CardTitle>
                <p className="text-[14px] font-medium">Pending Approvals</p>
                <p className="text-[12px] text-[var(--muted)]">Awaiting action</p>
              </CardTitle>
              <span className="text-[11px] font-medium bg-warning-bg text-warning px-2 py-0.5 rounded-md">
                {approvalRows.length} items
              </span>
            </CardHeader>
            <CardBody className="p-0 divide-y divide-[var(--border)]">
              {approvalRows.slice(0, 3).map((approval: ApprovalRow) => {
                const total = approval.budget.items.reduce((sum: number, item: { totalCost: number }) => sum + item.totalCost, 0);
                return (
                  <Link key={approval.id} href={`/budgets/${approval.budgetId}`} className="flex items-start gap-3 px-5 py-3.5 hover:bg-[var(--bg)] transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-[var(--primary-light)] flex items-center justify-center text-[13px] flex-shrink-0">KES</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium truncate">{approval.budget.title}</p>
                      <p className="text-[11px] text-[var(--muted)]">{formatCurrency(total)} · Pending {approval.type.toLowerCase()} review</p>
                    </div>
                    <span className="text-[10px] font-medium bg-[var(--primary-light)] text-[var(--primary)] px-1.5 py-0.5 rounded flex-shrink-0 capitalize">{approval.type.toLowerCase()}</span>
                  </Link>
                );
              })}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <p className="text-[14px] font-medium">Account Balances</p>
                <p className="text-[12px] text-[var(--muted)]">Current stored balances</p>
              </CardTitle>
              <Link href="/accounts"><Button variant="ghost" size="sm">Manage</Button></Link>
            </CardHeader>
            <div className="divide-y divide-[var(--border)]">
              {accounts.map((account: AccountRow) => (
                <div key={account.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-9 h-9 rounded-[10px] bg-[var(--primary-light)] flex items-center justify-center text-[11px] font-semibold flex-shrink-0">
                    {account.type}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate">{account.name}</p>
                    <p className="text-[11px] text-[var(--muted)]">{account.provider ?? account.accountNumber ?? "Account"}</p>
                  </div>
                  <p className="font-mono text-[13px] font-medium">{formatCurrency(account.balance, account.currency, true)}</p>
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

      <div className="grid grid-cols-2 gap-3.5">
        <Card>
          <CardHeader>
            <CardTitle>
              <p className="text-[14px] font-medium">Upcoming Events</p>
              <p className="text-[12px] text-[var(--muted)]">Events with active budgets</p>
            </CardTitle>
          </CardHeader>
          <CardBody className="p-0 divide-y divide-[var(--border)]">
            {eventRows.map((event: EventRow) => {
              const budget = event.budgets[0];
              const total = budget?.items.reduce((sum: number, item: { totalCost: number }) => sum + item.totalCost, 0) ?? 0;
              return (
                <div key={event.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="text-center w-9 flex-shrink-0">
                    <p className="text-[18px] font-semibold leading-none text-[var(--primary)]">{event.startDate.getDate()}</p>
                    <p className="text-[10px] text-[var(--muted)] tracking-wide">{event.startDate.toLocaleString("en", { month: "short" }).toUpperCase()}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate">{event.name}</p>
                    <p className="text-[11px] text-[var(--muted)]">
                      {budget ? `Budget ${formatCurrency(total, "KES", true)}` : "Budget not started"}
                    </p>
                  </div>
                  <StatusBadge status={budget ? status(budget.status) : "draft"} />
                </div>
              );
            })}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <p className="text-[14px] font-medium">Recent Activity</p>
              <p className="text-[12px] text-[var(--muted)]">Audit trail</p>
            </CardTitle>
          </CardHeader>
          <CardBody className="pt-3">
            {auditRows.map((log: AuditRow, index: number) => (
              <div key={log.id} className="flex gap-3.5 pb-4 relative">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className={`w-2 h-2 rounded-full mt-1.5 z-10 ${index < 2 ? "bg-[var(--primary)]" : "bg-[var(--border)]"}`} />
                </div>
                <div className="flex-1 min-w-0 pb-1">
                  <p className="text-[13px] leading-snug">
                    <span className="font-medium">{log.entityType}</span> {log.action}
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
