import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
  password: z.string().optional().refine(
    (val) => val === undefined || val.length > 0,
    { message: "Password is required." }
  ),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const magicLinkSchema = loginSchema.pick({ email: true });

export type MagicLinkInput = z.infer<typeof magicLinkSchema>;