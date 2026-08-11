// src/lib/validation/student.ts
import { z } from "zod";

export const parentContactSchema = z.object({
  name: z.string().min(2, "Enter the contact's name"),
  relationship: z.string().min(1, "Enter the relationship, e.g. Mother, Guardian"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().optional(),
  isPrimaryContact: z.boolean().default(false),
});

export const createStudentSchema = z.object({
  firstName: z.string().min(1, "Enter a first name"),
  lastName: z.string().min(1, "Enter a last name"),
  yearGroup: z.enum(["Y7", "Y8", "Y9", "Y10", "Y11"]),
  dateOfBirth: z.string().optional(), // ISO date string from a <input type="date">
  satsReadingScore: z.coerce.number().int().min(0).max(120).optional(),
  satsMathsScore: z.coerce.number().int().min(0).max(120).optional(),
  senStatus: z.enum(["NONE", "SEN_SUPPORT", "EHCP"]).default("NONE"),
  senNotes: z.string().optional(),
  causeForConcern: z.boolean().default(false),
  causeForConcernReason: z.string().optional(),
  parentContacts: z.array(parentContactSchema).min(1, "Add at least one parent/guardian contact"),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
