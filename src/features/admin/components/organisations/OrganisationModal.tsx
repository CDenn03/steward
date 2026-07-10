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
import { FileUpload } from '@/components/shared/FileUpload';
import {
  createOrganizationAction,
  updateOrganizationAction,
  getOrgLogoUploadUrlAction,
  saveOrgCreationUploadAction,
} from "@/features/admin/actions";
import { CreateOrganizationSchema, UpdateOrganizationSchema } from "@/features/admin/schemas";
import type { CreateOrganizationResult, UpdateOrganizationResult } from "@/features/admin/actions";

type AddFormValues = z.input<typeof CreateOrganizationSchema>;
type EditFormValues = z.input<typeof UpdateOrganizationSchema>;

interface OrganisationModalProps {
  open: boolean;
  onClose: () => void;
  mode?: "add" | "edit";
  organizationId?: string;
  initialData?: {
    name: string;
    description: string;
    logoUrl: string | null;
    timezone: string;
  };
}

const addDefaults: AddFormValues = {
  name: "",
  slug: "",
  description: "",
  currency: "KES",
  fiscalYearStart: "01-01",
  logoUrl: null,
  timezone: "Africa/Nairobi",
};

export default function OrganisationModal({
  open,
  onClose,
  mode = "add",
  organizationId,
  initialData,
}: OrganisationModalProps) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const [formError, setFormError] = useState("");
  const [logoKey, setLogoKey] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddFormValues | EditFormValues>({
    resolver: zodResolver(isEdit ? UpdateOrganizationSchema : CreateOrganizationSchema),
    defaultValues: isEdit
      ? {
          name: initialData?.name ?? "",
          description: initialData?.description ?? "",
          logoUrl: initialData?.logoUrl ?? null,
          timezone: initialData?.timezone ?? "Africa/Nairobi",
        }
      : addDefaults,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  useEffect(() => {
    if (!open) return;
    if (isEdit && initialData) {
      reset({
        name: initialData.name,
        description: initialData.description,
        logoUrl: initialData.logoUrl,
        timezone: initialData.timezone,
      });
    } else {
      reset(addDefaults);
    }
  }, [open, isEdit, initialData, reset]);

  const handleClose = () => {
    if (isSubmitting) return;
    reset(isEdit ? { name: "", description: "", logoUrl: null, timezone: "Africa/Nairobi" } : addDefaults);
    setFormError("");
    setLogoKey(null);
    onClose();
  };

  const onSubmit = async (data: AddFormValues | EditFormValues) => {
    setFormError("");

    try {
      let result: CreateOrganizationResult | UpdateOrganizationResult;

      if (isEdit && organizationId) {
        result = await updateOrganizationAction(organizationId, {
          ...data,
          ...(logoKey ? { logoUrl: logoKey } : {}),
        });
      } else {
        result = await createOrganizationAction({
          ...data,
          ...(logoKey ? { logoUrl: logoKey } : {}),
        });
      }

      if (!result.success) {
        setFormError(result.error.message);
        return;
      }

      reset(isEdit ? { name: "", description: "", logoUrl: null, timezone: "Africa/Nairobi" } : addDefaults);
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
            <DialogTitle>{isEdit ? "Edit Organisation" : "Onboard Organisation"}</DialogTitle>
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

            {!isEdit && (
              <Input
                label="Slug"
                placeholder="grace-community"
                className="font-mono"
                {...register("slug" as keyof AddFormValues)}
                error={(errors as Record<string, { message?: string }>).slug?.message}
              />
            )}

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
              {isEdit ? <Pencil size={13} /> : <Plus size={13} />}
              {isEdit ? "Save Changes" : "Onboard"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
