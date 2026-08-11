// src/app/(dashboard)/dashboard/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { TeacherDashboard } from "@/components/dashboard/TeacherDashboard";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const isAdmin = session.user.role === "ADMIN";

  return (
    <div>
      <PageHeader
        title={isAdmin ? "School overview" : "My dashboard"}
        description={
          isAdmin
            ? "A snapshot of the whole school, right now."
            : "Your classes, students, and what needs your attention."
        }
      />
      {isAdmin ? <AdminDashboard /> : <TeacherDashboard teacherId={session.user.id} />}
    </div>
  );
}
