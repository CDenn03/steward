"use client";
import { CheckCircle2, XCircle, MessageSquare, Clock } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { formatCurrency, formatRelative } from "@/lib/utils";
import { mockBudgets, mockExpenditureReports } from "@/lib/mock/data";

export default function ApprovalsPage() {
  const pendingFinance = mockBudgets.filter(
    (b) => b.status === "submitted"
  );
  const pendingChair = mockBudgets.filter(
    (b) => b.status === "finance_approved"
  );

  return (
    <>
      <PageHeader
        title="Approvals"
        subtitle="Budgets and reports awaiting your decision"
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Pending Finance Review", value: pendingFinance.length, color: "text-[var(--primary)]" },
          { label: "Pending Chair Approval", value: pendingChair.length, color: "text-warning" },
          { label: "Expenditure Reports", value: mockExpenditureReports.length, color: "text-[var(--muted)]" },
        ].map((s) => (
          <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-card)] px-5 py-4">
            <p className="text-[11px] font-medium text-[var(--muted)] uppercase tracking-[0.5px] mb-2">{s.label}</p>
            <p className={`text-[24px] font-semibold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Finance Review Queue */}
        <Card>
          <CardHeader>
            <CardTitle>
              <p className="text-[14px] font-medium">Finance Review Queue</p>
              <p className="text-[12px] text-[var(--muted)]">{pendingFinance.length} pending items</p>
            </CardTitle>
          </CardHeader>
          <div className="divide-y divide-[var(--border)]">
            {pendingFinance.length === 0 ? (
              <div className="px-5 py-10 text-center text-[13px] text-[var(--muted)]">No pending items</div>
            ) : (
              pendingFinance.map((b) => (
                <div key={b.id} className="px-5 py-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-9 h-9 rounded-[10px] bg-[var(--primary-light)] flex items-center justify-center text-base flex-shrink-0">💰</div>
                    <div className="flex-1">
                      <p className="text-[13px] font-medium">{b.title}</p>
                      <p className="text-[11px] text-[var(--muted)]">
                        {formatCurrency(b.totalAmount)} · {b.department?.name} · Submitted {formatRelative(b.updatedAt)}
                      </p>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="danger" size="sm" className="flex-1">
                      <XCircle size={13} /> Decline
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1">
                      <MessageSquare size={13} /> Comment
                    </Button>
                    <Button size="sm" className="flex-1">
                      <CheckCircle2 size={13} /> Approve
                    </Button>
                  </div>
                </div>
              ))
            )}
            {/* Static extras for demo */}
            <div className="px-5 py-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-[10px] bg-warning-bg flex items-center justify-center text-base flex-shrink-0">📋</div>
                <div className="flex-1">
                  <p className="text-[13px] font-medium">Camp Transport Disbursement</p>
                  <p className="text-[11px] text-[var(--muted)]">KES 95,000 · Youth Department · 4h ago</p>
                </div>
                <span className="text-[10px] font-medium bg-warning-bg text-warning px-1.5 py-0.5 rounded">Disbursement</span>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="flex-1">
                  <Clock size={13} /> Hold
                </Button>
                <Button size="sm" className="flex-1">
                  <CheckCircle2 size={13} /> Release Funds
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Expenditure Reports */}
        <Card>
          <CardHeader>
            <CardTitle>
              <p className="text-[14px] font-medium">Expenditure Reports</p>
              <p className="text-[12px] text-[var(--muted)]">{mockExpenditureReports.length} pending review</p>
            </CardTitle>
          </CardHeader>
          <div className="divide-y divide-[var(--border)]">
            {mockExpenditureReports.map((rep) => (
              <div key={rep.id} className="px-5 py-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-[10px] bg-draft-bg flex items-center justify-center text-base flex-shrink-0">📋</div>
                  <div className="flex-1">
                    <p className="text-[13px] font-medium">
                      {rep.department?.name} Report
                    </p>
                    <p className="text-[11px] text-[var(--muted)]">
                      {formatCurrency(rep.totalClaimed)} claimed · {rep.submittedAt ? formatRelative(rep.submittedAt) : ""}
                    </p>
                  </div>
                  <StatusBadge status="submitted" />
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="flex-1">
                    <MessageSquare size={13} /> Request Info
                  </Button>
                  <Button size="sm" className="flex-1">Review Report</Button>
                </div>
              </div>
            ))}

            {/* Chair approval section */}
            {pendingChair.length > 0 && (
              <>
                <div className="px-5 py-3 bg-[var(--bg)]">
                  <p className="text-[11px] font-medium text-[var(--muted)] uppercase tracking-[0.6px]">Chairperson Approvals</p>
                </div>
                {pendingChair.map((b) => (
                  <div key={b.id} className="px-5 py-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-9 h-9 rounded-[10px] bg-[var(--primary-light)] flex items-center justify-center text-base flex-shrink-0">✅</div>
                      <div className="flex-1">
                        <p className="text-[13px] font-medium">{b.title}</p>
                        <p className="text-[11px] text-[var(--muted)]">{formatCurrency(b.totalAmount)} · Finance Approved</p>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="danger" size="sm" className="flex-1"><XCircle size={13} /> Reject</Button>
                      <Button size="sm" className="flex-1"><CheckCircle2 size={13} /> Final Approve</Button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
