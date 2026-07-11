"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { toast } from "sonner";
import { useEffect } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody
} from "@/components/ui/Dialog";

import { Input } from "@/components/ui/Input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { CreatePlatformUserSchema } from "@/features/admin/schemas/index";
import { createPlatformUserAction } from "@/features/admin/actions";
import { Button } from "@/components/ui/Button";

type CreatePlatformUserInput = z.infer<typeof CreatePlatformUserSchema>;
interface CreatePlatformUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizations: {
    id: string;
    name: string;
  }[];
}
export function CreatePlatformUserModal({
  open,
  onOpenChange,
  organizations,
}: Readonly<CreatePlatformUserModalProps>) {
  const router = useRouter();
  const form = useForm<CreatePlatformUserInput>({
    resolver: zodResolver(CreatePlatformUserSchema),
    defaultValues: {
      name: "",
      email: "",
      organizationId: "",
      role: "MEMBER",
    },
  });

  useEffect(() => {
    if (open) {
      const timer = setInterval(() => {
        if (document.body.style.pointerEvents === "none") {
          document.body.style.pointerEvents = "";
        }
      }, 100);

      return () => clearInterval(timer);
    }
  }, [open]);
  async function onSubmit(values: CreatePlatformUserInput) {
    try {
      const result = await createPlatformUserAction(values);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("User created successfully");
      form.reset();
      router.refresh();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create user");
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-8">
        <DialogHeader>
          <DialogTitle>Create Platform User</DialogTitle>
        </DialogHeader>
        <DialogBody>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div>
            <Input placeholder="Full name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          {/* Email */}
          <div>
            <Input
              type="email"
              placeholder="Email address"
              {...form.register("email")}
            />

            {form.formState.errors.email && (
              <p className="text-sm text-red-500">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>
          {/* Password */}
          {/* <div>
            <Input
              type="password"
              placeholder="Password"
              {...form.register("password")}
            />

            {form.formState.errors.password && (
              <p className="text-sm text-red-500">
                {form.formState.errors.password.message}
              </p>
            )}
          </div> */}

          {/* Confirm Password */}
          {/* <div>
            <Input
              type="password"
              placeholder="Confirm password"
              {...form.register("confirmPassword")}
            />
            {form.formState.errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div> */}
          {/* Organization */}
          <div>
            <Controller
              control={form.control}
              name="organizationId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select organisation" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.organizationId && (
              <p className="text-sm text-red-500">
                {form.formState.errors.organizationId.message}
              </p>
            )}
          </div>
          {/* Role */}
          <div>
            <Controller
              control={form.control}
              name="role"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="PLATFORM_ADMIN">
                      Platform Admin
                    </SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="CHAIRPERSON">Chairperson</SelectItem>
                    <SelectItem value="FINANCE">Finance</SelectItem>
                    <SelectItem value="DEPARTMENT_HEAD">
                      Department Head
                    </SelectItem>
                    <SelectItem value="MEMBER">Member</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full"
          >
            {form.formState.isSubmitting ? "Creating..." : "Create User"}
          </Button>
        </form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
