// src/app/(dashboard)/students/page.tsx
import Link from "next/link";
import { Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/PageHeader";
import { YearGroupTabs } from "@/components/students/YearGroupTabs";
import { StudentFilters } from "@/components/students/StudentFilters";
import { StudentTable } from "@/components/students/StudentTable";
import { can } from "@/lib/permissions";
import type { Prisma } from "@prisma/client";
import { YearGroup, SenStatus } from "@prisma/client";

interface StudentsPageProps {
  searchParams: {
    year?: string;
    q?: string;
    subjectId?: string;
    senStatus?: string;
    causeForConcern?: string;
  };
}

export default async function StudentsPage({ searchParams }: StudentsPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { year, q, subjectId, senStatus, causeForConcern } = searchParams;

  const where: Prisma.StudentWhereInput = {
    deletedAt: null,
    ...(year ? { yearGroup: year as YearGroup } : {}),
    ...(senStatus ? { senStatus: senStatus as SenStatus } : {}),
    ...(causeForConcern === "true" ? { causeForConcern: true } : {}),
    ...(subjectId ? { enrolments: { some: { subjectId } } } : {}),
    ...(q
      ? {
          OR: [
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
            { studentId: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [students, subjects, yearCounts] = await Promise.all([
    prisma.student.findMany({
      where,
      orderBy: [{ yearGroup: "asc" }, { lastName: "asc" }],
      select: {
        id: true,
        studentId: true,
        firstName: true,
        lastName: true,
        yearGroup: true,
        senStatus: true,
        causeForConcern: true,
        overallAttendance: true,
      },
    }),
    prisma.subject.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.student.groupBy({ by: ["yearGroup"], where: { deletedAt: null }, _count: true }),
  ]);

  const counts: Record<string, number> = { ALL: yearCounts.reduce((sum, y) => sum + y._count, 0) };
  for (const y of yearCounts) counts[y.yearGroup] = y._count;

  const studentsForTable = students.map((s) => ({
    ...s,
    overallAttendance: s.overallAttendance ? Number(s.overallAttendance) : null,
  }));

  const canAddStudent = can(session.user.role, "STUDENT_CREATE");

  return (
    <div>
      <PageHeader
        title="Students"
        description="Browse pupils by year group, search and filter."
        actions={
          canAddStudent ? (
            <div className="flex items-center gap-4">
              <Link href="/students/deleted" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Deleted students
              </Link>
              <Link
                href="/students/new"
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition-default hover:opacity-90"
              >
                <Plus size={16} /> Add student
              </Link>
            </div>
          ) : null
        }
      />

      <YearGroupTabs counts={counts} />
      <StudentFilters subjects={subjects} />

      <div className="mt-6">
        <StudentTable students={studentsForTable} />
      </div>
    </div>
  );
}
