"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select";
import { addMemberAction } from "@/features/admin/actions";
import { AddMemberSchema } from "@/features/admin/schemas";

type FormValues = z.infer<typeof AddMemberSchema>;
type FormInput = z.input<typeof AddMemberSchema>;

const ROLE_OPTIONS = [
  { value: "MEMBER",          label: "Member" },
  { value: "ADMIN",           label: "Admin" },
  { value: "CHAIRPERSON",     label: "Chairperson" },
  { value: "FINANCE",         label: "Finance" },
  { value: "DEPARTMENT_HEAD", label: "Dept. Head" },
] as const;

interface AddMemberModalProps {
  open: boolean;
  onClose: () => void;
  organizationId: string;
  departments: Array<{ id: string; name: string }>;
}

const defaults: FormValues = {
  name: "",
  email: "",
  role: "MEMBER",
  departmentId: null,
};

export function AddMemberModal({
  open,
  onClose,
  organizationId,
  departments,
}: Readonly<AddMemberModalProps>) {
  const router = useRouter();
  const [formError, setFormError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(AddMemberSchema),
    defaultValues: defaults,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const roleValue = watch("role") ?? "MEMBER";
  const deptValue = watch("departmentId");

  useEffect(() => {
    if (open) {
      reset(defaults);
      setFormError("");
    }
  }, [open, reset]);

  const handleClose = () => {
    if (isSubmitting) return;
    reset(defaults);
    setFormError("");
    onClose();
  };

  const onSubmit = async (data: FormValues) => {
    setFormError("");
    const result = await addMemberAction(organizationId, data);
    if (!result.success) {
      setFormError(result.error.message);
      return;
    }
    reset(defaults);
    onClose();
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) handleClose(); }}>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Add Member</DialogTitle>
          </DialogHeader>

          <DialogBody>
            {formError && (
              <div
                role="alert"
                aria-live="polite"
                className="rounded-(--r-card) border border-red-200 bg-danger-bg px-4 py-3 text-[14px] text-danger"
              >
                {formError}
              </div>
            )}

            <Input
              label="Full name"
              type="text"
              placeholder="Jane Doe"
              {...register("name")}
              error={errors.name?.message}
            />

            <Input
              label="Email address"
              type="email"
              placeholder="member@example.com"
              {...register("email")}
              error={errors.email?.message}
            />

            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-(--text)">Role</label>
              <Select
                value={roleValue}
                onValueChange={(v) =>
                  setValue("role", v as FormValues["role"], { shouldValidate: true })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-[12px] text-danger">{errors.role.message}</p>
              )}
            </div>

            {departments.length > 0 && (
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-(--text)">
                  Department{" "}
                  <span className="font-normal text-(--muted)">(optional)</span>
                </label>
                <Select
                  value={deptValue ?? "none"}
                  onValueChange={(v) =>
                    setValue("departmentId", v === "none" ? null : v, { shouldValidate: true })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No department</SelectItem>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={isSubmitting}>
              <UserPlus size={13} />
              Add Member
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
