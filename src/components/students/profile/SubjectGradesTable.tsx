// src/components/students/profile/SubjectGradesTable.tsx
export interface SubjectGradeRow {
  subjectName: string;
  teacherName: string | null;
  currentGrade: number | null;
  workingAtGrade: number | null;
  predictedGrade: number | null;
  targetGrade: number | null;
  differenceFromTarget: number | null;
}

function ProgressBadge({ diff }: { diff: number | null }) {
  if (diff === null) return <span className="text-xs text-muted-foreground">—</span>;
  if (diff > 0)
    return <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">Above target (+{diff})</span>;
  if (diff === 0)
    return <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">On target</span>;
  return <span className="rounded-full bg-danger/10 px-2 py-0.5 text-xs font-medium text-danger">Below target ({diff})</span>;
}

export function SubjectGradesTable({ rows, term }: { rows: SubjectGradeRow[]; term: string }) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">No subject enrolments found for {term}.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Subject</th>
            <th className="px-4 py-3 font-medium">Teacher</th>
            <th className="px-4 py-3 font-medium">Current</th>
            <th className="px-4 py-3 font-medium">Working at</th>
            <th className="px-4 py-3 font-medium">Predicted</th>
            <th className="px-4 py-3 font-medium">Target</th>
            <th className="px-4 py-3 font-medium">Progress</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row.subjectName}>
              <td className="px-4 py-3 font-medium text-foreground">{row.subjectName}</td>
              <td className="px-4 py-3 text-muted-foreground">{row.teacherName ?? "Unassigned"}</td>
              <td className="px-4 py-3 text-foreground">{row.currentGrade ?? "N/A"}</td>
              <td className="px-4 py-3 text-foreground">{row.workingAtGrade ?? "N/A"}</td>
              <td className="px-4 py-3 text-foreground">{row.predictedGrade ?? "N/A"}</td>
              <td className="px-4 py-3 text-foreground">{row.targetGrade ?? "N/A"}</td>
              <td className="px-4 py-3">
                <ProgressBadge diff={row.differenceFromTarget} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
