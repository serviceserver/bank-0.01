// lib/validators/admin.validators.ts

import { z } from "zod";

export const updateUserInfoSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters."),
  email: z.string().email("Invalid email address."),
  phone: z
    .string()
    .regex(/^(\+1)?[2-9]\d{2}[2-9]\d{6}$/, "Invalid US phone number. Use format: 2125551234"),
  dob: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be in YYYY-MM-DD format.")
    .optional()
    .or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  state: z
    .string()
    .length(2, "State must be a 2-letter code (e.g. NY, CA).")
    .optional()
    .or(z.literal("")),
  zip: z
    .string()
    .regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code.")
    .optional()
    .or(z.literal("")),
});

export const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/[0-9]/, "Password must contain at least one number."),
  confirmPassword: z.string().min(1, "Please confirm the new password."),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

export type UpdateUserInfoInput = z.infer<typeof updateUserInfoSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
