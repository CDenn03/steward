import { z } from "zod";

export const UpdateMembershipSchema = z.object({
  role: z
    .enum(["ADMIN", "CHAIRPERSON", "FINANCE", "DEPARTMENT_HEAD", "MEMBER"])
    .optional(),
  departmentId: z.string().nullable().optional(),
});

const currencyCodes = [
  "KES", "USD", "EUR", "GBP", "UGX", "TZS",
] as const;

export const CreateOrganizationSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  description: z.string().min(1, "Description is required").max(500),
  currency: z.enum(currencyCodes).default("KES"),
  fiscalYearStart: z
    .string()
    .regex(/^\d{2}-\d{2}$/, "Must be in MM-DD format")
    .default("01-01"),
  logoUrl: z.string().nullable().optional(),
  timezone: z.string().default("Africa/Nairobi"),
});

export const UpdateOrganizationSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  currency: z.enum(currencyCodes).optional(),
  fiscalYearStart: z
    .string()
    .regex(/^\d{2}-\d{2}$/, "Must be in MM-DD format")
    .optional(),
  logoUrl: z.string().nullable().optional(),
  timezone: z.string().optional(),
});

export const CreateDepartmentSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
});

export const UpdateDepartmentSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).optional(),
  description: z.string().max(500).optional(),
  headId: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export const AddMemberSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email"),
  role: z.enum(["ADMIN", "CHAIRPERSON", "FINANCE", "DEPARTMENT_HEAD", "MEMBER"]).default("MEMBER"),
  departmentId: z.string().nullable().optional(),
});

export const UpdateMemberSchema = z.object({
  role: z.enum(["ADMIN", "CHAIRPERSON", "FINANCE", "DEPARTMENT_HEAD", "MEMBER"]).optional(),
  departmentId: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email"),
});

export const CreateMembershipSchema = z.object({
  userId: z.string().min(1, "User is required"),
  organizationId: z.string().min(1, "Organisation is required"),
  role: z.enum(["PLATFORM_ADMIN", "ADMIN", "CHAIRPERSON", "FINANCE", "DEPARTMENT_HEAD", "MEMBER"]),
});

export type UpdateMembershipInput = z.infer<typeof UpdateMembershipSchema>;
export type CreateOrganizationInput = z.infer<typeof CreateOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof UpdateOrganizationSchema>;
export type CreateDepartmentInput = z.infer<typeof CreateDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof UpdateDepartmentSchema>;
export type AddMemberInput = z.infer<typeof AddMemberSchema>;
export type UpdateMemberInput = z.infer<typeof UpdateMemberSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type CreateMembershipInput = z.infer<typeof CreateMembershipSchema>;
