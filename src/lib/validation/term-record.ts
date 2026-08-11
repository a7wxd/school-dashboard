// src/lib/validation/term-record.ts
import { z } from "zod";

const gradeField = z.number().int().min(1).max(9).nullable().optional();

export const updateTermRecordSchema = z.object({
  currentGrade: gradeField,
  workingAtGrade: gradeField,
  targetGrade: gradeField,
  // Only meaningful when sent by an admin overriding the auto-derived value —
  // enforced server-side via the PREDICTED_GRADE_OVERRIDE permission, not here.
  predictedGrade: gradeField,
  behaviourRating: z
    .enum(["OUTSTANDING", "GOOD", "REQUIRES_IMPROVEMENT", "CAUSE_FOR_CONCERN"])
    .nullable()
    .optional(),
  attitudeToLearning: z
    .enum(["EXCELLENT", "GOOD", "REQUIRES_IMPROVEMENT", "CAUSE_FOR_CONCERN"])
    .nullable()
    .optional(),
  attendancePercent: z.number().min(0).max(100).nullable().optional(),
  teacherComment: z.string().max(2000).nullable().optional(),
  additionalNotes: z.string().max(2000).nullable().optional(),
  teacherAssessment: z.string().max(1000).nullable().optional(),
});

export type UpdateTermRecordInput = z.infer<typeof updateTermRecordSchema>;
