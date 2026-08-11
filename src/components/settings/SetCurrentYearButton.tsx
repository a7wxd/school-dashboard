"use client";

// src/components/settings/SetCurrentYearButton.tsx
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

export function SetCurrentYearButton({ academicYearId, label }: { academicYearId: string; label: string }) {
  const router = useRouter();

  async function handleConfirm() {
    const res = await fetch(`/api/academic-years/${academicYearId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isCurrent: true }),
    });
    if (!res.ok) throw new Error("Couldn't set this as the current academic year.");
    router.refresh();
  }

  return (
    <ConfirmDialog
      trigger={
        <button className="text-sm font-medium text-brand hover:underline">Set as current</button>
      }
      title={`Set ${label} as the current academic year?`}
      description="New students will be enrolled against this year, and it becomes the year shown across dashboards, reports, and analytics."
      confirmLabel="Set as current"
      destructive={false}
      onConfirm={handleConfirm}
    />
  );
}
