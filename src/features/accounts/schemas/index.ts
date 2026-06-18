import { z } from "zod";

export const CreateAccountSchema = z.object({
  name: z.string().min(1, "Account name is required").max(100),
  type: z.enum(["BANK", "MPESA", "CASH", "SAVINGS", "PROJECT"]),
  provider: z.string().optional(),
  accountNumber: z.string().optional(),
  description: z.string().optional(),
  openingBalance: z.number().default(0),
  isRestricted: z.boolean().default(false),
});

export type CreateAccountInput = z.infer<typeof CreateAccountSchema>;