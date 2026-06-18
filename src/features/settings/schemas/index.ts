import { z } from "zod";

export const UpdateOrganizationSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  currency: z.string().length(3).optional(),
  fiscalYearStart: z
    .string()
    .regex(/^\d{2}-\d{2}$/, "Must be in MM-DD format")
    .optional(),
});

export const UpdateUserProfileSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
});

export type UpdateOrganizationInput = z.infer<typeof UpdateOrganizationSchema>;
export type UpdateUserProfileInput = z.infer<typeof UpdateUserProfileSchema>;
