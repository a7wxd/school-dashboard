// src/lib/validation/subject-teacher.ts
import { z } from "zod";

export const subjectTeacherSchema = z.object({
  teacherId: z.string().min(1),
});

export type SubjectTeacherInput = z.infer<typeof subjectTeacherSchema>;
