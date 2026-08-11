// src/components/dashboard/ActivityFeed.tsx
import { Clock } from "lucide-react";

interface ActivityItem {
  id: string;
  action: string;
  createdAt: Date;
  user?: { fullName: string } | null;
}

const ACTION_LABELS: Record<string, string> = {
  USER_LOGIN: "signed in",
  TEACHER_CREATED: "added a new teacher account",
  TEACHER_UPDATED: "updated a teacher account",
  TEACHER_DEACTIVATED: "deactivated a teacher account",
  TEACHER_REACTIVATED: "reactivated a teacher account",
  STUDENT_CREATED: "added a new student",
  STUDENT_DELETED: "removed a student",
  STUDENT_RESTORED: "restored a student",
  STUDENT_UPDATED: "updated a student profile",
  SUBJECT_CREATED: "added a subject",
  SUBJECT_UPDATED: "updated a subject",
  GRADE_UPDATED: "entered grades",
  PREDICTED_GRADE_OVERRIDDEN: "overrode a predicted grade",
  REPORT_GENERATED: "generated a report",
  REPORT_EDITED: "edited a report",
  REPORT_APPROVED: "approved a report",
  REPORT_SENT: "sent a report to a parent",
  SETTINGS_UPDATED: "updated settings",
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No recent activity yet.</p>;
  }

  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li key={item.id} className="flex items-start gap-3">
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Clock size={12} />
          </div>
          <p className="text-sm text-foreground">
            {item.user && <span className="font-medium">{item.user.fullName}</span>}{" "}
            <span className="text-muted-foreground">
              {ACTION_LABELS[item.action] ?? item.action.toLowerCase().replace(/_/g, " ")}
            </span>
            <span className="ml-2 text-xs text-muted-foreground">{timeAgo(item.createdAt)}</span>
          </p>
        </li>
      ))}
    </ul>
  );
}
