import { z } from "zod";

export const CreateEventSchema = z.object({
  name: z.string().min(1, "Event name is required").max(200),
  departmentId: z.string().optional(),
  description: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  status: z.enum(["PLANNING", "ACTIVE", "COMPLETED", "CANCELLED"]).default("PLANNING"),
  isRecurring: z.boolean().default(false),
  recurrenceRule: z.string().optional(),
});

export type CreateEventInput = z.infer<typeof CreateEventSchema>;