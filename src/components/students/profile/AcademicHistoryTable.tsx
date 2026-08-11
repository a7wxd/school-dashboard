// src/components/students/profile/AcademicHistoryTable.tsx
import { Fragment } from "react";

export interface TermGrade {
  currentGrade: number | null;
  targetGrade: number | null;
  predictedGrade: number | null;
}

export interface AcademicHistoryRow {
  subjectName: string;
  terms: Record<"TERM_1" | "TERM_2" | "TERM_3", TermGrade>;
}

const TERMS = ["TERM_1", "TERM_2", "TERM_3"] as const;

export function AcademicHistoryTable({ rows }: { rows: AcademicHistoryRow[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">No subject enrolments found.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th rowSpan={2} className="border-r border-border px-4 py-3 font-medium align-bottom">Subject</th>
            <th colSpan={2} className="border-r border-border px-4 py-2 text-center font-medium">Term 1</th>
            <th colSpan={2} className="border-r border-border px-4 py-2 text-center font-medium">Term 2</th>
            <th colSpan={2} className="px-4 py-2 text-center font-medium">Term 3</th>
          </tr>
          <tr>
            {TERMS.map((t, i) => (
              <Fragment key={t}>
                <th className="px-3 py-2 text-center font-normal">Current</th>
                <th className={`px-3 py-2 text-center font-normal ${i < 2 ? "border-r border-border" : ""}`}>Target</th>
              </Fragment>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row.subjectName}>
              <td className="border-r border-border px-4 py-3 font-medium text-foreground">{row.subjectName}</td>
              {TERMS.map((t, i) => (
                <Fragment key={t}>
                  <td className="px-3 py-3 text-center text-foreground">{row.terms[t].currentGrade ?? "—"}</td>
                  <td className={`px-3 py-3 text-center text-muted-foreground ${i < 2 ? "border-r border-border" : ""}`}>
                    {row.terms[t].targetGrade ?? "—"}
                  </td>
                </Fragment>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
