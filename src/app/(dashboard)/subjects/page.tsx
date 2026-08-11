// src/app/(dashboard)/subjects/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/PageHeader";
import { SubjectCard } from "@/components/subjects/SubjectCard";

export default async function SubjectsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const subjects = await prisma.subject.findMany({
    where: { isActive: true },
    include: { _count: { select: { teacherSubjects: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Subjects"
        description="Pick a subject to manage its teachers or enter grades for a year group."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => (
          <SubjectCard
            key={subject.id}
            subject={{
              id: subject.id,
              name: subject.name,
              appliesToYearGroups: subject.appliesToYearGroups,
              teacherCount: subject._count.teacherSubjects,
            }}
          />
        ))}
      </div>
    </div>
  );
}
