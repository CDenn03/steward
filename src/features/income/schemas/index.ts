import { z } from "zod";

export const RecordIncomeSchema = z.object({
  accountId: z.string().min(1, "Account is required"),
  category: z.enum(["TITHE", "OFFERING", "DONATION", "REGISTRATION", "FUNDRAISING", "GRANT", "OTHER"]),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().min(1, "Description is required"),
  notes: z.string().optional(),
  departmentId: z.string().optional(),
  eventId: z.string().optional(),
  receivedAt: z.coerce.date().default(() => new Date()),
});

export type RecordIncomeInput = z.infer<typeof RecordIncomeSchema>;
