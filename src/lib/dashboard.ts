// src/lib/dashboard.ts
// Query functions backing the Admin and Teacher dashboards (spec: "Dashboard
// Improvements" section). Kept separate from the Analytics section, which is
// the deeper chart-driven view built in Stage 10.

import { prisma } from "./prisma";
import { Role, ReportStatus } from "@prisma/client";

export async function getAdminDashboardStats() {
  const [totalStudents, totalTeachers, reportsPending, recentStudents, recentActivity] =
    await Promise.all([
      prisma.student.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { role: Role.TEACHER, isActive: true } }),
      prisma.report.count({ where: { status: ReportStatus.APPROVED } }),
      prisma.student.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, firstName: true, lastName: true, yearGroup: true, studentId: true, createdAt: true },
      }),
      prisma.activityLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { user: { select: { fullName: true } } },
      }),
    ]);

  const attendanceAgg = await prisma.student.aggregate({
    where: { deletedAt: null, overallAttendance: { not: null } },
    _avg: { overallAttendance: true },
  });

  const behaviourCounts = await prisma.termRecord.groupBy({
    by: ["behaviourRating"],
    _count: true,
    where: { behaviourRating: { not: null } },
  });

  return {
    totalStudents,
    totalTeachers,
    reportsPending,
    averageAttendance: attendanceAgg._avg.overallAttendance
      ? Number(attendanceAgg._avg.overallAttendance).toFixed(1)
      : null,
    behaviourCounts,
    recentStudents,
    recentActivity,
  };
}

export async function getTeacherDashboardStats(teacherId: string) {
  const [assignedSubjects, enrolmentsTaught, draftReports, recentActivity] = await Promise.all([
    prisma.teacherSubject.findMany({
      where: { teacherId },
      include: { subject: true },
    }),
    prisma.enrolment.findMany({
      where: { teacherId },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, yearGroup: true, causeForConcern: true } },
        subject: { select: { name: true } },
        termRecords: { orderBy: { term: "desc" }, take: 1 },
      },
    }),
    prisma.report.findMany({
      where: {
        generatedById: teacherId,
        status: { in: [ReportStatus.DRAFT, ReportStatus.EDITED] },
      },
      include: { student: { select: { firstName: true, lastName: true } } },
      take: 10,
    }),
    prisma.activityLog.findMany({
      where: { userId: teacherId },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const studentsNeedingAttention = enrolmentsTaught
    .filter(
      (e) =>
        e.student.causeForConcern ||
        e.termRecords[0]?.progressRating === "BELOW_TARGET"
    )
    .map((e) => e.student);

  const pendingGradeTasks = enrolmentsTaught.filter((e) => e.termRecords.length === 0);

  const uniqueClasses = Array.from(
    new Map(assignedSubjects.map((ts) => [ts.subject.id, ts.subject])).values()
  );

  return {
    assignedClasses: uniqueClasses,
    studentsNeedingAttention: Array.from(new Map(studentsNeedingAttention.map((s) => [s.id, s])).values()),
    pendingGradeTasks,
    draftReports,
    recentActivity,
  };
}
