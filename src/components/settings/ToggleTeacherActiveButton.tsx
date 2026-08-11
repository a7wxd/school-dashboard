"use client";

// src/components/settings/ToggleTeacherActiveButton.tsx
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

export function ToggleTeacherActiveButton({
  teacherId,
  teacherName,
  isActive,
}: {
  teacherId: string;
  teacherName: string;
  isActive: boolean;
}) {
  const router = useRouter();

  async function handleConfirm() {
    const res = await fetch(`/api/teachers/${teacherId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    if (!res.ok) throw new Error(`Couldn't ${isActive ? "deactivate" : "reactivate"} this account.`);
    router.refresh();
  }

  return (
    <ConfirmDialog
      trigger={
        <button
          className={`text-sm font-medium hover:underline ${isActive ? "text-danger" : "text-brand"}`}
        >
          {isActive ? "Deactivate" : "Reactivate"}
        </button>
      }
      title={`${isActive ? "Deactivate" : "Reactivate"} ${teacherName}?`}
      description={
        isActive
          ? "They'll no longer be able to sign in, but their account and history (grades entered, reports sent) are kept intact and can be reactivated at any time."
          : "They'll be able to sign in again immediately."
      }
      confirmLabel={isActive ? "Deactivate" : "Reactivate"}
      destructive={isActive}
      onConfirm={handleConfirm}
    />
  );
}
