"use client";

// src/components/students/DeleteStudentButton.tsx
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

export function DeleteStudentButton({ studentId, studentName }: { studentId: string; studentName: string }) {
  const router = useRouter();

  async function handleDelete() {
    const res = await fetch(`/api/students/${studentId}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.error ?? "Couldn't remove this student.");
    }
    router.push("/students");
    router.refresh();
  }

  return (
    <ConfirmDialog
      trigger={
        <button className="inline-flex items-center gap-1.5 rounded-lg border border-danger/30 px-4 py-2 text-sm font-medium text-danger transition-default hover:bg-danger/5">
          <Trash2 size={15} /> Remove student
        </button>
      }
      title={`Remove ${studentName}?`}
      description="This hides the student and their records from the system. Their data and any generated reports are kept and can be restored later by an administrator — nothing is permanently deleted."
      confirmLabel="Remove student"
      onConfirm={handleDelete}
    />
  );
}
