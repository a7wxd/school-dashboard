// src/lib/validation/teacher.ts
import { z } from "zod";

export const createTeacherSchema = z.object({
  fullName: z.string().min(2, "Enter the teacher's full name"),
  email: z.string().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must include an uppercase letter")
    .regex(/[0-9]/, "Password must include a number"),
  subjectIds: z.array(z.string()).default([]),
});

export const updateTeacherSchema = z.object({
  fullName: z.string().min(2).optional(),
  isActive: z.boolean().optional(),
  subjectIds: z.array(z.string()).optional(),
});

export type CreateTeacherInput = z.infer<typeof createTeacherSchema>;
export type UpdateTeacherInput = z.infer<typeof updateTeacherSchema>;
