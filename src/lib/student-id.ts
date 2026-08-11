// src/lib/student-id.ts
import { prisma } from "./prisma";

/** Generates the next sequential Student ID for the current calendar year, e.g. "STU2026-0148". */
export async function generateStudentId(): Promise<string> {
  const prefix = `STU${new Date().getFullYear()}-`;

  const last = await prisma.student.findFirst({
    where: { studentId: { startsWith: prefix } },
    orderBy: { studentId: "desc" },
    select: { studentId: true },
  });

  const nextNumber = last ? parseInt(last.studentId.split("-")[1], 10) + 1 : 1;
  return `${prefix}${String(nextNumber).padStart(4, "0")}`;
}
