"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, cn } from "@/lib/utils";
import { createDepartmentAction, setDepartmentAllocationAction } from "../actions";

type MemberOption = { id: string; name: string };

export function AddDepartmentModal({
  open,
  onClose,
  members,
}: {
  open: boolean;
  onClose: () => void;
  members: MemberOption[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [headId, setHeadId] = useState("");
  const [softLimit, setSoftLimit] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");

  if (!open) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Department name is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    setFormError("");
    if (!validate()) return;

    setSaving(true);
    const res = await createDepartmentAction({
      name: name.trim(),
      description: description.trim() || undefined,
      headId: headId || undefined,
      softLimit: softLimit > 0 ? softLimit : undefined,
    });

    const resError = "error" in res ? res.error : null;
    if (resError) {
      setSaving(false);
      setFormError(
        typeof resError === "string"
          ? resError
          : (resError as { message?: string })?.message ?? "Unable to create department"
      );
      return;
    }

    setSaving(false);
    onClose();
    router.refresh();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" role="dialog" aria-modal="true" aria-label="Add department">
      <div className="bg-(--surface) border border-(--border) rounded-(--r-card) shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-(--border)">
          <div>
            <p className="text-[15px] font-semibold">Add Department</p>
            <p className="text-[12px] text-(--muted)">Create a new department</p>
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
            <label className="block text-[12px] font-medium mb-1.5">Department Name <span className="text-danger">*</span></label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Youth Ministry"
              className={cn("w-full px-3 py-2.5 text-[13px] bg-(--surface) border rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) placeholder:text-(--muted) transition-colors", errors.name ? "border-danger" : "border-(--border)")} />
            {errors.name && <p className="text-[11px] text-danger mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-[12px] font-medium mb-1.5">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Department purpose..." rows={2}
              className="w-full px-3 py-2.5 text-[13px] bg-(--surface) border border-(--border) rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) placeholder:text-(--muted) transition-colors resize-none" />
          </div>

          <div>
            <label className="block text-[12px] font-medium mb-1.5">Department Head</label>
            <select value={headId} onChange={(e) => setHeadId(e.target.value)}
              className="w-full px-3 py-2.5 text-[13px] bg-(--surface) border border-(--border) rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) transition-colors">
              <option value="">Select head (optional)</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-medium mb-1.5">Annual Soft Limit <span className="text-(--muted) font-normal">(optional)</span></label>
            <input type="number" min={0} value={softLimit || ""} onChange={(e) => setSoftLimit(Number.parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="w-full px-3 py-2.5 text-[13px] bg-(--surface) border border-(--border) rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) placeholder:text-(--muted) transition-colors font-mono" />
            {softLimit > 0 && (
              <p className="text-[11px] text-(--muted) mt-1">Warning at {formatCurrency(softLimit)}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-(--border)">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSubmit} loading={saving}>
            <Plus size={13} /> Create Department
          </Button>
        </div>
      </div>
    </div>
  );
}