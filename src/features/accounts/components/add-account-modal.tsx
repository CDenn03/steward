"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createAccountAction } from "../actions";

const ACCOUNT_TYPES = [
  { value: "BANK", label: "Bank Account" },
  { value: "MPESA", label: "M-Pesa" },
  { value: "CASH", label: "Cash" },
  { value: "SAVINGS", label: "Savings" },
  { value: "PROJECT", label: "Project Account" },
] as const;

export function AddAccountModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("BANK");
  const [provider, setProvider] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [description, setDescription] = useState("");
  const [openingBalance, setOpeningBalance] = useState(0);
  const [isRestricted, setIsRestricted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");

  if (!open) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Account name is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    setFormError("");
    if (!validate()) return;

    setSaving(true);
    const res = await createAccountAction({
      name: name.trim(),
      type,
      provider: provider.trim() || undefined,
      accountNumber: accountNumber.trim() || undefined,
      description: description.trim() || undefined,
      openingBalance,
      isRestricted,
    });

    const resError = "error" in res ? res.error : null;
    if (resError) {
      setSaving(false);
      setFormError(
        typeof resError === "string"
          ? resError
          : (resError as { message?: string })?.message ?? "Unable to create account"
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
            <p className="text-[15px] font-semibold">Add Account</p>
            <p className="text-[12px] text-(--muted)">Create a new financial account</p>
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
            <label className="block text-[12px] font-medium mb-1.5">Account Name <span className="text-danger">*</span></label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Church Main Account"
              className={cn("w-full px-3 py-2.5 text-[13px] bg-(--surface) border rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) placeholder:text-(--muted) transition-colors", errors.name ? "border-danger" : "border-(--border)")} />
            {errors.name && <p className="text-[11px] text-danger mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-[12px] font-medium mb-1.5">Account Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2.5 text-[13px] bg-(--surface) border border-(--border) rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) transition-colors">
              {ACCOUNT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium mb-1.5">Provider</label>
              <input type="text" value={provider} onChange={(e) => setProvider(e.target.value)}
                placeholder="e.g. Equity Bank"
                className="w-full px-3 py-2.5 text-[13px] bg-(--surface) border border-(--border) rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) placeholder:text-(--muted) transition-colors" />
            </div>
            <div>
              <label className="block text-[12px] font-medium mb-1.5">Account Number</label>
              <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="e.g. 1234567890"
                className="w-full px-3 py-2.5 text-[13px] bg-(--surface) border border-(--border) rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) placeholder:text-(--muted) transition-colors" />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium mb-1.5">Opening Balance</label>
            <input type="number" min={0} value={openingBalance || ""} onChange={(e) => setOpeningBalance(Number.parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="w-full px-3 py-2.5 text-[13px] bg-(--surface) border border-(--border) rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) placeholder:text-(--muted) transition-colors font-mono" />
          </div>

          <div>
            <label className="block text-[12px] font-medium mb-1.5">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description..." rows={2}
              className="w-full px-3 py-2.5 text-[13px] bg-(--surface) border border-(--border) rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) placeholder:text-(--muted) transition-colors resize-none" />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isRestricted} onChange={(e) => setIsRestricted(e.target.checked)}
              className="w-4 h-4 rounded border-(--border) text-(--primary) focus:ring-(--primary)" />
            <span className="text-[12px] font-medium">Restricted account</span>
          </label>
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-(--border)">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSubmit} loading={saving}>
            <Plus size={13} /> Create Account
          </Button>
        </div>
      </div>
    </div>
  );
}