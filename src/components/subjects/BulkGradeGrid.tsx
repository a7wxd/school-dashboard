"use client";

// src/components/subjects/BulkGradeGrid.tsx
// The spreadsheet-style bulk grade entry grid. Each row is its own GradeRow,
// managing its own local edits and autosave independently — editing one
// student's row never affects another's, and a slow save on one row doesn't
// block typing in the next.

import { GradeRow, type GradeRowData } from "./GradeRow";

export function BulkGradeGrid({
  rows,
  canOverridePredicted,
}: {
  rows: GradeRowData[];
  canOverridePredicted: boolean;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
        <p className="text-sm text-muted-foreground">No students enrolled in this class yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full min-w-[980px] text-left text-sm">
        <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Student</th>
            <th className="px-4 py-3 font-medium">Current</th>
            <th className="px-4 py-3 font-medium">Working at</th>
            <th className="px-4 py-3 font-medium">Predicted</th>
            <th className="px-4 py-3 font-medium">Target</th>
            <th className="px-4 py-3 font-medium">Progress</th>
            <th className="px-4 py-3 font-medium">Behaviour</th>
            <th className="px-4 py-3 font-medium">Attitude</th>
            <th className="px-4 py-3 font-medium">Comment</th>
            <th className="px-4 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <GradeRow key={row.termRecordId} row={row} canOverridePredicted={canOverridePredicted} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
