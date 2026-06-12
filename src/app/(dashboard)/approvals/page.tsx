import Link from "next/link";
import { CheckCircle2, XCircle, MessageSquare } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { getBudgetsByOrg, getPendingApprovals } from "@/features/budgets/repositories";
import { getExpenditureReportsByOrg } from "@/features/finance/repositories";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { formatCurrency, formatRelative } from "@/lib/utils";
import type { BudgetStatus } from "@/types";

const status = (value: string) => value.toLowerCase() as BudgetStatus;

type BudgetRow = {
  id: string;
  title: string;
  status: string;
  items: Array<{ totalCost: number }>;
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

type ReportRow = {
  id: string;
  title: string;
  status: string;
  totalClaimed: number;
  submittedAt: Date | null;
};

export default async function ApprovalsPage() {
  const session = await requireSession();
  const [approvals, budgets, expenditureReports] = await Promise.all([
    getPendingApprovals(session.organizationId),
    getBudgetsByOrg(session.organizationId),
    getExpenditureReportsByOrg(session.organizationId),
  ]);

  const budgetRows = budgets as BudgetRow[];
  const approvalRows = approvals as ApprovalRow[];
  const reportRows = expenditureReports as ReportRow[];
  const pendingFinance = budgetRows.filter((budget: BudgetRow) => budget.status === "SUBMITTED");
  const pendingChair = budgetRows.filter((budget: BudgetRow) => budget.status === "FINANCE_APPROVED");
  const pendingReports = reportRows.filter((report: ReportRow) => report.status === "SUBMITTED");

  return (
    <>
      <PageHeader
        title="Approvals"
        subtitle="Budgets and reports awaiting your decision"
      />

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Pending Finance Review", value: pendingFinance.length, color: "text-[var(--primary)]" },
          { label: "Pending Chair Approval", value: pendingChair.length, color: "text-warning" },
          { label: "Expenditure Reports", value: pendingReports.length, color: "text-[var(--muted)]" },
        ].map((item) => (
          <div key={item.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-card)] px-5 py-4">
            <p className="text-[11px] font-medium text-[var(--muted)] uppercase tracking-[0.5px] mb-2">{item.label}</p>
            <p className={`text-[24px] font-semibold ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>
              <p className="text-[14px] font-medium">Finance Review Queue</p>
              <p className="text-[12px] text-[var(--muted)]">{approvalRows.length} pending items</p>
            </CardTitle>
          </CardHeader>
          <div className="divide-y divide-[var(--border)]">
            {approvalRows.length === 0 ? (
              <div className="px-5 py-10 text-center text-[13px] text-[var(--muted)]">No pending items</div>
            ) : (
              approvalRows.map((approval: ApprovalRow) => {
                const total = approval.budget.items.reduce((sum: number, item: { totalCost: number }) => sum + item.totalCost, 0);
                return (
                  <div key={approval.id} className="px-5 py-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-9 h-9 rounded-[10px] bg-[var(--primary-light)] flex items-center justify-center text-[10px] font-semibold flex-shrink-0">KES</div>
                      <div className="flex-1">
                        <p className="text-[13px] font-medium">{approval.budget.title}</p>
                        <p className="text-[11px] text-[var(--muted)]">
                          {formatCurrency(total)} · {approval.budget.department?.name ?? "General"} · Submitted {formatRelative(approval.createdAt)}
                        </p>
                      </div>
                      <StatusBadge status={status(approval.budget.status)} />
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/budgets/${approval.budgetId}`} className="flex-1">
                        <Button variant="danger" size="sm" className="w-full">
                          <XCircle size={13} /> Review
                        </Button>
                      </Link>
                      <Link href={`/budgets/${approval.budgetId}`} className="flex-1">
                        <Button variant="ghost" size="sm" className="w-full">
                          <MessageSquare size={13} /> Comment
                        </Button>
                      </Link>
                      <Link href={`/budgets/${approval.budgetId}`} className="flex-1">
                        <Button size="sm" className="w-full">
                          <CheckCircle2 size={13} /> Open
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <p className="text-[14px] font-medium">Expenditure Reports</p>
              <p className="text-[12px] text-[var(--muted)]">{pendingReports.length} pending review</p>
            </CardTitle>
          </CardHeader>
          <div className="divide-y divide-[var(--border)]">
            {pendingReports.map((report: ReportRow) => (
              <div key={report.id} className="px-5 py-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-[10px] bg-draft-bg flex items-center justify-center text-[10px] font-semibold flex-shrink-0">REP</div>
                  <div className="flex-1">
                    <p className="text-[13px] font-medium">
                      {report.title}
                    </p>
                    <p className="text-[11px] text-[var(--muted)]">
                      {formatCurrency(report.totalClaimed)} claimed · {report.submittedAt ? formatRelative(report.submittedAt) : "Not submitted"}
                    </p>
                  </div>
                  <StatusBadge status={status(report.status)} />
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="flex-1">
                    <MessageSquare size={13} /> Request Info
                  </Button>
                  <Button size="sm" className="flex-1">Review Report</Button>
                </div>
              </div>
            ))}

            {pendingChair.length > 0 && (
              <>
                <div className="px-5 py-3 bg-[var(--bg)]">
                  <p className="text-[11px] font-medium text-[var(--muted)] uppercase tracking-[0.6px]">Chairperson Approvals</p>
                </div>
                {pendingChair.map((budget: BudgetRow) => {
                  const total = budget.items.reduce((sum: number, item: { totalCost: number }) => sum + item.totalCost, 0);
                  return (
                    <div key={budget.id} className="px-5 py-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-9 h-9 rounded-[10px] bg-[var(--primary-light)] flex items-center justify-center text-[10px] font-semibold flex-shrink-0">OK</div>
                        <div className="flex-1">
                          <p className="text-[13px] font-medium">{budget.title}</p>
                          <p className="text-[11px] text-[var(--muted)]">{formatCurrency(total)} · Finance Approved</p>
                        </div>
                        <StatusBadge status={status(budget.status)} />
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/budgets/${budget.id}`} className="flex-1">
                          <Button variant="danger" size="sm" className="w-full"><XCircle size={13} /> Review</Button>
                        </Link>
                        <Link href={`/budgets/${budget.id}`} className="flex-1">
                          <Button size="sm" className="w-full"><CheckCircle2 size={13} /> Open</Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
