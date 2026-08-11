"use client";

// src/components/subjects/TeacherAssignmentPanel.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";

interface TeacherOption {
  id: string;
  fullName: string;
}

interface TeacherAssignmentPanelProps {
  subjectId: string;
  assignedTeachers: TeacherOption[];
  allTeachers: TeacherOption[];
  canManage: boolean;
}

export function TeacherAssignmentPanel({
  subjectId,
  assignedTeachers,
  allTeachers,
  canManage,
}: TeacherAssignmentPanelProps) {
  const router = useRouter();
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableTeachers = allTeachers.filter(
    (t) => !assignedTeachers.some((assigned) => assigned.id === t.id)
  );

  async function addTeacher() {
    if (!selectedTeacherId) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/subjects/${subjectId}/teachers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId: selectedTeacherId }),
      });
      if (!res.ok) throw new Error("Couldn't add that teacher.");
      setSelectedTeacherId("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function removeTeacher(teacherId: string) {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/subjects/${subjectId}/teachers`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId }),
      });
      if (!res.ok) throw new Error("Couldn't remove that teacher.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="font-serif text-lg font-medium text-foreground">Teachers</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Any teacher added here can enter grades for every year group of this subject — some
        teachers cover every class, others just one or two.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {assignedTeachers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No teachers assigned yet.</p>
        ) : (
          assignedTeachers.map((teacher) => (
            <span
              key={teacher.id}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 py-1 pl-3 pr-1.5 text-sm font-medium text-brand"
            >
              {teacher.fullName}
              {canManage && (
                <button
                  onClick={() => removeTeacher(teacher.id)}
                  disabled={isSubmitting}
                  className="flex h-4 w-4 items-center justify-center rounded-full transition-default hover:bg-brand/20"
                  aria-label={`Remove ${teacher.fullName}`}
                >
                  <X size={11} />
                </button>
              )}
            </span>
          ))
        )}
      </div>

      {canManage && (
        <div className="mt-4 flex items-center gap-2">
          <select
            value={selectedTeacherId}
            onChange={(e) => setSelectedTeacherId(e.target.value)}
            className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
          >
            <option value="">Select a teacher to add…</option>
            {availableTeachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.fullName}
              </option>
            ))}
          </select>
          <button
            onClick={addTeacher}
            disabled={!selectedTeacherId || isSubmitting}
            className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-brand-foreground transition-default hover:opacity-90 disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Add
          </button>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}
