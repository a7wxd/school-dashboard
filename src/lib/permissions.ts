// src/lib/permissions.ts
// Central permission map — see ARCHITECTURE.md §4.
// Add a new role or capability here only; no other file should hardcode role checks.

export type Role = "ADMIN" | "TEACHER";

export const PERMISSIONS = {
  STUDENT_VIEW: ["ADMIN", "TEACHER"],
  STUDENT_CREATE: ["ADMIN"],
  STUDENT_DELETE: ["ADMIN"],
  STUDENT_RESTORE: ["ADMIN"],
  USER_MANAGE: ["ADMIN"],
  SUBJECT_MANAGE: ["ADMIN"],
  GRADE_ENTER: ["ADMIN", "TEACHER"],
  COMMENT_ENTER: ["ADMIN", "TEACHER"],
  REPORT_GENERATE: ["ADMIN", "TEACHER"],
  REPORT_EDIT: ["ADMIN", "TEACHER"],
  REPORT_APPROVE: ["ADMIN", "TEACHER"],
  REPORT_SEND: ["ADMIN", "TEACHER"],
  PREDICTED_GRADE_OVERRIDE: ["ADMIN"],
  SETTINGS_MANAGE: ["ADMIN"],
  BACKUP_VIEW: ["ADMIN"],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof PERMISSIONS;

export function can(role: Role, permission: Permission): boolean {
  return (PERMISSIONS[permission] as readonly Role[]).includes(role);
}
