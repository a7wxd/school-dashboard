// src/app/(dashboard)/subjects/[subjectId]/page.tsx
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/permissions";
import { PageHeader } from "@/components/layout/PageHeader";
import { TeacherAssignmentPanel } from "@/components/subjects/TeacherAssignmentPanel";
import { YearGroupGradeLink } from "@/components/subjects/YearGroupGradeLink";
import { Role } from "@prisma/client";

export default async function SubjectDetailPage({ params }: { params: { subjectId: string } }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const subject = await prisma.subject.findUnique({
    where: { id: params.subjectId },
    include: { teacherSubjects: { include: { teacher: { select: { id: true, fullName: true } } } } },
  });
  if (!subject || !subject.isActive) notFound();

  const canManage = can(session.user.role, "SUBJECT_MANAGE");

  const [allTeachers, academicYear] = await Promise.all([
    canManage
      ? prisma.user.findMany({
          where: { role: Role.TEACHER, isActive: true },
          select: { id: true, fullName: true },
          orderBy: { fullName: "asc" },
        })
      : Promise.resolve([]),
    prisma.academicYear.findFirst({ where: { isCurrent: true } }),
  ]);

  const studentCounts: Record<string, number> = {};
  if (academicYear) {
    for (const yearGroup of subject.appliesToYearGroups) {
      studentCounts[yearGroup] = await prisma.enrolment.count({
        where: {
          subjectId: subject.id,
          academicYearId: academicYear.id,
          student: { yearGroup, deletedAt: null },
        },
      });
    }
  }

  return (
    <div className="max-w-3xl space-y-8">
      <PageHeader title={subject.name} description="Manage teachers and enter grades by year group." />

      <TeacherAssignmentPanel
        subjectId={subject.id}
        assignedTeachers={subject.teacherSubjects.map((ts) => ts.teacher)}
        allTeachers={allTeachers}
        canManage={canManage}
      />

      <section>
        <h2 className="mb-3 font-serif text-lg font-medium text-foreground">Enter grades</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {subject.appliesToYearGroups.map((yearGroup) => (
            <YearGroupGradeLink
              key={yearGroup}
              subjectId={subject.id}
              yearGroup={yearGroup}
              studentCount={studentCounts[yearGroup] ?? 0}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
