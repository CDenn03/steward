import Link from "next/link";
import {
  AlertCircle, Download, Plus, DollarSign, Wallet, Calendar, Shield, Clock,
} from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { getDashboardBudgets, getPendingApprovals } from "@/features/budgets/repositories";
import {
  getFinanceDashboard,
  getRecentAuditLogs,
  getUpcomingEvents,
} from "@/features/finance/repositories";
import { PageHeader } from '@/components/shared/PageHeader';
import { DashboardStats } from './DashboardStats';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge, Badge } from '@/components/ui/Badge';
import { BudgetOverviewTable, type BudgetRow } from './BudgetOverviewTable';
import { ExportCsvButton } from '@/components/shared/ExportButton';
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
  role === "department_head"
    ? "Department Head"
    : role === "finance"
      ? "Finance Officer"
      : role === "chairperson"
        ? "Chairperson"
        : role.replace("_", " ");

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

  const pendingCount = approvalRows.length;

  return (
    <>
      <PageHeader
        title={`Good day, ${session.user.name.split(" ")[0] ?? "there"}`}
        subtitle={`${session.organization.name} · ${roleLabel(session.role)}`}
      >
        <ExportCsvButton url="/api/export/budgets/csv" />
        <ExportCsvButton label="Income" url="/api/export/income/csv" />
        <Link href="/budgets/new"><Button size="sm"><Plus size={13} /> New Budget</Button></Link>
      </PageHeader>

      {approvals.length > 0 && (
        <div className="flex items-center gap-2 bg-warning-bg border border-yellow-200 rounded-(--r-btn) px-4 py-2.5 text-[12.5px] text-warning mb-6">
          <AlertCircle size={14} className="shrink-0" />
          <span><strong>{approvalRows.length} budget{approvalRows.length === 1 ? "" : "s"}</strong> pending review.</span>
          <Link href="/approvals" className="ml-auto font-medium underline-offset-2 hover:underline shrink-0">Review now</Link>
        </div>
      )}

      <DashboardStats stats={stats} pendingCount={pendingCount} />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-3 md:gap-4 mb-3.5">
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-[8px] bg-(--primary-light) flex items-center justify-center">
                  <DollarSign size={14} className="text-(--primary)" />
                </div>
                <div>
                  <p className="text-[16px] font-semibold text-(--text)">Budget Overview</p>
                  <p className="text-[13px] text-(--muted)">Latest budgets from the database</p>
                </div>
              </div>
            </CardTitle>
            <Link href="/budgets"><Button variant="ghost" size="sm">View all</Button></Link>
          </CardHeader>
          <BudgetOverviewTable data={budgets} />
        </Card>

        <div className="flex flex-col gap-3 md:gap-4">
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-[8px] bg-(--primary-light) flex items-center justify-center">
                    <Clock size={14} className="text-(--primary)" />
                  </div>
                  <div>
                    <p className="text-[16px] font-semibold text-(--text)">Pending Approvals</p>
                    <p className="text-[13px] text-(--muted)">Awaiting action</p>
                  </div>
                </div>
              </CardTitle>
              <Badge variant="warning">{approvalRows.length} items</Badge>
            </CardHeader>
            <CardBody className="p-0 divide-y divide-(--border)">
              {approvalRows.slice(0, 3).map((approval: ApprovalRow) => {
                const total = approval.budget.items.reduce((sum: number, item: { totalCost: number }) => sum + item.totalCost, 0);
                return (
                  <Link key={approval.id} href={`/budgets/${approval.budgetId}`} className="flex items-start gap-3 px-5 py-3.5 hover:bg-(--bg) transition-colors">
                    <div className="w-8 h-8 rounded-[8px] bg-(--primary-light) flex items-center justify-center text-[12px] font-semibold text-(--primary) shrink-0">
                      {approval.budget.title.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium truncate">{approval.budget.title}</p>
                      <p className="text-[12px] text-(--muted)">{formatCurrency(total)} · Pending {approval.type.toLowerCase()} review</p>
                    </div>
                    <Badge variant="info" className="shrink-0 capitalize">{approval.type.toLowerCase()}</Badge>
                  </Link>
                );
              })}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-[8px] bg-(--primary-light) flex items-center justify-center">
                    <Wallet size={14} className="text-(--primary)" />
                  </div>
                  <div>
                    <p className="text-[16px] font-semibold text-(--text)">Account Balances</p>
                    <p className="text-[13px] text-(--muted)">Current stored balances</p>
                  </div>
                </div>
              </CardTitle>
              <Link href="/accounts"><Button variant="ghost" size="sm">Manage</Button></Link>
            </CardHeader>
            <div className="divide-y divide-(--border)">
              {accounts.map((account: AccountRow) => (
                <div key={account.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-8 h-8 rounded-[8px] bg-(--primary-light) flex items-center justify-center text-[11px] font-semibold text-(--primary) shrink-0">
                    {account.type === "CHECKING" ? "C" : account.type === "SAVINGS" ? "S" : account.type.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium truncate">{account.name}</p>
                    <p className="text-[12px] text-(--muted)">{account.provider ?? account.accountNumber ?? "Account"}</p>
                  </div>
                  <p className="font-mono text-[14px] font-semibold text-(--text)">{formatCurrency(account.balance, account.currency, true)}</p>
                </div>
              ))}
            </div>
            <div className="px-5 py-3.5 border-t border-(--border) flex justify-between items-center">
              <span className="text-[13px] text-(--muted)">Total liquid assets</span>
              <span className="font-mono font-semibold text-[14px] text-(--text)">{formatCurrency(totalBalance, "KES", true)}</span>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 md:gap-4">
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-[8px] bg-(--primary-light) flex items-center justify-center">
                  <Calendar size={14} className="text-(--primary)" />
                </div>
                <div>
                  <p className="text-[16px] font-semibold text-(--text)">Upcoming Events</p>
                  <p className="text-[13px] text-(--muted)">Events with active budgets</p>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardBody className="p-0 divide-y divide-(--border)">
            {eventRows.map((event: EventRow) => {
              const budget = event.budgets[0];
              const total = budget?.items.reduce((sum: number, item: { totalCost: number }) => sum + item.totalCost, 0) ?? 0;
              return (
                <div key={event.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="w-9 h-9 rounded-[8px] bg-(--primary-light) flex flex-col items-center justify-center shrink-0">
                    <p className="text-[14px] font-bold leading-none text-(--primary)">{event.startDate.getDate()}</p>
                    <p className="text-[8px] font-semibold text-(--primary) tracking-wide uppercase">{event.startDate.toLocaleString("en", { month: "short" })}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium truncate">{event.name}</p>
                    <p className="text-[12px] text-(--muted)">
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
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-[8px] bg-(--primary-light) flex items-center justify-center">
                  <Shield size={14} className="text-(--primary)" />
                </div>
                <div>
                  <p className="text-[16px] font-semibold text-(--text)">Recent Activity</p>
                  <p className="text-[13px] text-(--muted)">Audit trail</p>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardBody className="px-5 py-4">
            {auditRows.map((log: AuditRow, index: number) => (
              <div key={log.id} className="flex gap-3.5 pb-4 last:pb-0 relative">
                <div className="flex flex-col items-center shrink-0">
                  <div className={`w-7 h-7 rounded-[8px] flex items-center justify-center ${index < 2 ? "bg-(--primary-light) text-(--primary)" : "bg-(--bg) text-(--muted)"}`}>
                    <Shield size={12} />
                  </div>
                  {index < auditRows.length - 1 && <div className="w-px flex-1 bg-(--border) mt-1" />}
                </div>
                <div className="flex-1 min-w-0 pb-1">
                  <p className="text-[14px] leading-snug">
                    <span className="font-medium capitalize">{log.entityType.replace(/_/g, " ")}</span> {log.action.replace(/_/g, " ")}
                  </p>
                  <p className="text-[12px] text-(--muted) mt-0.5">{formatRelative(log.createdAt)}</p>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
