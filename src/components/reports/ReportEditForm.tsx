"use client";

// src/components/reports/ReportEditForm.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface ReportEditFormProps {
  reportId: string;
  reportType?: "TERM" | "END_OF_YEAR";
  initialPraise: string;
  initialCausesForConcern: string;
  initialTargets: string;
}

const textareaClass =
  "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground transition-default placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

export function ReportEditForm({
  reportId,
  reportType = "TERM",
  initialPraise,
  initialCausesForConcern,
  initialTargets,
}: ReportEditFormProps) {
  const isEndOfYear = reportType === "END_OF_YEAR";
  const router = useRouter();
  const [praise, setPraise] = useState(initialPraise);
  const [causesForConcern, setCausesForConcern] = useState(initialCausesForConcern);
  const [targets, setTargets] = useState(initialTargets);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ praise, causesForConcern, targets }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(typeof data?.error === "string" ? data.error : "Couldn't save changes.");
      }
      setSaved(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="font-serif text-lg font-medium text-foreground">Edit before sending</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        These three sections are editable. Everything else is pulled from the student's current data.
      </p>

      <div className="mt-4 space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">{isEndOfYear ? "Strengths & achievements" : "Praise"}</label>
          <textarea rows={3} value={praise} onChange={(e) => setPraise(e.target.value)} className={textareaClass} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">{isEndOfYear ? "Recurring concerns" : "Causes for concern"}</label>
          <textarea
            rows={3}
            value={causesForConcern}
            onChange={(e) => setCausesForConcern(e.target.value)}
            className={textareaClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">{isEndOfYear ? "Recommendations for next year" : "Targets for improvement"}</label>
          <textarea rows={3} value={targets} onChange={(e) => setTargets(e.target.value)} className={textareaClass} />
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}

      <div className="mt-5 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition-default hover:opacity-90 disabled:opacity-60"
        >
          {isSaving && <Loader2 size={14} className="animate-spin" />}
          Save changes
        </button>
        {saved && !isSaving && <span className="text-sm text-success">Saved</span>}
      </div>
    </div>
  );
}
