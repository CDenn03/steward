"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createOrganizationAction } from "@/features/admin/actions";
import { cn } from "@/lib/utils";

export function NewOrgModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [currency, setCurrency] = useState("KES");
  const [fiscalYearStart, setFiscalYearStart] = useState("01-01");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");

  if (!open) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Name is required";
    if (!slug.trim()) errs.slug = "Slug is required";
    else if (!/^[a-z0-9-]+$/.test(slug)) errs.slug = "Only lowercase letters, numbers, and hyphens";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    setFormError("");
    if (!validate()) return;

    setSaving(true);
    const res = await createOrganizationAction({
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      currency,
      fiscalYearStart,
    });

    const err = "error" in res ? res.error : null;
    if (err) {
      setSaving(false);
      setFormError(
        typeof err === "object" && "message" in err
          ? String(err.message)
          : "Unable to create organisation"
      );
      return;
    }

    setSaving(false);
    onClose();
    router.refresh();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-(--surface) border border-(--border) rounded-(--r-card) shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-(--border)">
          <p className="text-[15px] font-semibold">New Organisation</p>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-(--bg) transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {formError && (
            <div className="rounded-(--r-card) border border-red-200 bg-danger-bg px-4 py-3 text-[13px] text-danger">{formError}</div>
          )}

          <div>
            <label className="block text-[12px] font-medium mb-1.5">Organisation Name <span className="text-danger">*</span></label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Grace Community Church"
              className={cn("w-full px-3 py-2.5 text-[13px] bg-(--surface) border rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) placeholder:text-(--muted) transition-colors", errors.name ? "border-danger" : "border-(--border)")} />
            {errors.name && <p className="text-[11px] text-danger mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-[12px] font-medium mb-1.5">Slug <span className="text-danger">*</span></label>
            <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)}
              placeholder="grace-community"
              className={cn("w-full px-3 py-2.5 text-[13px] bg-(--surface) border rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) placeholder:text-(--muted) transition-colors font-mono", errors.slug ? "border-danger" : "border-(--border)")} />
            {errors.slug && <p className="text-[11px] text-danger mt-1">{errors.slug}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium mb-1.5">Currency</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2.5 text-[13px] bg-(--surface) border border-(--border) rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) transition-colors">
                <option value="KES">KES</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="UGX">UGX</option>
                <option value="TZS">TZS</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium mb-1.5">Fiscal Year Start</label>
              <input type="text" value={fiscalYearStart} onChange={(e) => setFiscalYearStart(e.target.value)}
                placeholder="01-01"
                className="w-full px-3 py-2.5 text-[13px] bg-(--surface) border border-(--border) rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) placeholder:text-(--muted) transition-colors font-mono" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-(--border)">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSubmit} loading={saving}>
            <Plus size={13} /> Create Organisation
          </Button>
        </div>
      </div>
    </div>
  );
}
