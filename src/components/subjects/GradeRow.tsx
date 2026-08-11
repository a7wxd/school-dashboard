"use client";

// src/components/subjects/GradeRow.tsx
import { useState } from "react";
import Link from "next/link";
import { useAutosave } from "@/hooks/useAutosave";
import { AutosaveIndicator } from "@/components/shared/AutosaveIndicator";

const BEHAVIOUR_OPTIONS = ["OUTSTANDING", "GOOD", "REQUIRES_IMPROVEMENT", "CAUSE_FOR_CONCERN"] as const;
const ATTITUDE_OPTIONS = ["EXCELLENT", "GOOD", "REQUIRES_IMPROVEMENT", "CAUSE_FOR_CONCERN"] as const;

export interface GradeRowData {
  termRecordId: string;
  student: { id: string; firstName: string; lastName: string; studentId: string };
  currentGrade: number | null;
  workingAtGrade: number | null;
  predictedGrade: number | null;
  targetGrade: number | null;
  differenceFromTarget: number | null;
  behaviourRating: string | null;
  attitudeToLearning: string | null;
  teacherComment: string | null;
}

function ProgressBadge({ diff }: { diff: number | null }) {
  if (diff === null) return <span className="text-xs text-muted-foreground">—</span>;
  if (diff > 0) return <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">+{diff}</span>;
  if (diff === 0) return <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">On target</span>;
  return <span className="rounded-full bg-danger/10 px-2 py-0.5 text-xs font-medium text-danger">{diff}</span>;
}

const gradeInputClass =
  "w-14 rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground transition-default focus:border-brand focus:outline-none disabled:bg-muted disabled:text-muted-foreground";

export function GradeRow({ row, canOverridePredicted }: { row: GradeRowData; canOverridePredicted: boolean }) {
  const [values, setValues] = useState(row);

  const { status, trigger, flush } = useAutosave<GradeRowData>(async (value) => {
    const payload: Record<string, unknown> = {
      currentGrade: value.currentGrade,
      workingAtGrade: value.workingAtGrade,
      targetGrade: value.targetGrade,
      behaviourRating: value.behaviourRating,
      attitudeToLearning: value.attitudeToLearning,
      teacherComment: value.teacherComment,
    };
    if (canOverridePredicted) payload.predictedGrade = value.predictedGrade;

    const res = await fetch(`/api/term-records/${value.termRecordId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Save failed");

    const data = await res.json();
    setValues((prev) => ({
      ...prev,
      differenceFromTarget: data.termRecord.differenceFromTarget,
      predictedGrade: data.termRecord.predictedGrade,
    }));
  });

  function update(patch: Partial<GradeRowData>) {
    const next = { ...values, ...patch };
    setValues(next);
    trigger(next);
  }

  function saveNow() {
    flush(values);
  }

  return (
    <tr className="transition-default hover:bg-muted/40">
      <td className="px-4 py-2.5">
        <Link href={`/students/${values.student.id}`} className="font-medium text-foreground hover:text-brand">
          {values.student.firstName} {values.student.lastName}
        </Link>
        <p className="text-xs text-muted-foreground">{values.student.studentId}</p>
      </td>
      <td className="px-4 py-2.5">
        <input
          type="number" min={1} max={9}
          value={values.currentGrade ?? ""}
          onChange={(e) => update({ currentGrade: e.target.value ? parseInt(e.target.value) : null })}
          onBlur={saveNow}
          className={gradeInputClass}
        />
      </td>
      <td className="px-4 py-2.5">
        <input
          type="number" min={1} max={9}
          value={values.workingAtGrade ?? ""}
          onChange={(e) => update({ workingAtGrade: e.target.value ? parseInt(e.target.value) : null })}
          onBlur={saveNow}
          className={gradeInputClass}
        />
      </td>
      <td className="px-4 py-2.5">
        {canOverridePredicted ? (
          <input
            type="number" min={1} max={9}
            value={values.predictedGrade ?? ""}
            onChange={(e) => update({ predictedGrade: e.target.value ? parseInt(e.target.value) : null })}
            onBlur={saveNow}
            className={gradeInputClass}
            title="Admin override — otherwise auto-calculated from grade trend"
          />
        ) : (
          <span className="text-sm text-muted-foreground">{values.predictedGrade ?? "N/A"}</span>
        )}
      </td>
      <td className="px-4 py-2.5">
        <input
          type="number" min={1} max={9}
          value={values.targetGrade ?? ""}
          onChange={(e) => update({ targetGrade: e.target.value ? parseInt(e.target.value) : null })}
          onBlur={saveNow}
          className={gradeInputClass}
        />
      </td>
      <td className="px-4 py-2.5"><ProgressBadge diff={values.differenceFromTarget} /></td>
      <td className="px-4 py-2.5">
        <select
          value={values.behaviourRating ?? ""}
          onChange={(e) => { update({ behaviourRating: e.target.value || null }); }}
          onBlur={saveNow}
          className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:border-brand focus:outline-none"
        >
          <option value="">—</option>
          {BEHAVIOUR_OPTIONS.map((o) => (
            <option key={o} value={o}>{o.replace(/_/g, " ").toLowerCase()}</option>
          ))}
        </select>
      </td>
      <td className="px-4 py-2.5">
        <select
          value={values.attitudeToLearning ?? ""}
          onChange={(e) => { update({ attitudeToLearning: e.target.value || null }); }}
          onBlur={saveNow}
          className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:border-brand focus:outline-none"
        >
          <option value="">—</option>
          {ATTITUDE_OPTIONS.map((o) => (
            <option key={o} value={o}>{o.replace(/_/g, " ").toLowerCase()}</option>
          ))}
        </select>
      </td>
      <td className="px-4 py-2.5">
        <input
          type="text"
          value={values.teacherComment ?? ""}
          onChange={(e) => update({ teacherComment: e.target.value })}
          onBlur={saveNow}
          placeholder="Comment…"
          className="w-40 rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground focus:border-brand focus:outline-none"
        />
      </td>
      <td className="px-4 py-2.5">
        <AutosaveIndicator status={status} />
      </td>
    </tr>
  );
}
