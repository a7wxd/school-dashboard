// src/components/reports/ReportPreview.tsx
// Mirrors the fixed report layout order required by the spec (ARCHITECTURE.md
// §6): Student Header → Attendance → Behaviour → Overall Academic Summary →
// Subject Breakdown → Teacher Comments → Praise → Causes for Concern →
// Targets → Signature. Missing data always shows "N/A" rather than removing
// a section. Same layout for both TERM and END_OF_YEAR reports (Stage 9) —
// only the section labels and subject breakdown columns adapt: Praise becomes
// "Strengths & Achievements", Causes for Concern becomes "Recurring Concerns",
// Targets becomes "Recommendations", and the subject table shows the T1→T2→T3
// trend instead of a single term's Working At/Predicted. This is the
// in-browser preview; the actual PDF uses the same snapshot with
// @react-pdf/renderer (ReportPdfDocument).

import type { ReportSnapshot } from "@/lib/reports";

const PROGRESS_LABELS: Record<string, string> = {
  ABOVE_TARGET: "Above target",
  ON_TARGET: "On target",
  BELOW_TARGET: "Below target",
};

const BEHAVIOUR_LABELS: Record<string, string> = {
  OUTSTANDING: "Outstanding",
  GOOD: "Good",
  REQUIRES_IMPROVEMENT: "Requires improvement",
  CAUSE_FOR_CONCERN: "Cause for concern",
};

function na(value: string | number | null | undefined) {
  return value === null || value === undefined || value === "" ? "N/A" : value;
}

export function ReportPreview({ snapshot }: { snapshot: ReportSnapshot }) {
  const isEndOfYear = snapshot.type === "END_OF_YEAR";

  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Student Header */}
      <div className="flex items-center justify-between border-b border-border p-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{snapshot.school.name}</p>
          <h2 className="mt-1 font-serif text-xl font-medium text-foreground">{snapshot.student.fullName}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {snapshot.student.studentId} · {snapshot.student.yearGroup.replace("Y", "Year ")}
          </p>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <p className="font-medium text-foreground">{snapshot.termLabel}</p>
          <p>{snapshot.academicYearLabel}</p>
        </div>
      </div>

      <div className="space-y-6 p-6">
        {/* Attendance Summary */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Attendance summary</h3>
          <p className="mt-1.5 text-sm text-foreground">
            {isEndOfYear ? "Overall attendance for the year: " : "Overall attendance: "}
            <span className="font-medium">{na(snapshot.attendanceSummary.overallPercent ? `${snapshot.attendanceSummary.overallPercent}%` : null)}</span>
          </p>
        </section>

        {/* Behaviour Summary */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Behaviour summary</h3>
          <p className="mt-1.5 text-sm text-foreground">
            {na(snapshot.behaviourSummary.mostCommonRating ? BEHAVIOUR_LABELS[snapshot.behaviourSummary.mostCommonRating] : null)}
          </p>
        </section>

        {/* Overall Academic Summary */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Overall academic summary</h3>
          <p className="mt-1.5 text-sm text-foreground">
            Average grade: <span className="font-medium">{na(snapshot.academicSummary.averageGrade)}</span> · Overall progress:{" "}
            <span className="font-medium">
              {na(snapshot.academicSummary.overallProgress ? PROGRESS_LABELS[snapshot.academicSummary.overallProgress] : null)}
            </span>
          </p>
          {isEndOfYear && (
            <p className="mt-1 text-sm text-foreground">
              Year progress: <span className="font-medium">{na(snapshot.academicSummary.yearStartAverage)}</span> (Term 1) →{" "}
              <span className="font-medium">{na(snapshot.academicSummary.yearEndAverage)}</span> (Term 3)
              {snapshot.academicSummary.improvement !== null && snapshot.academicSummary.improvement !== undefined && (
                <span className="ml-1 text-muted-foreground">
                  ({snapshot.academicSummary.improvement > 0 ? "+" : ""}
                  {snapshot.academicSummary.improvement} over the year)
                </span>
              )}
            </p>
          )}
        </section>

        {/* Subject Breakdown */}
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Subject breakdown</h3>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Subject</th>
                  {isEndOfYear ? (
                    <>
                      <th className="px-3 py-2 font-medium">Term 1</th>
                      <th className="px-3 py-2 font-medium">Term 2</th>
                      <th className="px-3 py-2 font-medium">Term 3</th>
                    </>
                  ) : (
                    <>
                      <th className="px-3 py-2 font-medium">Current</th>
                      <th className="px-3 py-2 font-medium">Working at</th>
                      <th className="px-3 py-2 font-medium">Predicted</th>
                    </>
                  )}
                  <th className="px-3 py-2 font-medium">Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {snapshot.subjects.map((s) => (
                  <tr key={s.subjectName}>
                    <td className="px-3 py-2 font-medium text-foreground">{s.subjectName}</td>
                    {isEndOfYear ? (
                      <>
                        <td className="px-3 py-2 text-foreground">{na(s.termTrend?.term1 ?? null)}</td>
                        <td className="px-3 py-2 text-foreground">{na(s.termTrend?.term2 ?? null)}</td>
                        <td className="px-3 py-2 text-foreground">{na(s.termTrend?.term3 ?? null)}</td>
                      </>
                    ) : (
                      <>
                        <td className="px-3 py-2 text-foreground">{na(s.currentGrade)}</td>
                        <td className="px-3 py-2 text-foreground">{na(s.workingAtGrade)}</td>
                        <td className="px-3 py-2 text-foreground">{na(s.predictedGrade)}</td>
                      </>
                    )}
                    <td className="px-3 py-2 text-foreground">{na(s.targetGrade)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Teacher Comments */}
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Teacher comments</h3>
          <ul className="space-y-1.5 text-sm text-foreground">
            {snapshot.subjects.map((s) => (
              <li key={s.subjectName}>
                <span className="font-medium">{s.subjectName}:</span> {na(s.teacherComment)}
              </li>
            ))}
          </ul>
        </section>

        {/* Praise / Strengths & Achievements */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {isEndOfYear ? "Strengths & achievements" : "Praise"}
          </h3>
          <p className="mt-1.5 whitespace-pre-line text-sm text-foreground">{na(snapshot.praise)}</p>
        </section>

        {/* Causes for Concern / Recurring Concerns */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {isEndOfYear ? "Recurring concerns" : "Causes for concern"}
          </h3>
          <p className="mt-1.5 whitespace-pre-line text-sm text-foreground">{na(snapshot.causesForConcern)}</p>
        </section>

        {/* Targets / Recommendations */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {isEndOfYear ? "Recommendations for next year" : "Targets for improvement"}
          </h3>
          <p className="mt-1.5 whitespace-pre-line text-sm text-foreground">{na(snapshot.targets)}</p>
        </section>

        {/* Signature */}
        <section className="border-t border-border pt-4 text-sm text-muted-foreground">
          <p>{snapshot.teacherSignatureName}</p>
          <p className="text-xs">Generated {new Date(snapshot.generatedAt).toLocaleString("en-GB")}</p>
          {snapshot.footerNote && <p className="mt-3 text-xs italic text-muted-foreground">{snapshot.footerNote}</p>}
        </section>
      </div>
    </div>
  );
}
