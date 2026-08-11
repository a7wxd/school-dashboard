// src/components/students/StudentTable.tsx
import Link from "next/link";
import { AlertCircle, Users } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

export interface StudentRow {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  yearGroup: string;
  senStatus: string;
  causeForConcern: boolean;
  overallAttendance: number | null;
}

const SEN_LABELS: Record<string, string> = {
  NONE: "—",
  SEN_SUPPORT: "SEN Support",
  EHCP: "EHCP",
};

export function StudentTable({ students }: { students: StudentRow[] }) {
  if (students.length === 0) {
    return <EmptyState icon={Users} description="No students match these filters." />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-5 py-3 font-medium">Name</th>
            <th className="px-5 py-3 font-medium">Student ID</th>
            <th className="px-5 py-3 font-medium">Year</th>
            <th className="px-5 py-3 font-medium">SEN status</th>
            <th className="px-5 py-3 font-medium">Attendance</th>
            <th className="px-5 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {students.map((student) => (
            <tr key={student.id} className="transition-default hover:bg-muted/40">
              <td className="px-5 py-3.5">
                <Link href={`/students/${student.id}`} className="font-medium text-foreground hover:text-brand">
                  {student.firstName} {student.lastName}
                </Link>
              </td>
              <td className="px-5 py-3.5 text-muted-foreground">{student.studentId}</td>
              <td className="px-5 py-3.5 text-muted-foreground">{student.yearGroup.replace("Y", "Year ")}</td>
              <td className="px-5 py-3.5 text-muted-foreground">{SEN_LABELS[student.senStatus] ?? student.senStatus}</td>
              <td className="px-5 py-3.5 text-muted-foreground">
                {student.overallAttendance !== null ? `${student.overallAttendance}%` : "—"}
              </td>
              <td className="px-5 py-3.5 text-right">
                {student.causeForConcern && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-danger/10 px-2 py-0.5 text-xs font-medium text-danger">
                    <AlertCircle size={12} /> Concern
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
