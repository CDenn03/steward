"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DollarSign, Plus, Trash2, X } from "lucide-react";
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { formatCurrency, cn } from "@/lib/utils";
import { createDisbursementAction } from "../actions";

type AccountOption = {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
};

interface LineItem {
  id: string;
  description: string;
  amount: number;
}

const newLineItem = (): LineItem => ({
  id: Math.random().toString(36).slice(2),
  description: "",
  amount: 0,
});

export function RequestDisbursementModal({
  budgetId,
  accounts,
  open,
  onClose,
}: {
  budgetId: string;
  accounts: AccountOption[];
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [accountId, setAccountId] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([newLineItem()]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  if (!open) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!accountId) errs.accountId = "Account is required";
    if (!description.trim()) errs.description = "Description is required";
    if (totalAmount <= 0) errs.amount = "Total amount must be positive";
    if (items.length === 0) errs.items = "At least one line item is required";
    items.forEach((item, i) => {
      if (!item.description.trim()) errs[`item-${i}-desc`] = "Required";
      if (item.amount <= 0) errs[`item-${i}-amount`] = "Must be > 0";
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    setFormError("");
    if (!validate()) return;

    const selectedAccount = accounts.find((a) => a.id === accountId);
    if (selectedAccount && selectedAccount.balance < totalAmount) {
      setFormError(`Insufficient balance in ${selectedAccount.name}. Available: ${formatCurrency(selectedAccount.balance)}`);
      return;
    }

    setSaving(true);
    const res = await createDisbursementAction({
      budgetId,
      accountId,
      description: description.trim(),
      totalAmount,
      notes: notes.trim() || undefined,
      items: items.map((item) => ({
        description: item.description.trim(),
        amount: item.amount,
      })),
    });

    const resError = "error" in res ? res.error : null;
    if (resError) {
      setSaving(false);
      setFormError(
        typeof resError === "string"
          ? resError
          : (resError as { message?: string })?.message ?? "Unable to create disbursement"
      );
      return;
    }

    setSaving(false);
    onClose();
    router.refresh();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" role="dialog" aria-modal="true" aria-label="Request disbursement">
      <div className="bg-(--surface) border border-(--border) rounded-(--r-card) shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-(--border)">
          <div>
            <p className="text-[16px] font-semibold">Request Disbursement</p>
            <p className="text-[13px] text-(--muted)">Request funds from this budget</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-(--bg) transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {formError && (
            <div className="rounded-(--r-card) border border-red-200 bg-danger-bg px-4 py-3 text-[14px] text-danger">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-[13px] font-medium mb-1.5">
              Account <span className="text-danger">*</span>
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className={cn(
                "w-full px-3 py-2.5 text-[14px] bg-(--surface) border rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) transition-colors",
                errors.accountId ? "border-danger" : "border-(--border)"
              )}
            >
              <option value="">Select account</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({formatCurrency(a.balance)} available)
                </option>
              ))}
            </select>
            {errors.accountId && <p className="text-[12px] text-danger mt-1">{errors.accountId}</p>}
          </div>

          <div>
            <label className="block text-[13px] font-medium mb-1.5">
              Description <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this disbursement for?"
              className={cn(
                "w-full px-3 py-2.5 text-[14px] bg-(--surface) border rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) placeholder:text-(--muted) transition-colors",
                errors.description ? "border-danger" : "border-(--border)"
              )}
            />
            {errors.description && <p className="text-[12px] text-danger mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-[13px] font-medium mb-1.5">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional details..."
              rows={2}
              className="w-full px-3 py-2.5 text-[14px] bg-(--surface) border border-(--border) rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) placeholder:text-(--muted) transition-colors resize-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[13px] font-medium">Line Items</label>
              <Button variant="ghost" size="sm" onClick={() => setItems((prev) => [...prev, newLineItem()])}>
                <Plus size={12} /> Add Item
              </Button>
            </div>
            {errors.items && <p className="text-[12px] text-danger mb-2">{errors.items}</p>}
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={item.id} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((i) => (i.id === item.id ? { ...i, description: e.target.value } : i))
                        )
                      }
                      placeholder={`Item ${idx + 1}`}
                      className={cn(
                        "w-full px-2.5 py-1.5 text-[12.5px] bg-(--surface) border rounded-[8px] outline-none focus:border-(--primary) text-(--text) placeholder:text-(--muted) transition-colors",
                        errors[`item-${idx}-desc`] ? "border-danger" : "border-(--border)"
                      )}
                    />
                  </div>
                  <div className="w-[120px]">
                    <input
                      type="number"
                      min={0}
                      value={item.amount || ""}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((i) => (i.id === item.id ? { ...i, amount: Number.parseFloat(e.target.value) || 0 } : i))
                        )
                      }
                      placeholder="Amount"
                      className={cn(
                        "w-full px-2.5 py-1.5 text-[12.5px] bg-(--surface) border rounded-[8px] outline-none focus:border-(--primary) text-(--text) placeholder:text-(--muted) transition-colors text-right font-mono",
                        errors[`item-${idx}-amount`] ? "border-danger" : "border-(--border)"
                      )}
                    />
                  </div>
                  <button
                    onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
                    disabled={items.length === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-(--muted) hover:text-danger hover:bg-danger-bg transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between py-2.5 px-3 bg-(--bg) border border-(--border) rounded-(--r-input)">
            <span className="text-[13px] text-(--muted)">Total</span>
            <span className="text-[16px] font-semibold font-mono">{formatCurrency(totalAmount)}</span>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-(--border)">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSubmit} loading={saving}>
            <DollarSign size={13} /> Request Disbursement
          </Button>
        </div>
      </div>
    </div>
  );
}