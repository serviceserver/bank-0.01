// lib/validators/auth.validators.ts

import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters."),
  email: z.string().email("Invalid email address."),
  phone: z
    .string()
    .regex(/^(\+1)?[2-9]\d{2}[2-9]\d{6}$/, "Invalid US phone number. Use format: 2125551234"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/[0-9]/, "Password must contain at least one number."),
  ssn: z.string().regex(/^\d{9}$/, "SSN must be exactly 9 digits.").optional(),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be in YYYY-MM-DD format.").optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().length(2, "State must be a 2-letter code (e.g. NY, CA).").optional(),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code.").optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(1, "Password is required."),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
