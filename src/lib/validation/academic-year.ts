// src/lib/validation/academic-year.ts
import { z } from "zod";

export const academicYearSchema = z.object({
  label: z.string().min(4, "e.g. 2026/2027"),
  term1Start: z.string().min(1),
  term1End: z.string().min(1),
  term2Start: z.string().min(1),
  term2End: z.string().min(1),
  term3Start: z.string().min(1),
  term3End: z.string().min(1),
});

export type AcademicYearInput = z.infer<typeof academicYearSchema>;
