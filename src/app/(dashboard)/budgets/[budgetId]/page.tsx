"use client";

import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle2, XCircle, MessageSquare,
  Send, Edit, Paperclip, Clock, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { formatCurrency, formatDate, formatRelative, pct } from "@/lib/utils";
import { mockBudgets, mockAuditLogs } from "@/lib/mock/data";

export default function BudgetDetailPage({
  params,
}: {
  params: Promise<{ budgetId: string }>;
}) {
  const { budgetId } = use(params);
  const budget = mockBudgets.find((b) => b.id === budgetId) ?? mockBudgets[0];
  const utilPct = budget.spentAmount ? pct(budget.spentAmount, budget.totalAmount) : 0;
  const remaining = budget.totalAmount - (budget.spentAmount ?? 0);

  const mockItems = [
    { id: "1", description: "Bus hire — 2 buses return", category: "Transport", quantity: 2, unitCost: 45000, totalCost: 90000 },
    { id: "2", description: "Camp site accommodation (3 nights)", category: "Accommodation", quantity: 80, unitCost: 1500, totalCost: 120000 },
    { id: "3", description: "Full board meals", category: "Catering", quantity: 80, unitCost: 1200, totalCost: 96000 },
    { id: "4", description: "Guest speaker honorarium", category: "Speaker Fees", quantity: 2, unitCost: 25000, totalCost: 50000 },
    { id: "5", description: "Sound system rental", category: "Equipment", quantity: 1, unitCost: 35000, totalCost: 35000 },
    { id: "6", description: "T-shirts & camp materials", category: "Printing & Stationery", quantity: 80, unitCost: 600, totalCost: 48000 },
    { id: "7", description: "Contingency (10%)", category: "Contingency", quantity: 1, unitCost: 41000, totalCost: 41000 },
  ];

  const totalCalc = mockItems.reduce((s, i) => s + i.totalCost, 0);

  const mockComments = [
    { id: "c1", author: "James Mwangi", role: "Finance Officer", body: "Budget looks reasonable. Please confirm if the accommodation rate includes all meals or just accommodation only.", time: new Date(Date.now() - 86400000 * 2), initials: "JM" },
    { id: "c2", author: "Sarah Kamau", role: "Dept Head", body: "Hi James — the KES 1,200 per person for meals is separate from accommodation. Accommodation is KES 1,500/person/night.", time: new Date(Date.now() - 86400000), initials: "SK" },
  ];

  const canApprove = budget.status === "submitted" || budget.status === "finance_approved";

  return (
    <div className="max-w-[1100px]">
      {/* Back */}
      <Link
        href="/budgets"
        className="inline-flex items-center gap-1.5 text-[12px] text-[var(--muted)] hover:text-[var(--text)] transition-colors mb-5"
      >
        <ArrowLeft size={13} /> Back to Budgets
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-[20px] font-semibold tracking-tight">{budget.title}</h1>
            <StatusBadge status={budget.status} />
          </div>
          <p className="text-[13px] text-[var(--muted)]">
            {budget.department?.name}
            {budget.periodStart && ` · ${formatDate(budget.periodStart)}${budget.periodEnd ? ` – ${formatDate(budget.periodEnd)}` : ""}`}
            {` · Last updated ${formatRelative(budget.updatedAt)}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(budget.status === "draft" || budget.status === "needs_changes") && (
            <Button variant="ghost" size="sm"><Edit size={13} /> Edit</Button>
          )}
          {budget.status === "draft" && (
            <Button size="sm"><Send size={13} /> Submit for Review</Button>
          )}
          {canApprove && (
            <>
              <Button variant="danger" size="sm"><XCircle size={13} /> Request Changes</Button>
              <Button size="sm"><CheckCircle2 size={13} /> Approve</Button>
            </>
          )}
        </div>
      </div>

      {/* Needs changes banner */}
      {budget.status === "needs_changes" && (
        <div className="flex items-start gap-2.5 bg-warning-bg border border-yellow-200 rounded-[var(--r-btn)] px-4 py-3 mb-5 text-[12.5px] text-warning">
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Changes requested</span> — The chairperson has requested revisions before this budget can proceed.
            See comments below for details.
          </div>
        </div>
      )}

      <div className="grid grid-cols-[1fr_320px] gap-4">
        {/* Main */}
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-card)] px-4 py-3.5">
              <p className="text-[11px] font-medium text-[var(--muted)] uppercase tracking-[0.5px] mb-2">Total Budget</p>
              <p className="text-[20px] font-semibold tracking-tight font-mono">{formatCurrency(budget.totalAmount)}</p>
            </div>
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-card)] px-4 py-3.5">
              <p className="text-[11px] font-medium text-[var(--muted)] uppercase tracking-[0.5px] mb-2">Amount Spent</p>
              <p className="text-[20px] font-semibold tracking-tight font-mono">
                {budget.spentAmount ? formatCurrency(budget.spentAmount) : "—"}
              </p>
              {budget.spentAmount && (
                <div className="mt-2">
                  <ProgressBar value={utilPct} />
                  <p className="text-[10px] text-[var(--muted)] mt-1">{utilPct}% utilised</p>
                </div>
              )}
            </div>
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-card)] px-4 py-3.5">
              <p className="text-[11px] font-medium text-[var(--muted)] uppercase tracking-[0.5px] mb-2">Remaining</p>
              <p className={`text-[20px] font-semibold tracking-tight font-mono ${remaining >= 0 ? "text-success" : "text-danger"}`}>
                {budget.spentAmount ? `${remaining >= 0 ? "+" : ""}${formatCurrency(remaining)}` : "—"}
              </p>
            </div>
          </div>

          {/* Budget line items */}
          <Card>
            <CardHeader>
              <CardTitle>
                <p className="text-[14px] font-medium">Budget Line Items</p>
                <p className="text-[12px] text-[var(--muted)]">{mockItems.length} items</p>
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
                {mockItems.map((item) => (
                  <tr key={item.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg)] transition-colors">
                    <td className="px-4 py-3 text-[13px] font-medium">{item.description}</td>
                    <td className="px-4 py-3 text-[12px] text-[var(--muted)]">{item.category}</td>
                    <td className="px-4 py-3 text-[13px] font-mono text-[var(--muted)]">{item.quantity}</td>
                    <td className="px-4 py-3 text-[13px] font-mono text-[var(--muted)]">{formatCurrency(item.unitCost)}</td>
                    <td className="px-4 py-3 text-[13px] font-mono font-medium text-right">{formatCurrency(item.totalCost)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[var(--border)] bg-[var(--bg)]">
                  <td colSpan={4} className="px-4 py-3 text-[13px] font-semibold">Total</td>
                  <td className="px-4 py-3 text-[14px] font-mono font-semibold text-right">{formatCurrency(totalCalc)}</td>
                </tr>
              </tfoot>
            </table>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle>
                <p className="text-[14px] font-medium">Comments</p>
                <p className="text-[12px] text-[var(--muted)]">{mockComments.length} comments</p>
              </CardTitle>
            </CardHeader>
            <CardBody className="space-y-4">
              {mockComments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-[11px] font-semibold text-[var(--primary)] flex-shrink-0 mt-0.5">
                    {c.initials}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[13px] font-medium">{c.author}</span>
                      <span className="text-[11px] text-[var(--muted)]">{c.role}</span>
                      <span className="text-[11px] text-[var(--muted)] ml-auto">{formatRelative(c.time)}</span>
                    </div>
                    <p className="text-[13px] text-[var(--text)] leading-relaxed bg-[var(--bg)] border border-[var(--border)] rounded-[10px] px-3.5 py-2.5">
                      {c.body}
                    </p>
                  </div>
                </div>
              ))}

              {/* Comment input */}
              <div className="flex gap-3 pt-2">
                <div className="w-7 h-7 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-[11px] font-semibold text-[var(--primary)] flex-shrink-0 mt-0.5">
                  JM
                </div>
                <div className="flex-1">
                  <textarea
                    placeholder="Add a comment…"
                    rows={3}
                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-[10px] px-3.5 py-2.5 text-[13px] text-[var(--text)] placeholder:text-[var(--muted)] outline-none focus:border-[var(--primary)] transition-colors resize-none"
                  />
                  <div className="flex justify-end mt-2">
                    <Button size="sm"><MessageSquare size={12} /> Post Comment</Button>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Approval status */}
          <Card>
            <CardHeader>
              <CardTitle><p className="text-[14px] font-medium">Approval Workflow</p></CardTitle>
            </CardHeader>
            <CardBody className="space-y-4">
              {[
                { step: "Submitted", done: budget.status !== "draft", active: budget.status === "submitted" },
                { step: "Finance Review", done: ["finance_approved", "chair_approved"].includes(budget.status), active: budget.status === "submitted" },
                { step: "Chairperson Approval", done: budget.status === "chair_approved", active: budget.status === "finance_approved" },
              ].map((s, i) => (
                <div key={s.step} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-semibold ${
                    s.done ? "bg-success text-white" : s.active ? "bg-[var(--primary)] text-white" : "bg-[var(--border)] text-[var(--muted)]"
                  }`}>
                    {s.done ? "✓" : i + 1}
                  </div>
                  <div>
                    <p className={`text-[13px] ${s.done || s.active ? "font-medium" : "text-[var(--muted)]"}`}>{s.step}</p>
                    {s.active && <p className="text-[11px] text-[var(--primary)]">In progress</p>}
                    {s.done && <p className="text-[11px] text-success">Completed</p>}
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle><p className="text-[14px] font-medium">Details</p></CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              {[
                { label: "Department", value: budget.department?.name ?? "—" },
                { label: "Period", value: budget.periodStart ? `${formatDate(budget.periodStart)}${budget.periodEnd ? ` – ${formatDate(budget.periodEnd)}` : ""}` : "—" },
                { label: "Created", value: formatDate(budget.createdAt) },
                { label: "Last Updated", value: formatRelative(budget.updatedAt) },
              ].map((d) => (
                <div key={d.label} className="flex justify-between gap-4">
                  <span className="text-[12px] text-[var(--muted)]">{d.label}</span>
                  <span className="text-[12px] font-medium text-right">{d.value}</span>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Attachments */}
          <Card>
            <CardHeader>
              <CardTitle><p className="text-[14px] font-medium">Attachments</p></CardTitle>
              <Button variant="ghost" size="sm"><Paperclip size={12} /> Attach</Button>
            </CardHeader>
            <CardBody>
              <div className="space-y-2">
                {[
                  { name: "budget-justification.pdf", size: "124 KB", date: "2 days ago" },
                  { name: "venue-quote.pdf", size: "88 KB", date: "3 days ago" },
                ].map((f) => (
                  <div key={f.name} className="flex items-center gap-2.5 p-2.5 rounded-[8px] border border-[var(--border)] hover:bg-[var(--bg)] cursor-pointer transition-colors">
                    <div className="w-7 h-7 bg-danger-bg rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-[9px] font-bold text-danger">PDF</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium truncate">{f.name}</p>
                      <p className="text-[10px] text-[var(--muted)]">{f.size} · {f.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Activity */}
          <Card>
            <CardHeader>
              <CardTitle><p className="text-[14px] font-medium">Activity</p></CardTitle>
            </CardHeader>
            <CardBody className="pt-2">
              {mockAuditLogs.slice(0, 3).map((log, i) => (
                <div key={log.id} className="flex gap-3 pb-3 relative">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`w-2 h-2 rounded-full mt-1 z-10 ${i === 0 ? "bg-[var(--primary)]" : "bg-[var(--border)]"}`} />
                    {i < 2 && <div className="w-px flex-1 bg-[var(--border)] mt-1" />}
                  </div>
                  <div className="flex-1 min-w-0 pb-1">
                    <p className="text-[12px] leading-snug">
                      <span className="font-medium">{log.actor?.name}</span>{" "}
                      {log.action}
                    </p>
                    <p className="text-[11px] text-[var(--muted)] mt-0.5">{formatRelative(log.createdAt)}</p>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
