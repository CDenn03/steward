import { z } from "zod";

export const UpdateMembershipSchema = z.object({
  role: z
    .enum(["ADMIN", "CHAIRPERSON", "FINANCE", "DEPARTMENT_HEAD", "MEMBER"])
    .optional(),
  departmentId: z.string().nullable().optional(),
});

export const CreateOrganizationSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  currency: z.string().length(3).default("KES"),
  fiscalYearStart: z
    .string()
    .regex(/^\d{2}-\d{2}$/, "Must be in MM-DD format")
    .default("01-01"),
});

export type UpdateMembershipInput = z.infer<typeof UpdateMembershipSchema>;
export type CreateOrganizationInput = z.infer<typeof CreateOrganizationSchema>;
