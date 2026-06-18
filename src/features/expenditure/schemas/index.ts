import { z } from "zod";

export const CreateExpenditureReportSchema = z.object({
  budgetId: z.string().min(1, "Budget is required"),
  title: z.string().min(1, "Title is required").max(200),
  notes: z.string().optional(),
});

export const UploadReceiptSchema = z.object({
  expenditureReportId: z.string().min(1),
  storageKey: z.string().min(1),
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().positive(),
  amount: z.number().nonnegative(),
  vendor: z.string().optional(),
  receiptDate: z.coerce.date(),
  notes: z.string().optional(),
});

export const AllocateReceiptSchema = z.object({
  allocations: z
    .array(
      z.object({
        receiptId: z.string().min(1),
        budgetItemId: z.string().min(1),
        amount: z.number().positive("Allocation amount must be positive"),
      })
    )
    .min(1, "At least one allocation is required"),
});

export const SubmitExpenditureReportSchema = z.object({
  expenditureReportId: z.string().min(1),
});

export type CreateExpenditureReportInput = z.infer<typeof CreateExpenditureReportSchema>;
export type UploadReceiptInput = z.infer<typeof UploadReceiptSchema>;
export type AllocateReceiptInput = z.infer<typeof AllocateReceiptSchema>;
