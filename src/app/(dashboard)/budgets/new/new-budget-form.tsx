"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Send, Save, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  createBudgetAction,
  submitBudgetAction,
} from "@/features/budgets/actions";

interface LineItem {
  id: string;
  description: string;
  categoryId: string;
  quantity: number;
  unitCost: number;
}

type FormOption = {
  id: string;
  name: string;
};

const newItem = (): LineItem => ({
  id: Math.random().toString(36).slice(2),
  description: "",
  categoryId: "",
  quantity: 1,
  unitCost: 0,
});

export function NewBudgetForm({
  departments,
  events,
  categories,
}: {
  departments: FormOption[];
  events: FormOption[];
  categories: FormOption[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [eventId, setEventId] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([newItem()]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");

  const total = items.reduce((s, i) => s + i.quantity * i.unitCost, 0);

  const updateItem = useCallback((id: string, field: keyof LineItem, value: string | number) => {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, [field]: value } : item));
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const addItem = useCallback(() => {
    setItems((prev) => [...prev, newItem()]);
  }, []);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Budget title is required";
    if (!departmentId) errs.departmentId = "Department is required";
    if (items.length === 0) errs.items = "At least one budget item is required";
    items.forEach((item, i) => {
      if (!item.description.trim()) errs[`item-${i}-desc`] = "Required";
      if (item.unitCost <= 0) errs[`item-${i}-cost`] = "Must be > 0";
      if (item.quantity <= 0) errs[`item-${i}-qty`] = "Must be > 0";
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (submit = false) => {
    setFormError("");
    if (!validate()) return;

    setSaving(true);
    const res = await createBudgetAction({
      title: title.trim(),
      description: notes.trim() || undefined,
      departmentId,
      eventId: eventId || undefined,
      periodStart: periodStart || undefined,
      periodEnd: periodEnd || undefined,
      items: items.map((item) => ({
        categoryId: item.categoryId || undefined,
        description: item.description.trim(),
        quantity: item.quantity,
        unitCost: item.unitCost,
      })),
    });

    const createError = "error" in res ? res.error : null;
    if (createError) {
      setSaving(false);
      setFormError(
        typeof createError === "string"
          ? createError
          : typeof createError === "object" && "message" in createError
            ? String(createError.message)
            : "Unable to create budget"
      );
      return;
    }

    const budgetId = (res.data as { id: string }).id;
    if (submit) {
      const submitRes = await submitBudgetAction(budgetId);
      if ("error" in submitRes && submitRes.error) {
        setSaving(false);
        setFormError(typeof submitRes.error === "string" ? submitRes.error : "Unable to submit budget");
        router.push(`/budgets/${budgetId}`);
        return;
      }
    }

    setSaving(false);
    router.push(submit ? `/budgets/${budgetId}` : "/budgets");
    router.refresh();
  };

  return (
    <div className="max-w-[900px]">
      <Link href="/budgets" className="inline-flex items-center gap-1.5 text-[12px] text-[var(--muted)] hover:text-[var(--text)] transition-colors mb-5">
        <ArrowLeft size={13} /> Back to Budgets
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[20px] font-semibold tracking-tight">New Budget</h1>
          <p className="text-[13px] text-[var(--muted)] mt-0.5">Create a new budget for a department or event</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleSave(false)} loading={saving}>
            <Save size={13} /> Save Draft
          </Button>
          <Button size="sm" onClick={() => handleSave(true)} loading={saving}>
            <Send size={13} /> Submit for Review
          </Button>
        </div>
      </div>

      {formError && (
        <div className="mb-4 rounded-[var(--r-card)] border border-red-200 bg-danger-bg px-4 py-3 text-[13px] text-danger">
          {formError}
        </div>
      )}

      <div className="grid grid-cols-[1fr_280px] gap-4">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle><p className="text-[14px] font-medium">Budget Details</p></CardTitle>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium mb-1.5">
                  Budget Title <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Youth Annual Camp 2025"
                  className={cn(
                    "w-full px-3 py-2.5 text-[13px] bg-[var(--surface)] border rounded-[var(--r-input)] outline-none focus:border-[var(--primary)] text-[var(--text)] placeholder:text-[var(--muted)] transition-colors",
                    errors.title ? "border-danger" : "border-[var(--border)]"
                  )}
                />
                {errors.title && <p className="text-[11px] text-danger mt-1">{errors.title}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium mb-1.5">
                    Department <span className="text-danger">*</span>
                  </label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className={cn(
                      "w-full px-3 py-2.5 text-[13px] bg-[var(--surface)] border rounded-[var(--r-input)] outline-none focus:border-[var(--primary)] text-[var(--text)] transition-colors",
                      errors.departmentId ? "border-danger" : "border-[var(--border)]"
                    )}
                  >
                    <option value="">Select department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  {errors.departmentId && <p className="text-[11px] text-danger mt-1">{errors.departmentId}</p>}
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-1.5">
                    Link to Event <span className="text-[var(--muted)] font-normal">(optional)</span>
                  </label>
                  <select
                    value={eventId}
                    onChange={(e) => setEventId(e.target.value)}
                    className="w-full px-3 py-2.5 text-[13px] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-input)] outline-none focus:border-[var(--primary)] text-[var(--text)] transition-colors"
                  >
                    <option value="">None</option>
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>{ev.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium mb-1.5">Period Start</label>
                  <input
                    type="date"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                    className="w-full px-3 py-2.5 text-[13px] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-input)] outline-none focus:border-[var(--primary)] text-[var(--text)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-1.5">Period End</label>
                  <input
                    type="date"
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                    className="w-full px-3 py-2.5 text-[13px] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-input)] outline-none focus:border-[var(--primary)] text-[var(--text)] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium mb-1.5">
                  Notes <span className="text-[var(--muted)] font-normal">(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add context or justification for this budget..."
                  rows={3}
                  className="w-full px-3 py-2.5 text-[13px] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-input)] outline-none focus:border-[var(--primary)] text-[var(--text)] placeholder:text-[var(--muted)] transition-colors resize-none"
                />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <p className="text-[14px] font-medium">Budget Line Items</p>
                <p className="text-[12px] text-[var(--muted)]">{items.length} item{items.length !== 1 ? "s" : ""}</p>
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={addItem}>
                <Plus size={13} /> Add Item
              </Button>
            </CardHeader>

            <div className="grid grid-cols-[1fr_140px_80px_120px_100px_36px] gap-2 px-4 py-2.5 border-b border-[var(--border)] bg-[var(--bg)]">
              {["Description", "Category", "Qty", "Unit Cost (KES)", "Total", ""].map((h) => (
                <span key={h} className="text-[11px] font-medium text-[var(--muted)] uppercase tracking-[0.5px]">{h}</span>
              ))}
            </div>

            <div className="divide-y divide-[var(--border)]">
              {items.map((item, idx) => (
                <div key={item.id} className="grid grid-cols-[1fr_140px_80px_120px_100px_36px] gap-2 px-4 py-3 items-center hover:bg-[var(--bg)] transition-colors">
                  <div>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, "description", e.target.value)}
                      placeholder={`Item ${idx + 1} description`}
                      className={cn(
                        "w-full px-2.5 py-1.5 text-[12.5px] bg-[var(--surface)] border rounded-[8px] outline-none focus:border-[var(--primary)] text-[var(--text)] placeholder:text-[var(--muted)] transition-colors",
                        errors[`item-${idx}-desc`] ? "border-danger" : "border-[var(--border)]"
                      )}
                    />
                  </div>
                  <div>
                    <select
                      value={item.categoryId}
                      onChange={(e) => updateItem(item.id, "categoryId", e.target.value)}
                      className="w-full px-2 py-1.5 text-[12.5px] bg-[var(--surface)] border border-[var(--border)] rounded-[8px] outline-none focus:border-[var(--primary)] text-[var(--text)] transition-colors"
                    >
                      <option value="">Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                      className={cn(
                        "w-full px-2.5 py-1.5 text-[12.5px] bg-[var(--surface)] border rounded-[8px] outline-none focus:border-[var(--primary)] text-[var(--text)] transition-colors text-right font-mono",
                        errors[`item-${idx}-qty`] ? "border-danger" : "border-[var(--border)]"
                      )}
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      min={0}
                      value={item.unitCost || ""}
                      onChange={(e) => updateItem(item.id, "unitCost", parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className={cn(
                        "w-full px-2.5 py-1.5 text-[12.5px] bg-[var(--surface)] border rounded-[8px] outline-none focus:border-[var(--primary)] text-[var(--text)] placeholder:text-[var(--muted)] transition-colors text-right font-mono",
                        errors[`item-${idx}-cost`] ? "border-danger" : "border-[var(--border)]"
                      )}
                    />
                  </div>
                  <div className="text-right">
                    <span className="text-[12.5px] font-mono font-medium">
                      {item.unitCost > 0
                        ? formatCurrency(item.quantity * item.unitCost).replace("KES ", "")
                        : "-"}
                    </span>
                  </div>
                  <div>
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={items.length === 1}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--muted)] hover:text-danger hover:bg-danger-bg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between px-4 py-3.5 border-t-2 border-[var(--border)] bg-[var(--bg)]">
              <div className="flex items-center gap-2 text-[12px] text-[var(--muted)]">
                <Calculator size={13} />
                {items.length} line item{items.length !== 1 ? "s" : ""}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[12px] text-[var(--muted)]">Total Budget</span>
                <span className="text-[16px] font-semibold font-mono">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="px-4 pb-4">
              <button
                onClick={addItem}
                className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-[var(--border)] rounded-[10px] text-[12.5px] text-[var(--muted)] hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--primary-light)] transition-all"
              >
                <Plus size={13} /> Add another line item
              </button>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle><p className="text-[14px] font-medium">Budget Summary</p></CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="bg-[var(--primary-light)] rounded-[10px] p-3.5 text-center">
                <p className="text-[11px] text-[var(--primary)] font-medium uppercase tracking-[0.5px] mb-1">Total Amount</p>
                <p className="text-[22px] font-semibold tracking-tight font-mono text-[var(--primary)]">
                  {formatCurrency(total)}
                </p>
              </div>

              <div className="space-y-1.5">
                {items.filter((i) => i.unitCost > 0).map((item) => (
                  <div key={item.id} className="flex justify-between text-[12px]">
                    <span className="text-[var(--muted)] truncate pr-2">{item.description || "Item"}</span>
                    <span className="font-mono flex-shrink-0">
                      {formatCurrency(item.quantity * item.unitCost).replace("KES ", "")}
                    </span>
                  </div>
                ))}
              </div>

              {items.filter((i) => i.unitCost > 0).length > 0 && (
                <div className="border-t border-[var(--border)] pt-2 flex justify-between text-[12px] font-semibold">
                  <span>Total</span>
                  <span className="font-mono">{formatCurrency(total).replace("KES ", "")}</span>
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle><p className="text-[14px] font-medium">After Submission</p></CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {[
                  { step: "1", label: "Finance Review", desc: "Finance officer reviews the budget" },
                  { step: "2", label: "Chairperson", desc: "Final approval by chairperson" },
                  { step: "3", label: "Approved", desc: "Budget is activated for use" },
                ].map((s) => (
                  <div key={s.step} className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-[var(--border)] flex items-center justify-center text-[10px] font-semibold text-[var(--muted)] flex-shrink-0 mt-0.5">{s.step}</div>
                    <div>
                      <p className="text-[12px] font-medium">{s.label}</p>
                      <p className="text-[11px] text-[var(--muted)]">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <div className="space-y-2">
            <Button className="w-full justify-center" onClick={() => handleSave(true)} loading={saving}>
              <Send size={13} /> Submit for Review
            </Button>
            <Button variant="ghost" className="w-full justify-center" onClick={() => handleSave(false)} loading={saving}>
              <Save size={13} /> Save as Draft
            </Button>
            <Link href="/budgets" className="block w-full text-center py-2 text-[12px] text-[var(--muted)] hover:text-[var(--text)] transition-colors">
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
