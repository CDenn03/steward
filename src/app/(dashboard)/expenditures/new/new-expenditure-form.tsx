"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  Check,
  FileText,
  Loader2,
  Send,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { formatCurrency, cn } from "@/lib/utils";
import {
  createExpenditureReportAction,
  getUploadUrlAction,
  saveReceiptAction,
  allocateReceiptAction,
  submitExpenditureReportAction,
} from "@/features/expenditure/actions";

type BudgetOption = {
  id: string;
  title: string;
  department: string;
  items: Array<{
    id: string;
    description: string;
    totalCost: number;
    category: string | null;
  }>;
};

type ReceiptFile = {
  id: string;
  file: File;
  storageKey: string;
  uploadUrl: string;
  preview: string;
  amount: number;
  vendor: string;
  receiptDate: string;
  uploaded: boolean;
  receiptId?: string;
};

type Allocation = {
  receiptId: string;
  budgetItemId: string;
  amount: number;
};

const steps = ["Select Budget", "Upload Receipts", "Allocate", "Review & Submit"];

const receiptDateStr = (d: Date) => d.toISOString().split("T")[0]!;

export function NewExpenditureForm({
  budgets,
}: {
  budgets: BudgetOption[];
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [selectedBudgetId, setSelectedBudgetId] = useState("");
  const [reportId, setReportId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");

  const [receipts, setReceipts] = useState<ReceiptFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const [allocations, setAllocations] = useState<Allocation[]>([]);

  const selectedBudget = budgets.find((b) => b.id === selectedBudgetId);

  const canNext = () => {
    if (step === 0) return !!selectedBudgetId && !!title.trim();
    if (step === 1) return receipts.length > 0 && receipts.every((r) => r.uploaded);
    if (step === 2) {
      if (allocations.length === 0) return false;
      const receiptIds = receipts.map((r) => r.receiptId).filter(Boolean);
      for (const rId of receiptIds) {
        const rAllocs = allocations.filter((a) => a.receiptId === rId);
        const receipt = receipts.find((r) => r.receiptId === rId);
        if (!receipt) return false;
        const totalAlloc = rAllocs.reduce((s, a) => s + a.amount, 0);
        if (Math.abs(totalAlloc - receipt.amount) > 0.01) return false;
      }
      return true;
    }
    return true;
  };

  const handleCreateReport = async () => {
    setFormError("");
    setSaving(true);
    const res = await createExpenditureReportAction({
      budgetId: selectedBudgetId,
      title: title.trim(),
      notes: notes.trim() || undefined,
    }) as { data?: { id: string }; error?: { message: string } };
    if (res.error) {
      setSaving(false);
      setFormError(res.error.message ?? "Unable to create report");
      return;
    }
    setReportId(res.data!.id);
    setSaving(false);
    setStep(1);
  };

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length === 0 || !reportId) return;

      setUploading(true);
      const newReceipts: ReceiptFile[] = [];

      for (const file of files) {
        const res = await getUploadUrlAction(file.name, file.type) as { data?: { storageKey: string; uploadUrl: string }; error?: unknown };
        if (res.error) continue;

        const { storageKey, uploadUrl } = res.data!;

        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });

        if (!uploadRes.ok) continue;

        const saveRes = await saveReceiptAction({
          expenditureReportId: reportId,
          storageKey,
          fileName: file.name,
          mimeType: file.type,
          size: file.size,
          amount: 0,
          receiptDate: receiptDateStr(new Date()),
        }) as { data?: { id: string }; error?: unknown };

        if (saveRes.error) continue;

        newReceipts.push({
          id: Math.random().toString(36).slice(2),
          file,
          storageKey,
          uploadUrl,
          preview: URL.createObjectURL(file),
          amount: 0,
          vendor: "",
          receiptDate: receiptDateStr(new Date()),
          uploaded: true,
          receiptId: saveRes.data!.id,
        });
      }

      setReceipts((prev) => [...prev, ...newReceipts]);
      setUploading(false);
    },
    [reportId]
  );

  const updateReceipt = (id: string, field: keyof ReceiptFile, value: string | number) => {
    setReceipts((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const removeReceipt = (id: string) => {
    setReceipts((prev) => prev.filter((r) => r.id !== id));
  };

  const updateAllocation = (receiptId: string, budgetItemId: string, amount: number) => {
    setAllocations((prev) => {
      const existing = prev.findIndex(
        (a) => a.receiptId === receiptId && a.budgetItemId === budgetItemId
      );
      if (existing >= 0) {
        const next = [...prev];
        if (amount <= 0) {
          next.splice(existing, 1);
        } else {
          next[existing] = { ...next[existing]!, amount };
        }
        return next;
      }
      if (amount <= 0) return prev;
      return [...prev, { receiptId, budgetItemId, amount }];
    });
  };

  const getAllocationFor = (receiptId: string, budgetItemId: string) => {
    return allocations.find(
      (a) => a.receiptId === receiptId && a.budgetItemId === budgetItemId
    );
  };

  const getReceiptTotalAllocated = (receiptId: string) => {
    return allocations
      .filter((a) => a.receiptId === receiptId)
      .reduce((s, a) => s + a.amount, 0);
  };

  const handleSubmit = async () => {
    if (!reportId) return;
    setFormError("");
    setSaving(true);

    for (const receipt of receipts.filter((r) => r.receiptId && r.amount > 0)) {
      const rAllocs = allocations.filter((a) => a.receiptId === receipt.receiptId);
      const allocRes = await allocateReceiptAction({
        allocations: rAllocs.length > 0
          ? rAllocs.map((a) => ({
              receiptId: a.receiptId,
              budgetItemId: a.budgetItemId,
              amount: a.amount,
            }))
          : [{ receiptId: receipt.receiptId!, budgetItemId: selectedBudget!.items[0]!.id, amount: receipt.amount }],
      }) as { error?: { message: string } };
      if (allocRes.error) {
        setSaving(false);
        setFormError(allocRes.error.message ?? "Failed to allocate receipt");
        return;
      }
    }

    const res = await submitExpenditureReportAction({
      expenditureReportId: reportId,
    }) as { error?: { message: string } | string };
    if (res.error) {
      setSaving(false);
      setFormError(typeof res.error === "string" ? res.error : res.error.message ?? "Failed to submit");
      return;
    }

    setSaving(false);
    router.push(`/expenditures`);
    router.refresh();
  };

  return (
    <div className="max-w-[900px]">
      <Link
        href="/expenditures"
        className="inline-flex items-center gap-1.5 text-[12px] text-(--muted) hover:text-[var(--text)] transition-colors mb-5"
      >
        <ArrowLeft size={13} /> Back to Expenditures
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[20px] font-semibold tracking-tight">
            New Expenditure Report
          </h1>
          <p className="text-[13px] text-(--muted) mt-0.5">
            Select a budget, upload receipts, and allocate costs
          </p>
        </div>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-0 mb-6 bg-(--surface) border border-(--border) rounded-(--r-card) p-2">
        {steps.map((s, i) => (
          <div key={s} className="flex-1 flex items-center gap-2 text-[12px]">
            <div
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0",
                i < step
                  ? "bg-success text-white"
                  : i === step
                    ? "bg-(--primary) text-white"
                    : "bg-(--border) text-(--muted)"
              )}
            >
              {i < step ? <Check size={12} /> : i + 1}
            </div>
            <span
              className={cn(
                "hidden sm:inline",
                i === step ? "font-medium text-[var(--text)]" : "text-(--muted)"
              )}
            >
              {s}
            </span>
            {i < steps.length - 1 && (
              <div className="flex-1 h-px bg-(--border) mx-2" />
            )}
          </div>
        ))}
      </div>

      {formError && (
        <div className="mb-4 rounded-(--r-card) border border-red-200 bg-danger-bg px-4 py-3 text-[13px] text-danger">
          {formError}
        </div>
      )}

      {/* Step 0: Select Budget */}
      {step === 0 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                <p className="text-[14px] font-medium">Report Details</p>
              </CardTitle>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium mb-1.5">
                  Report Title <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Youth Camp Expenditure Report"
                  className="w-full px-3 py-2.5 text-[13px] bg-(--surface) border border-(--border) rounded-(--r-input) outline-none focus:border-(--primary) text-[var(--text)] placeholder:text-(--muted) transition-colors"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium mb-1.5">
                  Notes <span className="text-(--muted) font-normal">(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional context..."
                  rows={3}
                  className="w-full px-3 py-2.5 text-[13px] bg-(--surface) border border-(--border) rounded-(--r-input) outline-none focus:border-(--primary) text-[var(--text)] placeholder:text-(--muted) transition-colors resize-none"
                />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <p className="text-[14px] font-medium">Select Budget</p>
                <p className="text-[12px] text-(--muted)">
                  Choose an approved budget to report against
                </p>
              </CardTitle>
            </CardHeader>
            <CardBody className="space-y-2">
              {budgets.length === 0 ? (
                <p className="text-[13px] text-(--muted) text-center py-6">
                  No approved budgets available. Create and approve a budget first.
                </p>
              ) : (
                budgets.map((budget) => (
                  <button
                    key={budget.id}
                    onClick={() => setSelectedBudgetId(budget.id)}
                    className={cn(
                      "w-full text-left px-4 py-3.5 rounded-(--r-card) border transition-all",
                      selectedBudgetId === budget.id
                        ? "border-(--primary) bg-[var(--primary-light)]"
                        : "border-(--border) bg-(--surface) hover:border-(--primary)"
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium">{budget.title}</p>
                        <p className="text-[11px] text-(--muted)">
                          {budget.department} · {budget.items.length} line items
                        </p>
                      </div>
                      {selectedBudgetId === budget.id && (
                        <Check size={16} className="text-(--primary) flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </CardBody>
          </Card>

          {selectedBudget && (
            <Card>
              <CardHeader>
                <CardTitle>
                  <p className="text-[14px] font-medium">Budget Line Items</p>
                  <p className="text-[12px] text-(--muted)">
                    {selectedBudget.items.length} items available for allocation
                  </p>
                </CardTitle>
              </CardHeader>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-(--border) bg-[var(--bg)]">
                    {["Description", "Category", "Amount"].map((h) => (
                      <th
                        key={h}
                        className="text-left text-[11px] font-medium text-(--muted) uppercase tracking-[0.5px] px-4 py-2.5 last:text-right"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedBudget.items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-(--border) last:border-0"
                    >
                      <td className="px-4 py-3 text-[13px]">{item.description}</td>
                      <td className="px-4 py-3 text-[12px] text-(--muted)">
                        {item.category ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-[13px] font-mono text-right">
                        {formatCurrency(item.totalCost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handleCreateReport}
              disabled={!canNext() || saving}
              loading={saving}
            >
              <FileText size={13} /> Create Report
            </Button>
          </div>
        </div>
      )}

      {/* Step 1: Upload Receipts */}
      {step === 1 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                <p className="text-[14px] font-medium">Upload Receipts</p>
                <p className="text-[12px] text-(--muted)">
                  Upload receipt images or PDFs. You can also record non-receipted expenses.
                </p>
              </CardTitle>
            </CardHeader>
            <CardBody>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-(--border) rounded-(--r-card) py-10 px-6 cursor-pointer hover:border-(--primary) hover:bg-[var(--primary-light)] transition-all">
                <Upload size={24} className="text-(--muted) mb-2" />
                <span className="text-[13px] font-medium">
                  {uploading ? "Uploading..." : "Click to select files"}
                </span>
                <span className="text-[11px] text-(--muted) mt-1">
                  PNG, JPG, PDF accepted
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileSelect}
                  disabled={uploading || !reportId}
                  className="hidden"
                />
              </label>
            </CardBody>
          </Card>

          {receipts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  <p className="text-[14px] font-medium">
                    {receipts.length} Receipt{receipts.length !== 1 ? "s" : ""}
                  </p>
                </CardTitle>
              </CardHeader>
              <div className="divide-y divide-(--border)">
                {receipts.map((receipt) => (
                  <div key={receipt.id} className="px-4 py-3.5">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[var(--primary-light)] flex items-center justify-center flex-shrink-0">
                        {receipt.uploaded ? (
                          <Check size={16} className="text-success" />
                        ) : (
                          <Loader2 size={16} className="animate-spin text-(--muted)" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium truncate">
                          {receipt.file.name}
                        </p>
                        <p className="text-[11px] text-(--muted)">
                          {(receipt.file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeReceipt(receipt.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-(--muted) hover:text-danger hover:bg-danger-bg transition-colors"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    </div>
                    {receipt.uploaded && (
                      <div className="grid grid-cols-3 gap-3 mt-3">
                        <div>
                          <label className="block text-[11px] text-(--muted) mb-1">
                            Amount (KES)
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={receipt.amount || ""}
                            onChange={(e) =>
                              updateReceipt(receipt.id, "amount", parseFloat(e.target.value) || 0)
                            }
                            placeholder="0"
                            className="w-full px-2.5 py-1.5 text-[12px] bg-(--surface) border border-(--border) rounded-[8px] outline-none focus:border-(--primary) font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-(--muted) mb-1">
                            Vendor
                          </label>
                          <input
                            type="text"
                            value={receipt.vendor}
                            onChange={(e) => updateReceipt(receipt.id, "vendor", e.target.value)}
                            placeholder="Vendor name"
                            className="w-full px-2.5 py-1.5 text-[12px] bg-(--surface) border border-(--border) rounded-[8px] outline-none focus:border-(--primary)"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-(--muted) mb-1">
                            Date
                          </label>
                          <input
                            type="date"
                            value={receipt.receiptDate}
                            onChange={(e) =>
                              updateReceipt(receipt.id, "receiptDate", e.target.value)
                            }
                            className="w-full px-2.5 py-1.5 text-[12px] bg-(--surface) border border-(--border) rounded-[8px] outline-none focus:border-(--primary)"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          <div className="flex justify-between">
            <Button variant="ghost" size="sm" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button size="sm" onClick={() => setStep(2)} disabled={!canNext()}>
              Continue to Allocation
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Allocate */}
      {step === 2 && selectedBudget && (
        <div className="space-y-4">
          {receipts
            .filter((r) => r.uploaded && r.receiptId)
            .map((receipt) => {
              const totalAlloc = getReceiptTotalAllocated(receipt.receiptId!);
              const remaining = receipt.amount - totalAlloc;
              return (
                <Card key={receipt.id}>
                  <CardHeader>
                    <CardTitle>
                      <p className="text-[14px] font-medium">
                        {receipt.file.name}
                      </p>
                      <p className="text-[12px] text-(--muted)">
                        KES {receipt.amount.toLocaleString()} ·{" "}
                        {totalAlloc > 0
                          ? `Allocated ${formatCurrency(totalAlloc)}`
                          : "Not allocated"}
                        {Math.abs(remaining) > 0.01 && (
                          <span className="text-warning ml-1">
                            · Remaining {formatCurrency(remaining)}
                          </span>
                        )}
                      </p>
                    </CardTitle>
                  </CardHeader>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-(--border) bg-[var(--bg)]">
                        {["Budget Item", "Category", "Item Amount", "Allocate"].map(
                          (h) => (
                            <th
                              key={h}
                              className="text-left text-[11px] font-medium text-(--muted) uppercase tracking-[0.5px] px-4 py-2.5 last:text-right"
                            >
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedBudget.items.map((item) => {
                        const alloc = getAllocationFor(receipt.receiptId!, item.id);
                        return (
                          <tr
                            key={item.id}
                            className="border-b border-(--border) last:border-0"
                          >
                            <td className="px-4 py-3 text-[13px]">
                              {item.description}
                            </td>
                            <td className="px-4 py-3 text-[12px] text-(--muted)">
                              {item.category ?? "—"}
                            </td>
                            <td className="px-4 py-3 text-[13px] font-mono">
                              {formatCurrency(item.totalCost)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <input
                                type="number"
                                min={0}
                                step={0.01}
                                value={alloc?.amount ?? ""}
                                onChange={(e) =>
                                  updateAllocation(
                                    receipt.receiptId!,
                                    item.id,
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                placeholder="0"
                                className="w-28 px-2.5 py-1.5 text-[12px] bg-(--surface) border border-(--border) rounded-[8px] outline-none focus:border-(--primary) font-mono text-right"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </Card>
              );
            })}

          <div className="flex justify-between">
            <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button size="sm" onClick={() => setStep(3)} disabled={!canNext()}>
              Continue to Review
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Submit */}
      {step === 3 && selectedBudget && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                <p className="text-[14px] font-medium">Review Summary</p>
              </CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex justify-between text-[13px]">
                <span className="text-(--muted)">Report</span>
                <span className="font-medium">{title}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-(--muted)">Budget</span>
                <span className="font-medium">{selectedBudget.title}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-(--muted)">Department</span>
                <span className="font-medium">{selectedBudget.department}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-(--muted)">Receipts</span>
                <span className="font-medium">{receipts.length}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-(--muted)">Total Claimed</span>
                <span className="font-medium font-mono">
                  {formatCurrency(
                    receipts.reduce((s, r) => s + r.amount, 0)
                  )}
                </span>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <p className="text-[14px] font-medium">Receipts</p>
              </CardTitle>
            </CardHeader>
            <div className="divide-y divide-(--border)">
              {receipts.map((receipt) => (
                <div key={receipt.id} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <Check size={14} className="text-success flex-shrink-0" />
                    <span className="text-[13px] truncate">{receipt.file.name}</span>
                  </div>
                  <span className="font-mono text-[13px] flex-shrink-0">
                    {formatCurrency(receipt.amount)}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex justify-between">
            <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              loading={saving}
              disabled={saving}
            >
              <Send size={13} /> Submit Report
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
