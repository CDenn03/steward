"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Send,
  Save,
  Calculator,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { formatCurrency, cn } from "@/lib/utils";
import {
  updateBudgetAction,
  submitBudgetAction,
} from "@/features/budgets/actions";

interface LineItem {
  id: string;
  dbId?: string;
  description: string;
  categoryId: string;
  quantity: number;
  unitCost: number;
}

type FormOption = { id: string; name: string };
type BudgetItem = {
  id: string;
  description: string;
  quantity: number;
  unitCost: number;
  category: { id: string; name: string } | null;
};

const newItem = (): LineItem => ({
  id: Math.random().toString(36).slice(2),
  description: "",
  categoryId: "",
  quantity: 1,
  unitCost: 0,
});

export function EditBudgetForm({
  budget,
  departments,
  events,
  categories,
}: Readonly<{
  budget: {
    id: string;
    title: string;
    description: string | null;
    departmentId: string | null;
    eventId: string | null;
    periodStart: Date | null;
    periodEnd: Date | null;
    items: BudgetItem[];
    status: string;
  };
  departments: FormOption[];
  events: FormOption[];
  categories: FormOption[];
}>) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(budget.title);
  const [departmentId, setDepartmentId] = useState(budget.departmentId ?? "");
  const [eventId, setEventId] = useState(budget.eventId ?? "");
  const [periodStart, setPeriodStart] = useState(
    budget.periodStart ? budget.periodStart.toISOString().split("T")[0] : ""
  );
  const [periodEnd, setPeriodEnd] = useState(
    budget.periodEnd ? budget.periodEnd.toISOString().split("T")[0] : ""
  );
  const [notes, setNotes] = useState(budget.description ?? "");
  const [items, setItems] = useState<LineItem[]>(() =>
    budget.items.map((item) => ({
      id: `item-${item.id}`,
      dbId: item.id,
      description: item.description,
      categoryId: item.category?.id ?? "",
      quantity: item.quantity,
      unitCost: item.unitCost,
    }))
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");

  const total = items.reduce((s, i) => s + i.quantity * i.unitCost, 0);

  const updateItem = useCallback(
    (id: string, field: keyof LineItem, value: string | number) => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, [field]: value } : item
        )
      );
    },
    []
  );

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
    const res = await updateBudgetAction(budget.id, {
      title: title.trim(),
      description: notes.trim() || undefined,
      departmentId,
      eventId: eventId || undefined,
      periodStart: periodStart || undefined,
      periodEnd: periodEnd || undefined,
      items: items.map((item) => ({
        id: item.dbId,
        categoryId: item.categoryId || undefined,
        description: item.description.trim(),
        quantity: item.quantity,
        unitCost: item.unitCost,
      })),
    });

    const updateError = "error" in res ? res.error : null;
    if (updateError) {
      setSaving(false);
      setFormError(
        typeof updateError === "string"
          ? updateError
          : typeof updateError === "object" && "message" in updateError
            ? String(updateError.message)
            : "Unable to update budget"
      );
      return;
    }

    if (submit) {
      const submitRes = await submitBudgetAction(budget.id);
      if ("error" in submitRes && submitRes.error) {
        setSaving(false);
        setFormError(
          typeof submitRes.error === "string"
            ? submitRes.error
            : "Unable to submit budget"
        );
        router.push(`/budgets/${budget.id}`);
        return;
      }
    }

    setSaving(false);
    router.push(submit ? `/budgets/${budget.id}` : `/budgets/${budget.id}`);
    router.refresh();
  };

  return (
    <div className="max-w-[900px]">
      <Link
        href={`/budgets/${budget.id}`}
        className="inline-flex items-center gap-1.5 text-[12px] text-(--muted) hover:text-(--text) transition-colors mb-5"
      >
        <ArrowLeft size={13} /> Back to Budget
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[20px] font-semibold tracking-tight">
            Edit Budget
          </h1>
          <p className="text-[13px] text-(--muted) mt-0.5">
            Update budget details and line items
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSave(false)}
            loading={saving}
          >
            <Save size={13} /> Save Changes
          </Button>
          <Button
            size="sm"
            onClick={() => handleSave(true)}
            loading={saving}
          >
            <Send size={13} /> Submit for Review
          </Button>
        </div>
      </div>

      {formError && (
        <div className="mb-4 rounded-(--r-card) border border-red-200 bg-danger-bg px-4 py-3 text-[13px] text-danger">
          {formError}
        </div>
      )}

      <div className="grid grid-cols-[1fr_280px] gap-4">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                <p className="text-[14px] font-medium">Budget Details</p>
              </CardTitle>
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
                    "w-full px-3 py-2.5 text-[13px] bg-(--surface) border rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) placeholder:text-(--muted) transition-colors",
                    errors.title ? "border-danger" : "border-(--border)"
                  )}
                />
                {errors.title && (
                  <p className="text-[11px] text-danger mt-1">
                    {errors.title}
                  </p>
                )}
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
                      "w-full px-3 py-2.5 text-[13px] bg-(--surface) border rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) transition-colors",
                      errors.departmentId
                        ? "border-danger"
                        : "border-(--border)"
                    )}
                  >
                    <option value="">Select department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  {errors.departmentId && (
                    <p className="text-[11px] text-danger mt-1">
                      {errors.departmentId}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-1.5">
                    Link to Event{" "}
                    <span className="text-(--muted) font-normal">
                      (optional)
                    </span>
                  </label>
                  <select
                    value={eventId}
                    onChange={(e) => setEventId(e.target.value)}
                    className="w-full px-3 py-2.5 text-[13px] bg-(--surface) border border-(--border) rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) transition-colors"
                  >
                    <option value="">None</option>
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium mb-1.5">
                    Period Start
                  </label>
                  <input
                    type="date"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                    className="w-full px-3 py-2.5 text-[13px] bg-(--surface) border border-(--border) rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-1.5">
                    Period End
                  </label>
                  <input
                    type="date"
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                    className="w-full px-3 py-2.5 text-[13px] bg-(--surface) border border-(--border) rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium mb-1.5">
                  Notes{" "}
                  <span className="text-(--muted) font-normal">
                    (optional)
                  </span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add context or justification for this budget..."
                  rows={3}
                  className="w-full px-3 py-2.5 text-[13px] bg-(--surface) border border-(--border) rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) placeholder:text-(--muted) transition-colors resize-none"
                />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <p className="text-[14px] font-medium">Budget Line Items</p>
                <p className="text-[12px] text-(--muted)">
                  {items.length} item{items.length !== 1 ? "s" : ""}
                </p>
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={addItem}>
                <Plus size={13} /> Add Item
              </Button>
            </CardHeader>

            <div className="grid grid-cols-[1fr_140px_80px_120px_100px_36px] gap-2 px-4 py-2.5 border-b border-(--border) bg-(--bg)">
              {["Description", "Category", "Qty", "Unit Cost (KES)", "Total", ""].map(
                (h) => (
                  <span
                    key={h}
                    className="text-[11px] font-medium text-(--muted) uppercase tracking-[0.5px]"
                  >
                    {h}
                  </span>
                )
              )}
            </div>

            <div className="divide-y divide-(--border)">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[1fr_140px_80px_120px_100px_36px] gap-2 px-4 py-3 items-center hover:bg-(--bg) transition-colors"
                >
                  <div>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) =>
                        updateItem(item.id, "description", e.target.value)
                      }
                      placeholder={`Item ${idx + 1} description`}
                      className={cn(
                        "w-full px-2.5 py-1.5 text-[12.5px] bg-(--surface) border rounded-[8px] outline-none focus:border-(--primary) text-(--text) placeholder:text-(--muted) transition-colors",
                        errors[`item-${idx}-desc`]
                          ? "border-danger"
                          : "border-(--border)"
                      )}
                    />
                  </div>
                  <div>
                    <select
                      value={item.categoryId}
                      onChange={(e) =>
                        updateItem(item.id, "categoryId", e.target.value)
                      }
                      className="w-full px-2 py-1.5 text-[12.5px] bg-(--surface) border border-(--border) rounded-[8px] outline-none focus:border-(--primary) text-(--text) transition-colors"
                    >
                      <option value="">Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(
                          item.id,
                          "quantity",
                          Number.parseFloat(e.target.value) || 0
                        )
                      }
                      className={cn(
                        "w-full px-2.5 py-1.5 text-[12.5px] bg-(--surface) border rounded-[8px] outline-none focus:border-(--primary) text-(--text) transition-colors text-right font-mono",
                        errors[`item-${idx}-qty`]
                          ? "border-danger"
                          : "border-(--border)"
                      )}
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      min={0}
                      value={item.unitCost || ""}
                      onChange={(e) =>
                        updateItem(
                          item.id,
                          "unitCost",
                          Number.parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="0"
                      className={cn(
                        "w-full px-2.5 py-1.5 text-[12.5px] bg-(--surface) border rounded-[8px] outline-none focus:border-(--primary) text-(--text) placeholder:text-(--muted) transition-colors text-right font-mono",
                        errors[`item-${idx}-cost`]
                          ? "border-danger"
                          : "border-(--border)"
                      )}
                    />
                  </div>
                  <div className="text-right">
                    <span className="text-[12.5px] font-mono font-medium">
                      {item.unitCost > 0
                        ? formatCurrency(item.quantity * item.unitCost).replace(
                            "KES ",
                            ""
                          )
                        : "-"}
                    </span>
                  </div>
                  <div>
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={items.length === 1}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-(--muted) hover:text-danger hover:bg-danger-bg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between px-4 py-3.5 border-t-2 border-(--border) bg-(--bg)">
              <div className="flex items-center gap-2 text-[12px] text-(--muted)">
                <Calculator size={13} />
                {items.length} line item{items.length !== 1 ? "s" : ""}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[12px] text-(--muted)">
                  Total Budget
                </span>
                <span className="text-[16px] font-semibold font-mono">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            <div className="px-4 pb-4">
              <button
                onClick={addItem}
                className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-(--border) rounded-[10px] text-[12.5px] text-(--muted) hover:border-(--primary) hover:text-(--primary) hover:bg-[var(--primary-light)] transition-all"
              >
                <Plus size={13} /> Add another line item
              </button>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                <p className="text-[14px] font-medium">Budget Summary</p>
              </CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="bg-[var(--primary-light)] rounded-[10px] p-3.5 text-center">
                <p className="text-[11px] text-(--primary) font-medium uppercase tracking-[0.5px] mb-1">
                  Total Amount
                </p>
                <p className="text-[22px] font-semibold tracking-tight font-mono text-(--primary)">
                  {formatCurrency(total)}
                </p>
              </div>

              <div className="space-y-1.5">
                {items
                  .filter((i) => i.unitCost > 0)
                  .map((item) => (
                    <div key={item.id} className="flex justify-between text-[12px]">
                      <span className="text-(--muted) truncate pr-2">
                        {item.description || "Item"}
                      </span>
                      <span className="font-mono shrink-0">
                        {formatCurrency(item.quantity * item.unitCost).replace(
                          "KES ",
                          ""
                        )}
                      </span>
                    </div>
                  ))}
              </div>

              {items.filter((i) => i.unitCost > 0).length > 0 && (
                <div className="border-t border-(--border) pt-2 flex justify-between text-[12px] font-semibold">
                  <span>Total</span>
                  <span className="font-mono">
                    {formatCurrency(total).replace("KES ", "")}
                  </span>
                </div>
              )}
            </CardBody>
          </Card>

          <div className="space-y-2">
            <Button
              className="w-full justify-center"
              onClick={() => handleSave(true)}
              loading={saving}
            >
              <Send size={13} /> Submit for Review
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-center"
              onClick={() => handleSave(false)}
              loading={saving}
            >
              <Save size={13} /> Save Changes
            </Button>
            <Link
              href={`/budgets/${budget.id}`}
              className="block w-full text-center py-2 text-[12px] text-(--muted) hover:text-(--text) transition-colors"
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
