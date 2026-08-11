// src/lib/grades.ts
// Implements the CALCULATION RULES from the approved spec (see ARCHITECTURE.md §5).
// All grade values are integers on the 9-1 GCSE scale.

export type ProgressRating = "ABOVE_TARGET" | "ON_TARGET" | "BELOW_TARGET";

const MIN_GRADE = 1;
const MAX_GRADE = 9;

export function isValidGcseGrade(value: number | null | undefined): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= MIN_GRADE &&
    value <= MAX_GRADE
  );
}

/** Rule 1: Progress = Current Grade - Target Grade, classified into a rating. */
export function calculateDifferenceFromTarget(
  currentGrade: number | null,
  targetGrade: number | null
): number | null {
  if (!isValidGcseGrade(currentGrade) || !isValidGcseGrade(targetGrade)) return null;
  return currentGrade - targetGrade;
}

export function classifyProgress(differenceFromTarget: number | null): ProgressRating | null {
  if (differenceFromTarget === null) return null;
  if (differenceFromTarget > 0) return "ABOVE_TARGET";
  if (differenceFromTarget === 0) return "ON_TARGET";
  return "BELOW_TARGET";
}

/** Rule 2: Average grade = mean of all subject current grades across all available terms. */
export function calculateAverageGrade(currentGrades: Array<number | null | undefined>): number | null {
  const valid = currentGrades.filter(isValidGcseGrade);
  if (valid.length === 0) return null;
  const sum = valid.reduce((total, grade) => total + grade, 0);
  return Math.round((sum / valid.length) * 100) / 100; // 2dp
}

/**
 * Rule 3: Predicted grade is derived from (a) the trend across previous terms'
 * current grades, (b) the teacher's assessment input, and (c) term progression
 * (later terms weighted more heavily). Manual override is admin-only —
 * enforced at the API layer via PERMISSIONS.PREDICTED_GRADE_OVERRIDE, not here.
 *
 * `teacherAssessmentAdjustment` is a small bounded nudge (-1 to +1) representing
 * the teacher's qualitative input, kept in that range so it can influence but
 * never override the data-driven trend on its own.
 */
export function derivePredictedGrade(params: {
  termCurrentGrades: Array<number | null | undefined>; // in term order, e.g. [t1, t2, t3]
  teacherAssessmentAdjustment?: number; // -1 | 0 | 1
}): number | null {
  const { termCurrentGrades, teacherAssessmentAdjustment = 0 } = params;
  const validGrades = termCurrentGrades.filter(isValidGcseGrade);
  if (validGrades.length === 0) return null;

  // Weighted average favouring later terms (weights: 1, 2, 3 for however many terms exist).
  const weights = validGrades.map((_, i) => i + 1);
  const weightedSum = validGrades.reduce((sum, grade, i) => sum + grade * weights[i], 0);
  const weightSum = weights.reduce((a, b) => a + b, 0);
  const trend = weightedSum / weightSum;

  const adjustment = Math.max(-1, Math.min(1, teacherAssessmentAdjustment));
  const predicted = Math.round(trend + adjustment);

  return Math.max(MIN_GRADE, Math.min(MAX_GRADE, predicted));
}
