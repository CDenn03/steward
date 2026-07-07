"use client";

import { useState} from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createOrganizationAction } from "@/features/admin/actions";
import { CreateOrganizationSchema } from "@/features/admin/schemas";

interface AddOrganizationModalProps {
  open: boolean;
  onClose: () => void;
}

const initialForm = { name: "", slug: "", description: "" };
type Field = keyof typeof initialForm;

function fieldErrors(form: typeof initialForm): Record<string, string> {
  const result = CreateOrganizationSchema.safeParse(form);
  if (result.success) return {};

  const errs: Record<string, string> = {};
  for (const [key, messages] of Object.entries(result.error.flatten().fieldErrors)) {
    if (messages?.length) errs[key] = messages[0];
  }
  return errs;
}

export default function AddOrganizationModal({ open, onClose }: AddOrganizationModalProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [touched, setTouched] = useState<Set<Field>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");

  const setField = (field: Field) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleBlur = (field: Field) => () => {
    setTouched((prev) => {
      if (prev.has(field)) return prev;
      const next = new Set(prev);
      next.add(field);
      return next;
    });
    setErrors((prev) => {
      const all = { ...prev, ...fieldErrors(form) };
      return all;
    });
  };

  const handleSubmit = async () => {
    setFormError("");
    const allTouched = new Set<Field>(["name", "slug", "description"]);
    setTouched(allTouched);

    const errs = fieldErrors(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    const res = await createOrganizationAction(form);

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
    setForm(initialForm);
    setTouched(new Set());
    setErrors({});
    onClose();
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Onboard Organisation</DialogTitle>
        </DialogHeader>

        <DialogBody>
          {formError && (
            <div className="rounded-(--r-card) border border-red-200 bg-danger-bg px-4 py-3 text-[13px] text-danger">
              {formError}
            </div>
          )}

          <Input
            label="Organisation Name"
            placeholder="e.g. Grace Community Church"
            value={form.name}
            onChange={setField("name")}
            onBlur={handleBlur("name")}
            error={touched.has("name") ? errors.name : undefined}
          />

          <Input
            label="Slug"
            placeholder="grace-community"
            value={form.slug}
            onChange={setField("slug")}
            onBlur={handleBlur("slug")}
            error={touched.has("slug") ? errors.slug : undefined}
            className="font-mono"
          />

          <Textarea
            label="Description"
            placeholder="Brief description of the organisation"
            value={form.description}
            onChange={setField("description")}
            onBlur={handleBlur("description")}
            rows={3}
            error={touched.has("description") ? errors.description : undefined}
          />
        </DialogBody>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} loading={saving}>
            <Plus size={13} /> Onboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
