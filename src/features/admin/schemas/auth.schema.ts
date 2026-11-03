import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .pipe(z.email("Enter a valid email address").max(255)),
  password: z
    .string()
    .trim()
    .min(8, "Password must be at least 8 characters")
    .max(255, "Password must be less than 255 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;
