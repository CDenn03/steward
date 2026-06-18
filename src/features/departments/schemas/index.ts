import { z } from "zod";

export const CreateDepartmentSchema = z.object({
  name: z.string().min(1, "Department name is required").max(100),
  description: z.string().optional(),
  headId: z.string().optional(),
  softLimit: z.number().min(0).optional(),
});

export const UpdateDepartmentSchema = CreateDepartmentSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const SetDepartmentAllocationSchema = z.object({
  departmentId: z.string(),
  fiscalYear: z.number().int().min(2020).max(2100),
  amount: z.number().min(0, "Allocation must be positive"),
});

export type CreateDepartmentInput = z.infer<typeof CreateDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof UpdateDepartmentSchema>;
export type SetDepartmentAllocationInput = z.infer<typeof SetDepartmentAllocationSchema>;