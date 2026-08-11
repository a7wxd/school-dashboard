"use client";

// src/components/students/profile/AttendanceBehaviourPanel.tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export interface AttendancePoint {
  term: string;
  attendance: number | null;
}

export interface BehaviourRow {
  subjectName: string;
  terms: Record<"TERM_1" | "TERM_2" | "TERM_3", { behaviourRating: string | null; attitudeToLearning: string | null }>;
}

const TERMS = ["TERM_1", "TERM_2", "TERM_3"] as const;
const TERM_LABELS: Record<string, string> = { TERM_1: "T1", TERM_2: "T2", TERM_3: "T3" };

function formatRating(rating: string | null) {
  if (!rating) return "—";
  return rating.replace(/_/g, " ").toLowerCase();
}

export function AttendanceBehaviourPanel({
  attendanceData,
  behaviourRows,
}: {
  attendanceData: AttendancePoint[];
  behaviourRows: BehaviourRow[];
}) {
  const hasAttendance = attendanceData.some((d) => d.attendance !== null);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 text-sm font-medium text-foreground">Attendance by term</h3>
        {hasAttendance ? (
          <div className="rounded-xl border border-border bg-card p-4" style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="term" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ borderRadius: 8, borderColor: "hsl(var(--border))", fontSize: 13 }} />
                <Bar dataKey="attendance" name="Attendance %" fill="hsl(var(--brand))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-card px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">No attendance recorded yet.</p>
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-foreground">Behaviour & attitude by subject</h3>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Subject</th>
                {TERMS.map((t) => (
                  <th key={t} className="px-4 py-3 font-medium">{TERM_LABELS[t]} Behaviour</th>
                ))}
                {TERMS.map((t) => (
                  <th key={`${t}-att`} className="px-4 py-3 font-medium">{TERM_LABELS[t]} Attitude</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {behaviourRows.map((row) => (
                <tr key={row.subjectName}>
                  <td className="px-4 py-3 font-medium text-foreground">{row.subjectName}</td>
                  {TERMS.map((t) => (
                    <td key={t} className="px-4 py-3 capitalize text-muted-foreground">
                      {formatRating(row.terms[t].behaviourRating)}
                    </td>
                  ))}
                  {TERMS.map((t) => (
                    <td key={`${t}-att`} className="px-4 py-3 capitalize text-muted-foreground">
                      {formatRating(row.terms[t].attitudeToLearning)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
