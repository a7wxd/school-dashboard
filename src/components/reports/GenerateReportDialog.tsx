"use client";

// src/components/reports/GenerateReportDialog.tsx
import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { FilePlus, Loader2, X } from "lucide-react";
import { useEscapeKey } from "@/hooks/useEscapeKey";

interface StudentOption {
  id: string;
  firstName: string;
  lastName: string;
  yearGroup: string;
}

export function GenerateReportDialog({ students }: { students: StudentOption[] }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [type, setType] = useState<"TERM" | "END_OF_YEAR">("TERM");
  const [term, setTerm] = useState("TERM_1");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const titleId = useId();

  useEscapeKey(isOpen, () => setIsOpen(false));

  async function handleGenerate() {
    if (!studentId) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, type, ...(type === "TERM" ? { term } : {}) }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(typeof data?.error === "string" ? data.error : "Couldn't generate the report.");
      }
      const { report } = await res.json();
      setIsOpen(false);
      router.push(`/reports/${report.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition-default hover:opacity-90"
      >
        <FilePlus size={16} /> Generate report
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onClick={() => setIsOpen(false)}>
          <div role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 id={titleId} className="font-serif text-lg font-medium text-foreground">Generate report</h2>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Student</label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-brand focus:outline-none"
                >
                  <option value="">Select a student…</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} — {s.yearGroup.replace("Y", "Year ")}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Report type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as "TERM" | "END_OF_YEAR")}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-brand focus:outline-none"
                >
                  <option value="TERM">Term report</option>
                  <option value="END_OF_YEAR">End of year report</option>
                </select>
              </div>
              {type === "TERM" && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Term</label>
                  <select
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-brand focus:outline-none"
                  >
                    <option value="TERM_1">Term 1</option>
                    <option value="TERM_2">Term 2</option>
                    <option value="TERM_3">Term 3</option>
                  </select>
                </div>
              )}
            </div>

            {error && <p className="mt-3 text-sm text-danger">{error}</p>}

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsOpen(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={!studentId || isSubmitting}
                className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition-default hover:opacity-90 disabled:opacity-60"
              >
                {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
