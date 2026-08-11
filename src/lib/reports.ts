// src/lib/reports.ts
// Builds the frozen `contentSnapshot` a Report is generated with. Per
// ARCHITECTURE.md §6, this snapshot is what the PDF renders from and becomes
// immutable once the report is approved — later edits to the student's live
// data never retroactively change an already-approved report.
//
// Two builders: buildReportSnapshot() for a single-term report, and
// buildEndOfYearSnapshot() (Stage 9) which aggregates all three terms. Both
// produce the same ReportSnapshot shape so ReportPreview/ReportPdfDocument
// can render either one — the end-of-year version just fills in `termTrend`
// per subject and the year-level academic summary fields, and reuses the
// same fixed section order with relabelled headings (Praise → Strengths &
// Achievements, Targets → Recommendations) rather than inventing a different
// layout.

import { prisma } from "./prisma";
import { calculateAverageGrade, classifyProgress } from "./grades";

const TERM_LABELS: Record<string, string> = { TERM_1: "Term 1", TERM_2: "Term 2", TERM_3: "Term 3" };
const TERMS = ["TERM_1", "TERM_2", "TERM_3"] as const;

export interface ReportSubjectRow {
  subjectName: string;
  teacherName: string | null;
  currentGrade: number | null;
  workingAtGrade: number | null;
  predictedGrade: number | null;
  targetGrade: number | null;
  differenceFromTarget: number | null;
  teacherComment: string | null;
  // Only populated for end-of-year reports: this subject's Current Grade in
  // each term, so the trend across the year is visible at a glance.
  termTrend?: { term1: number | null; term2: number | null; term3: number | null };
}

export interface ReportSnapshot {
  type: "TERM" | "END_OF_YEAR";
  school: { name: string; logoUrl: string | null; primaryColour: string; secondaryColour: string };
  student: { id: string; studentId: string; fullName: string; yearGroup: string };
  academicYearLabel: string;
  termLabel: string; // "Term 2" for term reports, "End of Year" for end-of-year
  generatedAt: string;
  generatedByName: string;
  attendanceSummary: { overallPercent: number | null };
  behaviourSummary: { mostCommonRating: string | null };
  academicSummary: {
    averageGrade: number | null;
    overallProgress: string | null;
    // Only populated for end-of-year reports.
    yearStartAverage?: number | null;
    yearEndAverage?: number | null;
    improvement?: number | null;
  };
  subjects: ReportSubjectRow[];
  praise: string; // labelled "Strengths & Achievements" on end-of-year reports
  causesForConcern: string; // labelled "Recurring Concerns" on end-of-year reports
  targets: string; // labelled "Recommendations" on end-of-year reports
  teacherSignatureName: string;
  footerNote?: string;
}

async function loadStudentWithAllTerms(studentId: string) {
  const [student, academicYear, settings] = await Promise.all([
    prisma.student.findUnique({
      where: { id: studentId },
      include: {
        enrolments: {
          where: { academicYear: { isCurrent: true } },
          include: {
            subject: { select: { name: true } },
            teacher: { select: { fullName: true } },
            termRecords: { orderBy: { term: "asc" } },
          },
        },
      },
    }),
    prisma.academicYear.findFirst({ where: { isCurrent: true } }),
    prisma.schoolSettings.findFirst(),
  ]);

  if (!student) throw new Error("Student not found");
  if (!academicYear) throw new Error("No current academic year is configured");

  return { student, academicYear, settings };
}

function extractFooterNote(settings: { reportTemplateConfig: unknown } | null): string | undefined {
  const config = settings?.reportTemplateConfig as { footerNote?: string } | null | undefined;
  return config?.footerNote || undefined;
}

function buildSchoolAndStudentInfo(
  student: { id: string; studentId: string; firstName: string; lastName: string; yearGroup: string },
  settings: { schoolName: string; logoUrl: string | null; primaryColour: string; secondaryColour: string } | null
) {
  return {
    school: {
      name: settings?.schoolName ?? "School",
      logoUrl: settings?.logoUrl ?? null,
      primaryColour: settings?.primaryColour ?? "#1E3A8A",
      secondaryColour: settings?.secondaryColour ?? "#F59E0B",
    },
    student: {
      id: student.id,
      studentId: student.studentId,
      fullName: `${student.firstName} ${student.lastName}`,
      yearGroup: student.yearGroup,
    },
  };
}

export async function buildReportSnapshot(
  studentId: string,
  term: "TERM_1" | "TERM_2" | "TERM_3",
  generatedByName: string
): Promise<{ snapshot: ReportSnapshot; academicYearId: string }> {
  const { student, academicYear, settings } = await loadStudentWithAllTerms(studentId);

  const subjects: ReportSubjectRow[] = student.enrolments.map((e) => {
    const record = e.termRecords.find((tr) => tr.term === term);
    return {
      subjectName: e.subject.name,
      teacherName: e.teacher?.fullName ?? null,
      currentGrade: record?.currentGrade ?? null,
      workingAtGrade: record?.workingAtGrade ?? null,
      predictedGrade: record?.predictedGrade ?? null,
      targetGrade: record?.targetGrade ?? null,
      differenceFromTarget: record?.differenceFromTarget ?? null,
      teacherComment: record?.teacherComment ?? null,
    };
  });

  const averageGrade = calculateAverageGrade(subjects.map((s) => s.currentGrade));
  const overallDiff = calculateAverageGrade(subjects.map((s) => s.differenceFromTarget));
  const overallProgress = overallDiff !== null ? classifyProgress(Math.round(overallDiff)) : null;

  const behaviourCounts = new Map<string, number>();
  for (const e of student.enrolments) {
    const rating = e.termRecords.find((tr) => tr.term === term)?.behaviourRating;
    if (rating) behaviourCounts.set(rating, (behaviourCounts.get(rating) ?? 0) + 1);
  }
  const mostCommonRating = [...behaviourCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const attendanceValues = student.enrolments
    .map((e) => e.termRecords.find((tr) => tr.term === term)?.attendancePercent)
    .filter((v): v is NonNullable<typeof v> => v != null)
    .map((v) => Number(v));
  const overallAttendancePercent =
    attendanceValues.length > 0
      ? Math.round((attendanceValues.reduce((a, b) => a + b, 0) / attendanceValues.length) * 10) / 10
      : student.overallAttendance
      ? Number(student.overallAttendance)
      : null;

  const snapshot: ReportSnapshot = {
    type: "TERM",
    ...buildSchoolAndStudentInfo(student, settings),
    academicYearLabel: academicYear.label,
    termLabel: TERM_LABELS[term],
    generatedAt: new Date().toISOString(),
    generatedByName,
    attendanceSummary: { overallPercent: overallAttendancePercent },
    behaviourSummary: { mostCommonRating },
    academicSummary: { averageGrade, overallProgress },
    subjects,
    praise: "",
    causesForConcern: student.causeForConcern ? student.causeForConcernReason ?? "" : "",
    targets: "",
    teacherSignatureName: generatedByName,
    footerNote: extractFooterNote(settings),
  };

  return { snapshot, academicYearId: academicYear.id };
}

/**
 * Stage 9: builds the end-of-year summary. Aggregates across all three terms
 * rather than a single one — each subject shows its Current Grade trend
 * (T1 → T2 → T3), the "final" grade used for averages is the latest term
 * that actually has data, and the academic summary includes the year's
 * start-to-end improvement.
 */
export async function buildEndOfYearSnapshot(
  studentId: string,
  generatedByName: string
): Promise<{ snapshot: ReportSnapshot; academicYearId: string }> {
  const { student, academicYear, settings } = await loadStudentWithAllTerms(studentId);

  function latestGradeFor(termRecords: { term: string; currentGrade: number | null }[]) {
    const reversed = [...termRecords].reverse();
    return reversed.find((tr) => tr.currentGrade !== null)?.currentGrade ?? null;
  }

  const subjects: ReportSubjectRow[] = student.enrolments.map((e) => {
    const byTerm = Object.fromEntries(TERMS.map((t) => [t, e.termRecords.find((tr) => tr.term === t)]));
    const finalRecord =
      byTerm.TERM_3?.currentGrade !== null && byTerm.TERM_3?.currentGrade !== undefined
        ? byTerm.TERM_3
        : byTerm.TERM_2?.currentGrade !== null && byTerm.TERM_2?.currentGrade !== undefined
        ? byTerm.TERM_2
        : byTerm.TERM_1;

    return {
      subjectName: e.subject.name,
      teacherName: e.teacher?.fullName ?? null,
      currentGrade: finalRecord?.currentGrade ?? null,
      workingAtGrade: finalRecord?.workingAtGrade ?? null,
      predictedGrade: finalRecord?.predictedGrade ?? null,
      targetGrade: finalRecord?.targetGrade ?? null,
      differenceFromTarget: finalRecord?.differenceFromTarget ?? null,
      teacherComment: finalRecord?.teacherComment ?? null,
      termTrend: {
        term1: byTerm.TERM_1?.currentGrade ?? null,
        term2: byTerm.TERM_2?.currentGrade ?? null,
        term3: byTerm.TERM_3?.currentGrade ?? null,
      },
    };
  });

  const averageGrade = calculateAverageGrade(subjects.map((s) => s.currentGrade));
  const overallDiff = calculateAverageGrade(subjects.map((s) => s.differenceFromTarget));
  const overallProgress = overallDiff !== null ? classifyProgress(Math.round(overallDiff)) : null;

  const yearStartAverage = calculateAverageGrade(subjects.map((s) => s.termTrend?.term1 ?? null));
  const yearEndAverage = calculateAverageGrade(subjects.map((s) => s.termTrend?.term3 ?? s.termTrend?.term2 ?? null));
  const improvement =
    yearStartAverage !== null && yearEndAverage !== null
      ? Math.round((yearEndAverage - yearStartAverage) * 100) / 100
      : null;

  // Most common behaviour rating across the WHOLE year (all terms, all subjects).
  const behaviourCounts = new Map<string, number>();
  for (const e of student.enrolments) {
    for (const tr of e.termRecords) {
      if (tr.behaviourRating) behaviourCounts.set(tr.behaviourRating, (behaviourCounts.get(tr.behaviourRating) ?? 0) + 1);
    }
  }
  const mostCommonRating = [...behaviourCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  // Average attendance across every term record with data, for the whole year.
  const attendanceValues = student.enrolments
    .flatMap((e) => e.termRecords.map((tr) => tr.attendancePercent))
    .filter((v): v is NonNullable<typeof v> => v != null)
    .map((v) => Number(v));
  const overallAttendancePercent =
    attendanceValues.length > 0
      ? Math.round((attendanceValues.reduce((a, b) => a + b, 0) / attendanceValues.length) * 10) / 10
      : student.overallAttendance
      ? Number(student.overallAttendance)
      : null;

  const snapshot: ReportSnapshot = {
    type: "END_OF_YEAR",
    ...buildSchoolAndStudentInfo(student, settings),
    academicYearLabel: academicYear.label,
    termLabel: "End of Year",
    generatedAt: new Date().toISOString(),
    generatedByName,
    attendanceSummary: { overallPercent: overallAttendancePercent },
    behaviourSummary: { mostCommonRating },
    academicSummary: { averageGrade, overallProgress, yearStartAverage, yearEndAverage, improvement },
    subjects,
    praise: "",
    causesForConcern: student.causeForConcern ? student.causeForConcernReason ?? "" : "",
    targets: "",
    teacherSignatureName: generatedByName,
    footerNote: extractFooterNote(settings),
  };

  return { snapshot, academicYearId: academicYear.id };
}
