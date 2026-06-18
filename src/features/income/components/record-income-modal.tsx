"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, cn } from "@/lib/utils";
import { recordIncomeAction } from "../actions";

type AccountOption = { id: string; name: string; balance: number };
type FormOption = { id: string; name: string };

const CATEGORIES = [
  { value: "TITHE", label: "Tithe" },
  { value: "OFFERING", label: "Offering" },
  { value: "DONATION", label: "Donation" },
  { value: "REGISTRATION", label: "Registration" },
  { value: "FUNDRAISING", label: "Fundraising" },
  { value: "GRANT", label: "Grant" },
  { value: "OTHER", label: "Other" },
] as const;

export function RecordIncomeModal({
  open,
  onClose,
  accounts,
  departments,
  events,
}: {
  open: boolean;
  onClose: () => void;
  accounts: AccountOption[];
  departments: FormOption[];
  events: FormOption[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [accountId, setAccountId] = useState("");
  const [category, setCategory] = useState("OFFERING");
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [eventId, setEventId] = useState("");
  const [receivedAt, setReceivedAt] = useState(new Date().toISOString().split("T")[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");

  if (!open) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!accountId) errs.accountId = "Account is required";
    if (!description.trim()) errs.description = "Description is required";
    if (amount <= 0) errs.amount = "Amount must be positive";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    setFormError("");
    if (!validate()) return;

    setSaving(true);
    const res = await recordIncomeAction({
      accountId,
      category,
      amount,
      description: description.trim(),
      notes: notes.trim() || undefined,
      departmentId: departmentId || undefined,
      eventId: eventId || undefined,
      receivedAt: receivedAt || undefined,
    });

    const resError = "error" in res ? res.error : null;
    if (resError) {
      setSaving(false);
      setFormError(
        typeof resError === "string"
          ? resError
          : (resError as { message?: string })?.message ?? "Unable to record income"
      );
      return;
    }

    setSaving(false);
    onClose();
    router.refresh();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-(--surface) border border-(--border) rounded-(--r-card) shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-(--border)">
          <div>
            <p className="text-[15px] font-semibold">Record Income</p>
            <p className="text-[12px] text-(--muted)">Add a new income record</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-(--bg) transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {formError && (
            <div className="rounded-(--r-card) border border-red-200 bg-danger-bg px-4 py-3 text-[13px] text-danger">{formError}</div>
          )}

          <div>
            <label className="block text-[12px] font-medium mb-1.5">Account <span className="text-danger">*</span></label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className={cn("w-full px-3 py-2.5 text-[13px] bg-(--surface) border rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) transition-colors", errors.accountId ? "border-danger" : "border-(--border)")}
            >
              <option value="">Select account</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name} ({formatCurrency(a.balance)})</option>
              ))}
            </select>
            {errors.accountId && <p className="text-[11px] text-danger mt-1">{errors.accountId}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium mb-1.5">Category <span className="text-danger">*</span></label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 text-[13px] bg-(--surface) border border-(--border) rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) transition-colors">
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium mb-1.5">Amount <span className="text-danger">*</span></label>
              <input type="number" min={0} value={amount || ""} onChange={(e) => setAmount(Number.parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={cn("w-full px-3 py-2.5 text-[13px] bg-(--surface) border rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) placeholder:text-(--muted) transition-colors font-mono", errors.amount ? "border-danger" : "border-(--border)")} />
              {errors.amount && <p className="text-[11px] text-danger mt-1">{errors.amount}</p>}
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium mb-1.5">Description <span className="text-danger">*</span></label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Sunday offering, John Doe donation"
              className={cn("w-full px-3 py-2.5 text-[13px] bg-(--surface) border rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) placeholder:text-(--muted) transition-colors", errors.description ? "border-danger" : "border-(--border)")} />
            {errors.description && <p className="text-[11px] text-danger mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium mb-1.5">Date</label>
              <input type="date" value={receivedAt} onChange={(e) => setReceivedAt(e.target.value)}
                className="w-full px-3 py-2.5 text-[13px] bg-(--surface) border border-(--border) rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) transition-colors" />
            </div>
            <div>
              <label className="block text-[12px] font-medium mb-1.5">Department</label>
              <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3 py-2.5 text-[13px] bg-(--surface) border border-(--border) rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) transition-colors">
                <option value="">None</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium mb-1.5">Event</label>
            <select value={eventId} onChange={(e) => setEventId(e.target.value)}
              className="w-full px-3 py-2.5 text-[13px] bg-(--surface) border border-(--border) rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) transition-colors">
              <option value="">None</option>
              {events.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-medium mb-1.5">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes..." rows={2}
              className="w-full px-3 py-2.5 text-[13px] bg-(--surface) border border-(--border) rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) placeholder:text-(--muted) transition-colors resize-none" />
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-(--border)">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSubmit} loading={saving}>
            <Plus size={13} /> Record Income
          </Button>
        </div>
      </div>
    </div>
  );
}