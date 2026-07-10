import Link from "next/link";
import { CheckCircle2, XCircle, MessageSquare, DollarSign } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { getBudgetsByOrg, getPendingApprovals } from "@/features/budgets/repositories";
import { getExpenditureReportsByOrg } from "@/features/finance/repositories";
import { getPendingDisbursements } from "@/features/disbursements/services";
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { formatCurrency, formatRelative } from "@/lib/utils";
import { ReleaseDisbursementButton } from '@/features/disbursements/components/ReleaseDisbursementButton';
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

type DisbursementRow = {
  id: string;
  description: string;
  totalAmount: number;
  status: string;
  createdAt: Date;
  budget: { id: string; title: string; department: { name: string } | null };
  account: { id: string; name: string };
};

export default async function ApprovalsPage() {
  const session = await requireSession();
  const [approvals, budgets, expenditureReports, pendingDisbursements] = await Promise.all([
    getPendingApprovals(session.organizationId),
    getBudgetsByOrg(session.organizationId),
    getExpenditureReportsByOrg(session.organizationId),
    getPendingDisbursements(session.organizationId),
  ]);

  const budgetRows = budgets as BudgetRow[];
  const approvalRows = approvals as ApprovalRow[];
  const reportRows = expenditureReports as ReportRow[];
  const disbursementRows = pendingDisbursements as unknown as DisbursementRow[];
  const pendingFinance = budgetRows.filter((budget: BudgetRow) => budget.status === "SUBMITTED");
  const pendingChair = budgetRows.filter((budget: BudgetRow) => budget.status === "FINANCE_APPROVED");
  const pendingReports = reportRows.filter((report: ReportRow) => report.status === "SUBMITTED");

  return (
    <>
      <PageHeader
        title="Approvals"
        subtitle="Budgets and reports awaiting your decision"
      />

      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Pending Finance Review", value: pendingFinance.length, color: "text-(--primary)" },
          { label: "Pending Chair Approval", value: pendingChair.length, color: "text-warning" },
          { label: "Pending Disbursements", value: disbursementRows.length, color: "text-success" },
          { label: "Expenditure Reports", value: pendingReports.length, color: "text-(--muted)" },
        ].map((item) => (
          <div key={item.label} className="bg-(--surface) border border-(--border) rounded-(--r-card) px-5 py-4">
            <p className="text-[12px] font-medium text-(--muted) uppercase tracking-[0.5px] mb-2">{item.label}</p>
            <p className={`text-[24px] font-semibold ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                <p className="text-[14px] font-medium">Finance Review Queue</p>
                <p className="text-[13px] text-(--muted)">{approvalRows.length} pending items</p>
              </CardTitle>
            </CardHeader>
            <div className="divide-y divide-(--border)">
              {approvalRows.length === 0 ? (
                <div className="px-5 py-10 text-center text-[14px] text-(--muted)">No pending items</div>
              ) : (
                approvalRows.map((approval: ApprovalRow) => {
                  const total = approval.budget.items.reduce((sum: number, item: { totalCost: number }) => sum + item.totalCost, 0);
                  return (
                    <div key={approval.id} className="px-5 py-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-9 h-9 rounded-[10px] bg-[var(--primary-light)] flex items-center justify-center text-[11px] font-semibold shrink-0">KES</div>
                        <div className="flex-1">
                          <p className="text-[14px] font-medium">{approval.budget.title}</p>
                          <p className="text-[12px] text-(--muted)">
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
                <p className="text-[14px] font-medium">Disbursement Queue</p>
                <p className="text-[13px] text-(--muted)">{disbursementRows.length} pending</p>
              </CardTitle>
            </CardHeader>
            <div className="divide-y divide-(--border)">
              {disbursementRows.length === 0 ? (
                <div className="px-5 py-10 text-center text-[14px] text-(--muted)">No pending disbursements</div>
              ) : (
                disbursementRows.map((d: DisbursementRow) => (
                  <div key={d.id} className="px-5 py-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-9 h-9 rounded-[10px] bg-success-bg flex items-center justify-center text-[11px] font-semibold shrink-0 text-success">
                        <DollarSign size={14} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[14px] font-medium">{d.description}</p>
                        <p className="text-[12px] text-(--muted)">
                          {formatCurrency(d.totalAmount)} · {d.budget.title}
                          {d.budget.department && ` · ${d.budget.department.name}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="text-[12px] text-(--muted)">From: {d.account.name}</span>
                      <span className="ml-auto">
                        <ReleaseDisbursementButton disbursementId={d.id} />
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              <p className="text-[14px] font-medium">Expenditure Reports</p>
              <p className="text-[13px] text-(--muted)">{pendingReports.length} pending review</p>
            </CardTitle>
          </CardHeader>
          <div className="divide-y divide-(--border)">
            {pendingReports.length === 0 ? (
              <div className="px-5 py-10 text-center text-[14px] text-(--muted)">No pending reports</div>
            ) : (
              pendingReports.map((report: ReportRow) => (
                <div key={report.id} className="px-5 py-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-9 h-9 rounded-[10px] bg-draft-bg flex items-center justify-center text-[11px] font-semibold shrink-0">REP</div>
                    <div className="flex-1">
                      <p className="text-[14px] font-medium">
                        {report.title}
                      </p>
                      <p className="text-[12px] text-(--muted)">
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
              ))
            )}

            {pendingChair.length > 0 && (
              <>
                <div className="px-5 py-3 bg-(--bg)">
                  <p className="text-[12px] font-medium text-(--muted) uppercase tracking-[0.6px]">Chairperson Approvals</p>
                </div>
                {pendingChair.map((budget: BudgetRow) => {
                  const total = budget.items.reduce((sum: number, item: { totalCost: number }) => sum + item.totalCost, 0);
                  return (
                    <div key={budget.id} className="px-5 py-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-9 h-9 rounded-[10px] bg-[var(--primary-light)] flex items-center justify-center text-[11px] font-semibold shrink-0">OK</div>
                        <div className="flex-1">
                          <p className="text-[14px] font-medium">{budget.title}</p>
                          <p className="text-[12px] text-(--muted)">{formatCurrency(total)} · Finance Approved</p>
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
