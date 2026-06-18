import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Paperclip } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { getBudgetById } from "@/features/budgets/repositories";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { formatCurrency, formatDate, formatRelative, pct } from "@/lib/utils";
import { BudgetActions } from "@/features/budgets/components/budget-actions";
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
  const budget = await getBudgetById(budgetId, session.organizationId);
  if (!budget) notFound();

  const items = budget.items as BudgetItemRow[];
  const approvals = budget.approvals as ApprovalRow[];
  const attachments = budget.attachments as AttachmentRow[];
  const disbursements = budget.disbursements as DisbursementRow[];
  const expenditures = budget.expenditures as ExpenditureRow[];
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
    <div className="max-w-[1100px]">
      <Link href="/budgets" className="inline-flex items-center gap-1.5 text-[12px] text-[var(--muted)] hover:text-[var(--text)] transition-colors mb-5">
        <ArrowLeft size={13} /> Back to Budgets
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-[20px] font-semibold tracking-tight">{budget.title}</h1>
            <StatusBadge status={status as BudgetStatus} />
          </div>
          <p className="text-[13px] text-[var(--muted)]">
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
        />
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-4">
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-card)] px-4 py-3.5">
              <p className="text-[11px] font-medium text-[var(--muted)] uppercase tracking-[0.5px] mb-2">Total Budget</p>
              <p className="text-[20px] font-semibold tracking-tight font-mono">{formatCurrency(totalAmount)}</p>
            </div>
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-card)] px-4 py-3.5">
              <p className="text-[11px] font-medium text-[var(--muted)] uppercase tracking-[0.5px] mb-2">Line Items</p>
              <p className="text-[20px] font-semibold tracking-tight">{items.length}</p>
            </div>
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-card)] px-4 py-3.5">
              <p className="text-[11px] font-medium text-[var(--muted)] uppercase tracking-[0.5px] mb-2">Disbursed</p>
              <p className="text-[20px] font-semibold tracking-tight font-mono">{formatCurrency(totalDisbursed)}</p>
            </div>
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-card)] px-4 py-3.5">
              <p className="text-[11px] font-medium text-[var(--muted)] uppercase tracking-[0.5px] mb-2">Claimed</p>
              <p className="text-[20px] font-semibold tracking-tight font-mono">{formatCurrency(totalClaimed)}</p>
            </div>
          </div>

          {/* Line items */}
          <Card>
            <CardHeader>
              <CardTitle>
                <p className="text-[14px] font-medium">Budget Line Items</p>
                <p className="text-[12px] text-[var(--muted)]">{items.length} items</p>
              </CardTitle>
            </CardHeader>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg)]">
                  {["Description", "Category", "Qty", "Unit Cost", "Total"].map((h) => (
                    <th key={h} className="text-left text-[11px] font-medium text-[var(--muted)] uppercase tracking-[0.5px] px-4 py-2.5 last:text-right">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item: BudgetItemRow) => (
                  <tr key={item.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg)] transition-colors">
                    <td className="px-4 py-3 text-[13px] font-medium">{item.description}</td>
                    <td className="px-4 py-3 text-[12px] text-[var(--muted)]">{item.category?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-[13px] font-mono text-[var(--muted)]">{item.quantity}</td>
                    <td className="px-4 py-3 text-[13px] font-mono text-[var(--muted)]">{formatCurrency(item.unitCost)}</td>
                    <td className="px-4 py-3 text-[13px] font-mono font-medium text-right">{formatCurrency(item.totalCost)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[var(--border)] bg-[var(--bg)]">
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
              />
            );
          })()}

          <Card>
            <CardHeader>
              <CardTitle>
                <p className="text-[14px] font-medium">Disbursements</p>
                <p className="text-[12px] text-[var(--muted)]">{disbursements.length} records</p>
              </CardTitle>
            </CardHeader>
            <CardBody className="p-0 divide-y divide-[var(--border)]">
              {disbursements.length === 0 ? (
                <div className="px-4 py-8 text-center text-[13px] text-[var(--muted)]">No disbursements recorded</div>
              ) : (
                disbursements.map((disbursement: DisbursementRow) => (
                  <div key={disbursement.id} className="flex items-center justify-between gap-4 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium truncate">{disbursement.description}</p>
                      <p className="text-[11px] text-[var(--muted)]">{formatRelative(disbursement.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[13px] font-medium">{formatCurrency(disbursement.totalAmount)}</span>
                      <span className="text-[10px] font-medium bg-[var(--primary-light)] text-[var(--primary)] px-1.5 py-0.5 rounded capitalize">
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
                <p className="text-[12px] text-[var(--muted)]">{expenditures.length} reports</p>
              </CardTitle>
            </CardHeader>
            <CardBody className="p-0 divide-y divide-[var(--border)]">
              {expenditures.length === 0 ? (
                <div className="px-4 py-8 text-center text-[13px] text-[var(--muted)]">No expenditure reports submitted</div>
              ) : (
                expenditures.map((report: ExpenditureRow) => (
                  <div key={report.id} className="flex items-center justify-between gap-4 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium truncate">{report.title}</p>
                      <p className="text-[11px] text-[var(--muted)]">
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
                <p className="text-[12px] text-[var(--muted)]">{attachments.length} files</p>
              </CardTitle>
            </CardHeader>
            <CardBody className="p-0 divide-y divide-[var(--border)]">
              {attachments.length === 0 ? (
                <div className="px-4 py-8 text-center text-[13px] text-[var(--muted)]">No attachments uploaded</div>
              ) : (
                attachments.map((attachment: AttachmentRow) => (
                  <div key={attachment.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary)]">
                      <Paperclip size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium truncate">{attachment.fileName}</p>
                      <p className="text-[11px] text-[var(--muted)]">{attachment.mimeType} · {Math.ceil(attachment.size / 1024)} KB</p>
                    </div>
                    <span className="text-[11px] text-[var(--muted)]">{formatRelative(attachment.createdAt)}</span>
                  </div>
                ))
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
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
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-semibold ${
                    s.done ? "bg-success text-white" : s.active ? "bg-[var(--primary)] text-white" : "bg-[var(--border)] text-[var(--muted)]"
                  }`}>{s.done ? "✓" : i + 1}</div>
                  <div>
                    <p className={`text-[13px] ${s.done || s.active ? "font-medium" : "text-[var(--muted)]"}`}>{s.step}</p>
                    {s.active && <p className="text-[11px] text-[var(--primary)]">In progress</p>}
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
                  <span className="text-[12px] text-[var(--muted)]">{d.label}</span>
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
