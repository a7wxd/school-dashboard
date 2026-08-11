// src/components/dashboard/TeacherDashboard.tsx
import Link from "next/link";
import { BookOpen, AlertCircle, ClipboardList, FileEdit } from "lucide-react";
import { StatCard } from "./StatCard";
import { ActivityFeed } from "./ActivityFeed";
import { getTeacherDashboardStats } from "@/lib/dashboard";

export async function TeacherDashboard({ teacherId }: { teacherId: string }) {
  const stats = await getTeacherDashboardStats(teacherId);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Assigned classes" value={stats.assignedClasses.length} icon={BookOpen} />
        <StatCard
          label="Students needing attention"
          value={stats.studentsNeedingAttention.length}
          icon={AlertCircle}
        />
        <StatCard
          label="Pending grade entry"
          value={stats.pendingGradeTasks.length}
          icon={ClipboardList}
          hint="This term"
        />
        <StatCard label="Draft reports" value={stats.draftReports.length} icon={FileEdit} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6 lg:col-span-2">
          <h2 className="mb-4 font-serif text-lg font-medium text-foreground">
            Students needing attention
          </h2>
          {stats.studentsNeedingAttention.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No flagged students right now — nice work.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {stats.studentsNeedingAttention.map((student) => (
                <li key={student.id}>
                  <Link
                    href={`/students/${student.id}`}
                    className="flex items-center justify-between py-3 text-sm transition-default hover:text-brand"
                  >
                    <span className="font-medium text-foreground">
                      {student.firstName} {student.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {student.yearGroup.replace("Y", "Year ")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 border-t border-border pt-6">
            <h3 className="mb-3 text-sm font-medium text-foreground">Draft reports</h3>
            {stats.draftReports.length === 0 ? (
              <p className="text-sm text-muted-foreground">No drafts waiting on you.</p>
            ) : (
              <ul className="divide-y divide-border">
                {stats.draftReports.map((report) => (
                  <li key={report.id}>
                    <Link
                      href={`/reports/${report.id}`}
                      className="flex items-center justify-between py-3 text-sm transition-default hover:text-brand"
                    >
                      <span className="font-medium text-foreground">
                        {report.student.firstName} {report.student.lastName}
                      </span>
                      <span className="text-xs capitalize text-muted-foreground">
                        {report.status.toLowerCase()}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
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
