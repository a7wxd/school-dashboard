// src/lib/validation/subject.ts
import { z } from "zod";

export const createSubjectSchema = z.object({
  name: z.string().min(1, "Enter a subject name"),
  code: z.string().min(1, "Enter a short code, e.g. ENG-LANG").toUpperCase(),
  appliesToYearGroups: z.array(z.enum(["Y7", "Y8", "Y9", "Y10", "Y11"])).min(1, "Select at least one year group"),
});

export const updateSubjectSchema = z.object({
  name: z.string().min(1).optional(),
  appliesToYearGroups: z.array(z.enum(["Y7", "Y8", "Y9", "Y10", "Y11"])).min(1).optional(),
  isActive: z.boolean().optional(),
});

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;
