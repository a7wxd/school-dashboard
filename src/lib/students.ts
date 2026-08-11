// src/lib/students.ts
// Service layer for student creation — kept out of the API route so the same
// logic can be reused (e.g. by a future CSV import feature) without duplication.

import { prisma } from "./prisma";
import { generateStudentId } from "./student-id";
import type { CreateStudentInput } from "./validation/student";

/**
 * Creates a student, their parent contacts, and — per the data-integrity rules
 * in ARCHITECTURE.md §10 — auto-enrols them in every active subject that
 * applies to their year group for the current academic year, with all three
 * Term records (T1/T2/T3) pre-created (empty) so the term structure always
 * exists. Enrolments start with no assigned teacher (teacherId is nullable);
 * that's assigned later via Subjects/Settings.
 */
export async function createStudentWithEnrolments(
  input: CreateStudentInput,
  createdById: string
) {
  const studentId = await generateStudentId();

  const currentAcademicYear = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
  if (!currentAcademicYear) {
    throw new Error("No current academic year is configured. Set one in Settings first.");
  }

  const applicableSubjects = await prisma.subject.findMany({
    where: { isActive: true, appliesToYearGroups: { has: input.yearGroup } },
  });

  return prisma.$transaction(async (tx) => {
    const student = await tx.student.create({
      data: {
        studentId,
        firstName: input.firstName,
        lastName: input.lastName,
        yearGroup: input.yearGroup,
        dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
        satsReadingScore: input.satsReadingScore,
        satsMathsScore: input.satsMathsScore,
        senStatus: input.senStatus,
        senNotes: input.senNotes,
        causeForConcern: input.causeForConcern,
        causeForConcernReason: input.causeForConcernReason,
        createdById,
        parentContacts: {
          create: input.parentContacts.map((p) => ({
            name: p.name,
            relationship: p.relationship,
            email: p.email,
            phone: p.phone,
            isPrimaryContact: p.isPrimaryContact,
          })),
        },
      },
    });

    for (const subject of applicableSubjects) {
      const enrolment = await tx.enrolment.create({
        data: {
          studentId: student.id,
          subjectId: subject.id,
          academicYearId: currentAcademicYear.id,
        },
      });

      await tx.termRecord.createMany({
        data: (["TERM_1", "TERM_2", "TERM_3"] as const).map((term) => ({
          enrolmentId: enrolment.id,
          term,
          enteredById: createdById, // placeholder "opener" until a teacher enters real grades
        })),
      });
    }

    return student;
  });
}
