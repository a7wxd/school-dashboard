// src/app/(dashboard)/students/deleted/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/permissions";
import { PageHeader } from "@/components/layout/PageHeader";
import { RestoreStudentButton } from "@/components/students/RestoreStudentButton";

export default async function DeletedStudentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!can(session.user.role, "STUDENT_RESTORE")) redirect("/students");

  const students = await prisma.student.findMany({
    where: { deletedAt: { not: null } },
    orderBy: { deletedAt: "desc" },
    select: { id: true, studentId: true, firstName: true, lastName: true, yearGroup: true, deletedAt: true },
  });

  return (
    <div>
      <PageHeader title="Deleted students" description="Removed students are hidden, not erased — restore them here at any time." />

      {students.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">No students have been removed.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Student ID</th>
                <th className="px-5 py-3 font-medium">Year</th>
                <th className="px-5 py-3 font-medium">Removed</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {students.map((student) => (
                <tr key={student.id}>
                  <td className="px-5 py-3.5 font-medium text-foreground">{student.firstName} {student.lastName}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{student.studentId}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{student.yearGroup.replace("Y", "Year ")}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {student.deletedAt ? new Date(student.deletedAt).toLocaleDateString("en-GB") : "—"}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <RestoreStudentButton studentId={student.id} studentName={`${student.firstName} ${student.lastName}`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
