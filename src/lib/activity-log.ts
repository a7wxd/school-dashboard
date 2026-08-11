// src/lib/activity-log.ts
// Every mutating action in the system must call this — see ARCHITECTURE.md §2/§7.
// Powers the audit trail and the "Recent activity" widgets on both dashboards.

import { prisma } from "./prisma";

export type ActivityAction =
  | "USER_LOGIN"
  | "TEACHER_CREATED"
  | "TEACHER_UPDATED"
  | "TEACHER_DEACTIVATED"
  | "TEACHER_REACTIVATED"
  | "STUDENT_CREATED"
  | "STUDENT_DELETED"
  | "STUDENT_RESTORED"
  | "STUDENT_UPDATED"
  | "SUBJECT_CREATED"
  | "SUBJECT_UPDATED"
  | "SUBJECT_DEACTIVATED"
  | "GRADE_UPDATED"
  | "PREDICTED_GRADE_OVERRIDDEN"
  | "REPORT_GENERATED"
  | "REPORT_EDITED"
  | "REPORT_APPROVED"
  | "REPORT_SENT"
  | "SETTINGS_UPDATED";

interface LogActivityParams {
  userId: string;
  action: ActivityAction;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}

export async function logActivity({
  userId,
  action,
  entityType,
  entityId,
  metadata,
}: LogActivityParams) {
  return prisma.activityLog.create({
    data: {
      userId,
      action,
      entityType,
      entityId,
      metadata: metadata ?? undefined,
    },
  });
}

/** Fetch recent activity for the admin dashboard's school-wide feed. */
export async function getRecentActivity(limit = 20) {
  return prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { user: { select: { fullName: true, role: true } } },
  });
}

/** Fetch recent activity scoped to a single teacher, for their dashboard. */
export async function getRecentActivityForUser(userId: string, limit = 10) {
  return prisma.activityLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
