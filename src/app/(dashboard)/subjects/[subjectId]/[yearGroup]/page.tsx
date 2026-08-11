// src/app/(dashboard)/subjects/[subjectId]/[yearGroup]/page.tsx
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/PageHeader";
import { BulkGradeGrid } from "@/components/subjects/BulkGradeGrid";
import type { GradeRowData } from "@/components/subjects/GradeRow";
import { can } from "@/lib/permissions";
import { cn } from "@/lib/utils";

const TERMS = ["TERM_1", "TERM_2", "TERM_3"] as const;
const TERM_LABELS: Record<string, string> = { TERM_1: "Term 1", TERM_2: "Term 2", TERM_3: "Term 3" };

interface ClassPageProps {
  params: { subjectId: string; yearGroup: string };
  searchParams: { term?: string };
}

export default async function ClassGradeEntryPage({ params, searchParams }: ClassPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const subject = await prisma.subject.findUnique({
    where: { id: params.subjectId },
    include: { teacherSubjects: { select: { teacherId: true } } },
  });
  if (!subject || !subject.isActive || !subject.appliesToYearGroups.includes(params.yearGroup)) {
    notFound();
  }

  // Access: admins always; teachers only if linked to this subject via TeacherSubject
  // (no per-class restriction — see the design note on TeacherAssignmentPanel).
  const isAdmin = session.user.role === "ADMIN";
  const isAssignedTeacher = subject.teacherSubjects.some((ts) => ts.teacherId === session.user.id);
  if (!isAdmin && !isAssignedTeacher) {
    redirect("/subjects");
  }

  const term = TERMS.includes(searchParams.term as (typeof TERMS)[number])
    ? (searchParams.term as (typeof TERMS)[number])
    : "TERM_1";

  const academicYear = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
  if (!academicYear) notFound();

  const enrolments = await prisma.enrolment.findMany({
    where: {
      subjectId: subject.id,
      academicYearId: academicYear.id,
      student: { yearGroup: params.yearGroup, deletedAt: null },
    },
    include: {
      student: { select: { id: true, firstName: true, lastName: true, studentId: true } },
      termRecords: { where: { term } },
    },
    orderBy: { student: { lastName: "asc" } },
  });

  const rows: GradeRowData[] = enrolments
    .filter((e) => e.termRecords[0])
    .map((e) => {
      const record = e.termRecords[0];
      return {
        termRecordId: record.id,
        student: e.student,
        currentGrade: record.currentGrade,
        workingAtGrade: record.workingAtGrade,
        predictedGrade: record.predictedGrade,
        targetGrade: record.targetGrade,
        differenceFromTarget: record.differenceFromTarget,
        behaviourRating: record.behaviourRating,
        attitudeToLearning: record.attitudeToLearning,
        teacherComment: record.teacherComment,
      };
    });

  return (
    <div>
      <PageHeader
        title={`${subject.name} — ${params.yearGroup.replace("Y", "Year ")}`}
        description={`${enrolments.length} student${enrolments.length === 1 ? "" : "s"} enrolled`}
      />

      <div className="mb-5 flex gap-2 border-b border-border pb-3">
        {TERMS.map((t) => (
          <Link
            key={t}
            href={`/subjects/${subject.id}/${params.yearGroup}?term=${t}`}
            className={cn(
              "rounded-lg px-3.5 py-1.5 text-sm font-medium transition-default",
              term === t ? "bg-brand text-brand-foreground" : "text-muted-foreground hover:bg-muted"
            )}
          >
            {TERM_LABELS[t]}
          </Link>
        ))}
      </div>

      <BulkGradeGrid rows={rows} canOverridePredicted={can(session.user.role, "PREDICTED_GRADE_OVERRIDE")} />

      <p className="mt-3 text-xs text-muted-foreground">
        Changes save automatically as you edit or move to the next field. The Predicted column is
        calculated from the grade trend across terms unless an administrator overrides it.
      </p>
    </div>
  );
}
