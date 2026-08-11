// src/components/dashboard/AdminDashboard.tsx
import Link from "next/link";
import { Users, GraduationCap, FileClock, Percent, Plus } from "lucide-react";
import { StatCard } from "./StatCard";
import { ActivityFeed } from "./ActivityFeed";
import { getAdminDashboardStats } from "@/lib/dashboard";

const BEHAVIOUR_LABELS: Record<string, string> = {
  OUTSTANDING: "Outstanding",
  GOOD: "Good",
  REQUIRES_IMPROVEMENT: "Requires improvement",
  CAUSE_FOR_CONCERN: "Cause for concern",
};

export async function AdminDashboard() {
  const stats = await getAdminDashboardStats();
  const totalBehaviourRecords = stats.behaviourCounts.reduce((sum, b) => sum + b._count, 0);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total students" value={stats.totalStudents} icon={GraduationCap} />
        <StatCard label="Total teachers" value={stats.totalTeachers} icon={Users} />
        <StatCard
          label="Reports pending sending"
          value={stats.reportsPending}
          icon={FileClock}
          hint="Approved, not yet sent"
        />
        <StatCard
          label="Attendance overview"
          value={stats.averageAttendance ? `${stats.averageAttendance}%` : "—"}
          icon={Percent}
          hint="School-wide average"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-lg font-medium text-foreground">Recently added students</h2>
            <Link href="/students/new" className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-brand-foreground transition-default hover:opacity-90">
              <Plus size={14} /> Quick add student
            </Link>
          </div>
          {stats.recentStudents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No students added yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {stats.recentStudents.map((student) => (
                <li key={student.id}>
                  <Link
                    href={`/students/${student.id}`}
                    className="flex items-center justify-between py-3 text-sm transition-default hover:text-brand"
                  >
                    <span className="font-medium text-foreground">
                      {student.firstName} {student.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {student.yearGroup.replace("Y", "Year ")} · {student.studentId}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 border-t border-border pt-6">
            <h3 className="mb-3 text-sm font-medium text-foreground">Behaviour overview</h3>
            {totalBehaviourRecords === 0 ? (
              <p className="text-sm text-muted-foreground">No behaviour data recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {stats.behaviourCounts.map((b) => {
                  const pct = Math.round((b._count / totalBehaviourRecords) * 100);
                  return (
                    <div key={b.behaviourRating} className="flex items-center gap-3">
                      <span className="w-40 shrink-0 text-xs text-muted-foreground">
                        {BEHAVIOUR_LABELS[b.behaviourRating as string] ?? b.behaviourRating}
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-10 shrink-0 text-right text-xs text-muted-foreground">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 font-serif text-lg font-medium text-foreground">Recent activity</h2>
          <ActivityFeed items={stats.recentActivity} />
        </div>
      </div>
    </div>
  );
}
