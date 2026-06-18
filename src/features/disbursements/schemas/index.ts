import { z } from "zod";

export const CreateDisbursementSchema = z.object({
  budgetId: z.string(),
  accountId: z.string().min(1, "Account is required"),
  description: z.string().min(1, "Description is required"),
  totalAmount: z.number().positive("Amount must be positive"),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        description: z.string().min(1, "Item description is required"),
        amount: z.number().positive("Item amount must be positive"),
        budgetItemId: z.string().optional(),
      })
    )
    .min(1, "At least one line item is required"),
});

export const ReleaseDisbursementSchema = z.object({
  disbursementId: z.string(),
});

export type CreateDisbursementInput = z.infer<typeof CreateDisbursementSchema>;
export type ReleaseDisbursementInput = z.infer<typeof ReleaseDisbursementSchema>;