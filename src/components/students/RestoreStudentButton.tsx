"use client";

// src/components/students/RestoreStudentButton.tsx
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

export function RestoreStudentButton({ studentId, studentName }: { studentId: string; studentName: string }) {
  const router = useRouter();

  async function handleConfirm() {
    const res = await fetch(`/api/students/${studentId}/restore`, { method: "POST" });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.error ?? "Couldn't restore this student.");
    }
    router.refresh();
  }

  return (
    <ConfirmDialog
      trigger={
        <button className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline">
          <RotateCcw size={14} /> Restore
        </button>
      }
      title={`Restore ${studentName}?`}
      description="They'll reappear in the Students list and their profile becomes viewable normally again."
      confirmLabel="Restore"
      destructive={false}
      onConfirm={handleConfirm}
    />
  );
}
