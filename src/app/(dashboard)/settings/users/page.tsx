// src/app/(dashboard)/settings/users/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/permissions";
import { CreateTeacherDialog } from "@/components/settings/CreateTeacherDialog";
import { ToggleTeacherActiveButton } from "@/components/settings/ToggleTeacherActiveButton";

export default async function UsersSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!can(session.user.role, "USER_MANAGE")) redirect("/settings/profile");

  const [teachers, subjects] = await Promise.all([
    prisma.user.findMany({
      where: { role: "TEACHER" },
      select: {
        id: true,
        fullName: true,
        email: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        teacherSubjects: { select: { subject: { select: { name: true } } } },
      },
      orderBy: { fullName: "asc" },
    }),
    prisma.subject.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-lg font-medium text-foreground">Teacher accounts</h2>
          <p className="text-sm text-muted-foreground">Create, edit, deactivate, and reactivate teacher accounts.</p>
        </div>
        <CreateTeacherDialog subjects={subjects} />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Subjects</th>
              <th className="px-5 py-3 font-medium">Last login</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {teachers.map((teacher) => (
              <tr key={teacher.id} className="transition-default hover:bg-muted/40">
                <td className="px-5 py-3.5 font-medium text-foreground">{teacher.fullName}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{teacher.email}</td>
                <td className="px-5 py-3.5 text-muted-foreground">
                  {teacher.teacherSubjects.length > 0
                    ? teacher.teacherSubjects.map((ts) => ts.subject.name).join(", ")
                    : "—"}
                </td>
                <td className="px-5 py-3.5 text-muted-foreground">
                  {teacher.lastLoginAt ? new Date(teacher.lastLoginAt).toLocaleDateString("en-GB") : "Never"}
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      teacher.isActive ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {teacher.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <ToggleTeacherActiveButton teacherId={teacher.id} teacherName={teacher.fullName} isActive={teacher.isActive} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
