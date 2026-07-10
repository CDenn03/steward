"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
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
import { FileUpload } from '@/components/shared/FileUpload';
import { createOrganizationAction, getOrgLogoUploadUrlAction, saveOrgCreationUploadAction } from "@/features/admin/actions";
import { CreateOrganizationSchema } from "@/features/admin/schemas";
import type { CreateOrganizationResult } from "@/features/admin/actions";

type FormValues = z.input<typeof CreateOrganizationSchema>;

interface AddOrganizationModalProps {
  open: boolean;
  onClose: () => void;
}

const defaultValues: FormValues = {
  name: "",
  slug: "",
  description: "",
  currency: "KES",
  fiscalYearStart: "01-01",
  logoUrl: null,
  timezone: "Africa/Nairobi",
};

export default function AddOrganizationModal({
  open,
  onClose,
}: AddOrganizationModalProps) {
  const router = useRouter();
  const [formError, setFormError] = useState("");
  const [logoKey, setLogoKey] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(CreateOrganizationSchema),
    defaultValues,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const handleClose = () => {
    if (isSubmitting) return;
    reset(defaultValues);
    setFormError("");
    setLogoKey(null);
    onClose();
  };

  const onSubmit = async (data: FormValues) => {
    setFormError("");

    try {
      const result: CreateOrganizationResult =
        await createOrganizationAction({ ...data, ...(logoKey ? { logoUrl: logoKey } : {}) });

      if (!result.success) {
        setFormError(result.error.message);
        return;
      }

      reset(defaultValues);
      setFormError("");
      setLogoKey(null);
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
                className="rounded-(--r-card) border border-red-200 bg-danger-bg px-4 py-3 text-[14px] text-danger"
              >
                {formError}
              </div>
            )}

            <FileUpload
              accept="image/png,image/jpeg,image/webp"
              label="Upload Logo"
              description="PNG, JPEG or WebP, max 10 MB"
              getUploadUrl={getOrgLogoUploadUrlAction}
              saveKey={saveOrgCreationUploadAction}
              onCompleted={(key) => setLogoKey(key)}
            />

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
