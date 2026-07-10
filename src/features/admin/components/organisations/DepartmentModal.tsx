"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil } from "lucide-react";
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
} from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { createDepartmentAction, updateDepartmentAction } from "@/features/admin/actions";
import { CreateDepartmentSchema, UpdateDepartmentSchema } from "@/features/admin/schemas";
import type { DepartmentActionResult } from "@/features/admin/actions";

type AddFormValues = z.infer<typeof CreateDepartmentSchema>;
type EditFormValues = z.infer<typeof UpdateDepartmentSchema>;

interface DepartmentModalProps {
  open: boolean;
  onClose: () => void;
  mode?: "add" | "edit";
  organizationId: string;
  departmentId?: string;
  initialData?: {
    name: string;
    description: string | null;
  };
}

interface AddFormProps {
  organizationId: string;
  onClose: () => void;
}

function AddForm({ organizationId, onClose }: Readonly<AddFormProps>) {
  const router = useRouter();
  const [formError, setFormError] = useState("");

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<AddFormValues>({
      resolver: zodResolver(CreateDepartmentSchema),
      defaultValues: { name: "", description: "" },
      mode: "onBlur",
      reValidateMode: "onChange",
    });

  const handleClose = () => {
    if (isSubmitting) return;
    reset({ name: "", description: "" });
    setFormError("");
    onClose();
  };

  const onSubmit = async (data: AddFormValues) => {
    setFormError("");
    const result: DepartmentActionResult = await createDepartmentAction(organizationId, data);
    if (!result.success) {
      setFormError(result.error.message);
      return;
    }
    reset({ name: "", description: "" });
    onClose();
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DialogHeader>
        <DialogTitle>New Department</DialogTitle>
      </DialogHeader>
      <DialogBody>
        {formError && (
          <div role="alert" aria-live="polite"
            className="rounded-(--r-card) border border-red-200 bg-danger-bg px-4 py-3 text-[14px] text-danger">
            {formError}
          </div>
        )}
        <Input
          label="Department Name"
          placeholder="e.g. Finance, Education, Outreach"
          {...register("name")}
          error={errors.name?.message}
        />
        <Textarea
          label="Description"
          placeholder="Brief description of the department"
          rows={3}
          {...register("description")}
          error={errors.description?.message}
        />
      </DialogBody>
      <DialogFooter>
        <Button type="button" variant="ghost" size="sm" onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" size="sm" loading={isSubmitting}>
          <Plus size={13} />
          Create Department
        </Button>
      </DialogFooter>
    </form>
  );
}

interface EditFormProps {
  organizationId: string;
  departmentId: string;
  initialData: { name: string; description: string | null };
  onClose: () => void;
}

function EditForm({ organizationId, departmentId, initialData, onClose }: Readonly<EditFormProps>) {
  const router = useRouter();
  const [formError, setFormError] = useState("");

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<EditFormValues>({
      resolver: zodResolver(UpdateDepartmentSchema),
      defaultValues: {
        name: initialData.name,
        description: initialData.description ?? "",
      },
      mode: "onBlur",
      reValidateMode: "onChange",
    });

  useEffect(() => {
    reset({
      name: initialData.name,
      description: initialData.description ?? "",
    });
  }, [initialData.name, initialData.description, reset]);

  const handleClose = () => {
    if (isSubmitting) return;
    reset({ name: initialData.name, description: initialData.description ?? "" });
    setFormError("");
    onClose();
  };

  const onSubmit = async (data: EditFormValues) => {
    setFormError("");
    const result: DepartmentActionResult = await updateDepartmentAction(departmentId, organizationId, data);
    if (!result.success) {
      setFormError(result.error.message);
      return;
    }
    onClose();
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DialogHeader>
        <DialogTitle>Edit Department</DialogTitle>
      </DialogHeader>
      <DialogBody>
        {formError && (
          <div role="alert" aria-live="polite"
            className="rounded-(--r-card) border border-red-200 bg-danger-bg px-4 py-3 text-[14px] text-danger">
            {formError}
          </div>
        )}
        <Input
          label="Department Name"
          placeholder="e.g. Finance, Education, Outreach"
          {...register("name")}
          error={errors.name?.message}
        />
        <Textarea
          label="Description"
          placeholder="Brief description of the department"
          rows={3}
          {...register("description")}
          error={errors.description?.message}
        />
      </DialogBody>
      <DialogFooter>
        <Button type="button" variant="ghost" size="sm" onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" size="sm" loading={isSubmitting}>
          <Pencil size={13} />
          Save Changes
        </Button>
      </DialogFooter>
    </form>
  );
}


export default function DepartmentModal({
  open,
  onClose,
  mode = "add",
  organizationId,
  departmentId,
  initialData,
}: Readonly<DepartmentModalProps>) {
  const isEdit = mode === "edit";

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
      <DialogContent>
        {isEdit && departmentId && initialData ? (
          <EditForm
            organizationId={organizationId}
            departmentId={departmentId}
            initialData={initialData}
            onClose={onClose}
          />
        ) : (
          <AddForm
            organizationId={organizationId}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
