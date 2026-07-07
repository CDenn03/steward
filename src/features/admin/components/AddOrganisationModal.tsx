"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { createOrganizationAction } from "@/features/admin/actions";
import { CreateOrganizationSchema } from "@/features/admin/schemas";
import type { CreateOrganizationInput } from "@/features/admin/schemas";
import type { CreateOrganizationResult } from "@/features/admin/actions";

interface AddOrganizationModalProps {
  open: boolean;
  onClose: () => void;
}

const defaultValues: CreateOrganizationInput = {
  name: "",
  slug: "",
  description: "",
};

export default function AddOrganizationModal({
  open,
  onClose,
}: AddOrganizationModalProps) {
  const router = useRouter();
  const [formError, setFormError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateOrganizationInput>({
    resolver: zodResolver(CreateOrganizationSchema),
    defaultValues,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const handleClose = () => {
    if (isSubmitting) return;
    reset(defaultValues);
    setFormError("");
    onClose();
  };

  const onSubmit = async (data: CreateOrganizationInput) => {
    setFormError("");

    try {
      const result: CreateOrganizationResult =
        await createOrganizationAction(data);

      if (!result.success) {
        setFormError(result.error.message);
        return;
      }

      reset(defaultValues);
      setFormError("");
      onClose();
      router.refresh();
    } catch {
      setFormError("Something went wrong. Please try again.");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) handleClose();
      }}
    >
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Onboard Organisation</DialogTitle>
          </DialogHeader>

          <DialogBody>
            {formError && (
              <div
                role="alert"
                aria-live="polite"
                className="rounded-(--r-card) border border-red-200 bg-danger-bg px-4 py-3 text-[13px] text-danger"
              >
                {formError}
              </div>
            )}

            <Input
              label="Organisation Name"
              placeholder="e.g. Grace Community Church"
              {...register("name")}
              error={errors.name?.message}
            />

            <Input
              label="Slug"
              placeholder="grace-community"
              className="font-mono"
              {...register("slug")}
              error={errors.slug?.message}
            />

            <Textarea
              label="Description"
              placeholder="Brief description of the organisation"
              rows={3}
              {...register("description")}
              error={errors.description?.message}
            />
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
              <Plus size={13} />
              Onboard
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
