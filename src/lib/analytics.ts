// src/lib/analytics.ts
// School-wide aggregates for the Analytics section. Deliberately computed by
// fetching the current academic year's TermRecords once and aggregating in
// JS rather than several separate groupBy queries — Prisma's groupBy can't
// group by a joined table's field (e.g. student.yearGroup) directly, and for
// a single school's data volume this is simpler and just as fast.

import { prisma } from "./prisma";
import { calculateAverageGrade } from "./grades";

const TERMS = ["TERM_1", "TERM_2", "TERM_3"] as const;
const TERM_LABELS: Record<string, string> = { TERM_1: "Term 1", TERM_2: "Term 2", TERM_3: "Term 3" };
const GCSE_YEAR_GROUPS = ["Y10", "Y11"];

export interface AnalyticsData {
  gradeTrend: { term: string; averageGrade: number | null }[];
  predictedOutcomes: { grade: number; count: number }[];
  attendanceByTerm: { term: string; attendance: number | null }[];
  attendanceByYearGroup: { yearGroup: string; attendance: number | null }[];
  behaviourDistribution: { rating: string; count: number }[];
  progressOverTime: { term: string; aboveTarget: number; onTarget: number; belowTarget: number }[];
  subjectPerformance: { subject: string; averageGrade: number | null }[];
}

export async function getAnalyticsData(): Promise<AnalyticsData | null> {
  const currentYear = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
  if (!currentYear) return null;

  const termRecords = await prisma.termRecord.findMany({
    where: { enrolment: { academicYearId: currentYear.id, student: { deletedAt: null } } },
    select: {
      term: true,
      currentGrade: true,
      predictedGrade: true,
      attendancePercent: true,
      behaviourRating: true,
      progressRating: true,
      enrolmentId: true,
      enrolment: {
        select: {
          subject: { select: { name: true } },
          student: { select: { yearGroup: true } },
        },
      },
    },
  });

  // ---- Grade trend by term (school-wide average current grade) ----
  const gradeTrend = TERMS.map((t) => {
    const grades = termRecords.filter((r) => r.term === t && r.currentGrade !== null).map((r) => r.currentGrade as number);
    return { term: TERM_LABELS[t], averageGrade: calculateAverageGrade(grades) };
  });

  // ---- Attendance by term ----
  const attendanceByTerm = TERMS.map((t) => {
    const values = termRecords
      .filter((r) => r.term === t && r.attendancePercent !== null)
      .map((r) => Number(r.attendancePercent));
    return {
      term: TERM_LABELS[t],
      attendance: values.length > 0 ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10 : null,
    };
  });

  // ---- Attendance by year group (across all terms) ----
  const yearGroups = ["Y7", "Y8", "Y9", "Y10", "Y11"];
  const attendanceByYearGroup = yearGroups.map((yg) => {
    const values = termRecords
      .filter((r) => r.enrolment.student.yearGroup === yg && r.attendancePercent !== null)
      .map((r) => Number(r.attendancePercent));
    return {
      yearGroup: yg,
      attendance: values.length > 0 ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10 : null,
    };
  });

  // ---- Progress over time (counts per term, school-wide) ----
  const progressOverTime = TERMS.map((t) => {
    const recordsThisTerm = termRecords.filter((r) => r.term === t && r.progressRating !== null);
    return {
      term: TERM_LABELS[t],
      aboveTarget: recordsThisTerm.filter((r) => r.progressRating === "ABOVE_TARGET").length,
      onTarget: recordsThisTerm.filter((r) => r.progressRating === "ON_TARGET").length,
      belowTarget: recordsThisTerm.filter((r) => r.progressRating === "BELOW_TARGET").length,
    };
  });

  // ---- Latest term with data, per enrolment (used for predicted outcomes, behaviour, subject performance) ----
  const byEnrolment = new Map<string, typeof termRecords>();
  for (const r of termRecords) {
    const existing = byEnrolment.get(r.enrolmentId) ?? [];
    existing.push(r);
    byEnrolment.set(r.enrolmentId, existing);
  }
  const latestPerEnrolment = [...byEnrolment.values()].map((records) => {
    const sorted = [...records].sort((a, b) => TERMS.indexOf(a.term as (typeof TERMS)[number]) - TERMS.indexOf(b.term as (typeof TERMS)[number]));
    return [...sorted].reverse().find((r) => r.currentGrade !== null) ?? sorted[sorted.length - 1];
  });

  // ---- Predicted GCSE outcomes (Y10/Y11 only), bucketed 1-9 ----
  const predictedOutcomes = Array.from({ length: 9 }, (_, i) => i + 1).map((grade) => ({
    grade,
    count: latestPerEnrolment.filter(
      (r) => GCSE_YEAR_GROUPS.includes(r.enrolment.student.yearGroup) && r.predictedGrade === grade
    ).length,
  }));

  // ---- Behaviour distribution (latest term per enrolment, school-wide) ----
  const behaviourRatings = ["OUTSTANDING", "GOOD", "REQUIRES_IMPROVEMENT", "CAUSE_FOR_CONCERN"];
  const behaviourDistribution = behaviourRatings.map((rating) => ({
    rating,
    count: latestPerEnrolment.filter((r) => r.behaviourRating === rating).length,
  }));

  // ---- Subject performance (average current grade, latest term per enrolment) ----
  const subjectNames = [...new Set(latestPerEnrolment.map((r) => r.enrolment.subject.name))].sort();
  const subjectPerformance = subjectNames.map((subject) => {
    const grades = latestPerEnrolment
      .filter((r) => r.enrolment.subject.name === subject && r.currentGrade !== null)
      .map((r) => r.currentGrade as number);
    return { subject, averageGrade: calculateAverageGrade(grades) };
  });

  return {
    gradeTrend,
    predictedOutcomes,
    attendanceByTerm,
    attendanceByYearGroup,
    behaviourDistribution,
    progressOverTime,
    subjectPerformance,
  };
}
