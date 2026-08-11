"use client";

// src/components/settings/ToggleSubjectActiveButton.tsx
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

export function ToggleSubjectActiveButton({
  subjectId,
  subjectName,
  isActive,
}: {
  subjectId: string;
  subjectName: string;
  isActive: boolean;
}) {
  const router = useRouter();

  async function handleConfirm() {
    const res = await fetch(`/api/subjects/${subjectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    if (!res.ok) throw new Error(`Couldn't ${isActive ? "deactivate" : "reactivate"} this subject.`);
    router.refresh();
  }

  return (
    <ConfirmDialog
      trigger={<button className={`text-sm font-medium hover:underline ${isActive ? "text-danger" : "text-brand"}`}>{isActive ? "Deactivate" : "Reactivate"}</button>}
      title={`${isActive ? "Deactivate" : "Reactivate"} ${subjectName}?`}
      description={
        isActive
          ? "It will disappear from new-enrolment pickers and the Subjects grade-entry list immediately, but existing enrolments, grades, and reports referencing it are kept intact."
          : "It will become available again for new enrolments and grade entry."
      }
      confirmLabel={isActive ? "Deactivate" : "Reactivate"}
      destructive={isActive}
      onConfirm={handleConfirm}
    />
  );
}
