import { z } from "zod";

export const BudgetItemSchema = z.object({
  id: z.string().optional(),
  categoryId: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().positive("Quantity must be positive"),
  unitCost: z.number().positive("Unit cost must be positive"),
  notes: z.string().optional(),
});

export const CreateBudgetSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  departmentId: z.string().optional(),
  eventId: z.string().optional(),
  periodStart: z.coerce.date().optional(),
  periodEnd: z.coerce.date().optional(),
  items: z.array(BudgetItemSchema).min(1, "At least one budget item is required"),
});

export const UpdateBudgetSchema = CreateBudgetSchema.partial();

export const ReviewBudgetSchema = z.object({
  budgetId: z.string(),
  decision: z.enum(["approved", "rejected", "needs_changes"]),
  comment: z.string().optional(),
  approvalType: z.enum(["finance", "chairperson"]),
});

export type CreateBudgetInput = z.infer<typeof CreateBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof UpdateBudgetSchema>;
export type ReviewBudgetInput = z.infer<typeof ReviewBudgetSchema>;
