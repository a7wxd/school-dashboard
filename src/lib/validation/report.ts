// src/lib/validation/report.ts
import { z } from "zod";

export const generateReportSchema = z
  .object({
    studentId: z.string().min(1),
    type: z.enum(["TERM", "END_OF_YEAR"]).default("TERM"),
    term: z.enum(["TERM_1", "TERM_2", "TERM_3"]).optional(),
  })
  .refine((data) => data.type === "END_OF_YEAR" || !!data.term, {
    message: "Select a term for a term report",
    path: ["term"],
  });

export const updateReportContentSchema = z.object({
  praise: z.string().max(2000).optional(),
  causesForConcern: z.string().max(2000).optional(),
  targets: z.string().max(2000).optional(),
});

export type GenerateReportInput = z.infer<typeof generateReportSchema>;
export type UpdateReportContentInput = z.infer<typeof updateReportContentSchema>;
