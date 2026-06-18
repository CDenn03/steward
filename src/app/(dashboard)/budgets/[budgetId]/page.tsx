import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { getBudgetById } from "@/features/budgets/repositories";
import { getAccountsForDisbursement } from "@/features/disbursements/services";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { formatCurrency, formatDate, formatRelative, pct } from "@/lib/utils";
import { BudgetActions } from "@/features/budgets/components/budget-actions";
import { BudgetAttachmentUpload } from "@/features/budgets/components/budget-attachment-upload";
import { BudgetRevisionHistory } from "@/features/budgets/components/budget-revision-history";
import { DisbursementRequestButton } from "@/features/disbursements/components/disbursement-request-button";
import type { BudgetStatus } from "@/types";

type BudgetItemRow = {
  id: string;
  description: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  category: { name: string } | null;
};

type ApprovalCommentRow = {
  id: string;
  authorId: string;
  body: string;
  createdAt: Date;
  approvalId: string;
};

type ApprovalRow = {
  id: string;
  status: string;
  comments: ApprovalCommentRow[];
};

type AttachmentRow = {
  id: string;
  fileName: string;
  mimeType: string;
  size: number;
  createdAt: Date;
};

type DisbursementRow = {
  id: string;
  description: string;
  totalAmount: number;
  status: string;
  createdAt: Date;
};

type RevisionRow = {
  id: string;
  reason: string;
  snapshot: Record<string, unknown>;
  createdAt: Date;
};

type ExpenditureRow = {
  id: string;
  title: string;
  status: string;
  totalClaimed: number;
  totalApproved: number | null;
  submittedAt: Date | null;
  receipts: Array<{ id: string }>;
};

export default async function BudgetDetailPage({
  params,
}: {
  params: Promise<{ budgetId: string }>;
}) {
  const { budgetId } = await params;
  const session = await requireSession();
  const [budget, accounts] = await Promise.all([
    getBudgetById(budgetId, session.organizationId),
    getAccountsForDisbursement(session.organizationId),
  ]);
  if (!budget) notFound();

  const items = budget.items as BudgetItemRow[];
  const approvals = budget.approvals as ApprovalRow[];
  const attachments = budget.attachments as AttachmentRow[];
  const disbursements = budget.disbursements as DisbursementRow[];
  const expenditures = budget.expenditures as ExpenditureRow[];
  const revisions = budget.revisions as RevisionRow[];
  const totalAmount = items.reduce((sum: number, item: BudgetItemRow) => sum + item.totalCost, 0);
  const totalDisbursed = disbursements.reduce((sum: number, item: DisbursementRow) => sum + item.totalAmount, 0);
  const totalClaimed = expenditures.reduce((sum: number, report: ExpenditureRow) => sum + report.totalClaimed, 0);
  const status = budget.status.toLowerCase();

  // Determine what approval type the current reviewer would do
  const approvalType =
    session.role === "finance" || session.role === "admin"
      ? "finance"
      : "chairperson";

  const canApprove =
    (status === "submitted" && approvalType === "finance") ||
    (status === "finance_approved" && approvalType === "chairperson");

  const canSubmit = status === "draft" || status === "needs_changes";

  return (
    <div>
      <Link href="/budgets" className="inline-flex items-center gap-1.5 text-[12px] text-(--muted) hover:text-(--text) transition-colors mb-5">
        <ArrowLeft size={13} /> Back to Budgets
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-[20px] font-semibold tracking-tight">{budget.title}</h1>
            <StatusBadge status={status as BudgetStatus} />
          </div>
          <p className="text-[13px] text-(--muted)">
            {budget.department?.name}
            {budget.periodStart && ` · ${formatDate(budget.periodStart)}${budget.periodEnd ? ` – ${formatDate(budget.periodEnd)}` : ""}`}
            {` · Last updated ${formatRelative(budget.updatedAt)}`}
          </p>
        </div>
        <BudgetActions
          budgetId={budget.id}
          status={status}
          canApprove={canApprove}
          canSubmit={canSubmit}
          approvalType={approvalType}
          currentUserId={session.user.id}
        />
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-4">
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-(--surface) border border-(--border) rounded-(--r-card) px-4 py-3.5">
              <p className="text-[11px] font-medium text-(--muted) uppercase tracking-[0.5px] mb-2">Total Budget</p>
              <p className="text-[20px] font-semibold tracking-tight font-mono">{formatCurrency(totalAmount)}</p>
            </div>
            <div className="bg-(--surface) border border-(--border) rounded-(--r-card) px-4 py-3.5">
              <p className="text-[11px] font-medium text-(--muted) uppercase tracking-[0.5px] mb-2">Line Items</p>
              <p className="text-[20px] font-semibold tracking-tight">{items.length}</p>
            </div>
            <div className="bg-(--surface) border border-(--border) rounded-(--r-card) px-4 py-3.5">
              <p className="text-[11px] font-medium text-(--muted) uppercase tracking-[0.5px] mb-2">Disbursed</p>
              <p className="text-[20px] font-semibold tracking-tight font-mono">{formatCurrency(totalDisbursed)}</p>
            </div>
            <div className="bg-(--surface) border border-(--border) rounded-(--r-card) px-4 py-3.5">
              <p className="text-[11px] font-medium text-(--muted) uppercase tracking-[0.5px] mb-2">Claimed</p>
              <p className="text-[20px] font-semibold tracking-tight font-mono">{formatCurrency(totalClaimed)}</p>
            </div>
          </div>

          {/* Line items */}
          <Card>
            <CardHeader>
              <CardTitle>
                <p className="text-[14px] font-medium">Budget Line Items</p>
                <p className="text-[12px] text-(--muted)">{items.length} items</p>
              </CardTitle>
            </CardHeader>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-(--border) bg-(--bg)">
                  {["Description", "Category", "Qty", "Unit Cost", "Total"].map((h) => (
                    <th key={h} className="text-left text-[11px] font-medium text-(--muted) uppercase tracking-[0.5px] px-4 py-2.5 last:text-right">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item: BudgetItemRow) => (
                  <tr key={item.id} className="border-b border-(--border) last:border-0 hover:bg-(--bg) transition-colors">
                    <td className="px-4 py-3 text-[13px] font-medium">{item.description}</td>
                    <td className="px-4 py-3 text-[12px] text-(--muted)">{item.category?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-[13px] font-mono text-(--muted)">{item.quantity}</td>
                    <td className="px-4 py-3 text-[13px] font-mono text-(--muted)">{formatCurrency(item.unitCost)}</td>
                    <td className="px-4 py-3 text-[13px] font-mono font-medium text-right">{formatCurrency(item.totalCost)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-(--border) bg-(--bg)">
                  <td colSpan={4} className="px-4 py-3 text-[13px] font-semibold">Total</td>
                  <td className="px-4 py-3 text-[14px] font-mono font-semibold text-right">{formatCurrency(totalAmount)}</td>
                </tr>
              </tfoot>
            </table>
          </Card>

          {/* Comments — client component handles post */}
          {(() => {
            const activeApproval = approvals.find((approval: ApprovalRow) => approval.status === "PENDING");
            const allComments = approvals.flatMap((approval: ApprovalRow) =>
              approval.comments.map((comment: ApprovalCommentRow) => ({
                id: comment.id,
                authorId: comment.authorId,
                body: comment.body,
                createdAt: comment.createdAt,
                approvalId: comment.approvalId,
              }))
            );
            return (
              <BudgetActions
                budgetId={budget.id}
                status={status}
                canApprove={false}
                canSubmit={false}
                approvalType={approvalType}
                commentsMode
                comments={allComments}
                approvalId={activeApproval?.id}
                currentUserInitials={session.user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                currentUserId={session.user.id}
              />
            );
          })()}

          <Card>
            <CardHeader>
              <CardTitle>
                <p className="text-[14px] font-medium">Disbursements</p>
                <p className="text-[12px] text-(--muted)">{disbursements.length} records</p>
              </CardTitle>
              {(status === "chair_approved" || status === "finance_approved") && (
                <DisbursementRequestButton budgetId={budget.id} accounts={accounts} />
              )}
            </CardHeader>
            <CardBody className="p-0 divide-y divide-(--border)">
              {disbursements.length === 0 ? (
                <div className="px-4 py-8 text-center text-[13px] text-(--muted)">No disbursements recorded</div>
              ) : (
                disbursements.map((disbursement: DisbursementRow) => (
                  <div key={disbursement.id} className="flex items-center justify-between gap-4 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium truncate">{disbursement.description}</p>
                      <p className="text-[11px] text-(--muted)">{formatRelative(disbursement.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[13px] font-medium">{formatCurrency(disbursement.totalAmount)}</span>
                      <span className="text-[10px] font-medium bg-[var(--primary-light)] text-(--primary) px-1.5 py-0.5 rounded capitalize">
                        {disbursement.status.toLowerCase()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <p className="text-[14px] font-medium">Expenditure Reports</p>
                <p className="text-[12px] text-(--muted)">{expenditures.length} reports</p>
              </CardTitle>
            </CardHeader>
            <CardBody className="p-0 divide-y divide-(--border)">
              {expenditures.length === 0 ? (
                <div className="px-4 py-8 text-center text-[13px] text-(--muted)">No expenditure reports submitted</div>
              ) : (
                expenditures.map((report: ExpenditureRow) => (
                  <div key={report.id} className="flex items-center justify-between gap-4 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium truncate">{report.title}</p>
                      <p className="text-[11px] text-(--muted)">
                        {report.receipts.length} receipt{report.receipts.length === 1 ? "" : "s"}
                        {report.submittedAt ? ` · Submitted ${formatRelative(report.submittedAt)}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[13px] font-medium">{formatCurrency(report.totalApproved ?? report.totalClaimed)}</span>
                      <StatusBadge status={report.status.toLowerCase() as BudgetStatus} />
                    </div>
                  </div>
                ))
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <p className="text-[14px] font-medium">Attachments</p>
                <p className="text-[12px] text-(--muted)">{attachments.length} files</p>
              </CardTitle>
            </CardHeader>
            <CardBody className="p-0">
              <BudgetAttachmentUpload budgetId={budget.id} attachments={attachments} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <p className="text-[14px] font-medium">Revision History</p>
                <p className="text-[12px] text-(--muted)">{revisions.length} revisions</p>
              </CardTitle>
            </CardHeader>
            <CardBody className="p-0">
              <BudgetRevisionHistory revisions={revisions} />
            </CardBody>
          </Card>
        </div>

        <div className="space-y-4 lg:sticky lg:top-[calc(3.5rem+1rem)] lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle><p className="text-[14px] font-medium">Approval Workflow</p></CardTitle>
            </CardHeader>
            <CardBody className="space-y-4">
              {[
                { step: "Submitted",            done: status !== "draft" },
                { step: "Finance Review",        done: ["finance_approved","chair_approved","rejected"].includes(status), active: status === "submitted" },
                { step: "Chairperson Approval", done: status === "chair_approved", active: status === "finance_approved" },
              ].map((s, i) => (
                <div key={s.step} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-semibold ${
                    s.done ? "bg-success text-white" : s.active ? "bg-(--primary) text-white" : "bg-(--border) text-(--muted)"
                  }`}>{s.done ? "✓" : i + 1}</div>
                  <div>
                    <p className={`text-[13px] ${s.done || s.active ? "font-medium" : "text-(--muted)"}`}>{s.step}</p>
                    {s.active && <p className="text-[11px] text-(--primary)">In progress</p>}
                    {s.done && <p className="text-[11px] text-success">Completed</p>}
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle><p className="text-[14px] font-medium">Details</p></CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              {[
                { label: "Department", value: budget.department?.name ?? "—" },
                { label: "Period",     value: budget.periodStart ? `${formatDate(budget.periodStart)}${budget.periodEnd ? ` – ${formatDate(budget.periodEnd)}` : ""}` : "—" },
                { label: "Created",    value: formatDate(budget.createdAt) },
                { label: "Updated",    value: formatRelative(budget.updatedAt) },
              ].map((d) => (
                <div key={d.label} className="flex justify-between gap-4">
                  <span className="text-[12px] text-(--muted)">{d.label}</span>
                  <span className="text-[12px] font-medium text-right">{d.value}</span>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
