// src/app/(dashboard)/settings/subjects/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/permissions";
import { SubjectFormDialog } from "@/components/settings/SubjectFormDialog";
import { ToggleSubjectActiveButton } from "@/components/settings/ToggleSubjectActiveButton";

export default async function SubjectsSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!can(session.user.role, "SUBJECT_MANAGE")) redirect("/settings/profile");

  const subjects = await prisma.subject.findMany({
    include: { teacherSubjects: true },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-lg font-medium text-foreground">Subjects</h2>
          <p className="text-sm text-muted-foreground">
            Changes apply system-wide immediately — new-enrolment pickers and grade entry both read this list live.
          </p>
        </div>
        <SubjectFormDialog mode="create" />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium">Subject</th>
              <th className="px-5 py-3 font-medium">Code</th>
              <th className="px-5 py-3 font-medium">Year groups</th>
              <th className="px-5 py-3 font-medium">Teachers</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {subjects.map((subject) => (
              <tr key={subject.id} className="transition-default hover:bg-muted/40">
                <td className="px-5 py-3.5 font-medium text-foreground">{subject.name}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{subject.code}</td>
                <td className="px-5 py-3.5 text-muted-foreground">
                  {subject.appliesToYearGroups.map((y) => y.replace("Y", "Y")).join(", ")}
                </td>
                <td className="px-5 py-3.5 text-muted-foreground">{subject.teacherSubjects.length}</td>
                <td className="px-5 py-3.5">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      subject.isActive ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {subject.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-3">
                    <SubjectFormDialog mode="edit" subject={subject} />
                    <ToggleSubjectActiveButton subjectId={subject.id} subjectName={subject.name} isActive={subject.isActive} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
