// src/app/(dashboard)/students/new/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { AddStudentForm } from "@/components/students/AddStudentForm";
import { can } from "@/lib/permissions";

export default async function NewStudentPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!can(session.user.role, "STUDENT_CREATE")) redirect("/students");

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Add student"
        description="Creates a Student ID automatically and enrols them in every subject for their year group."
      />
      <AddStudentForm />
    </div>
  );
}
