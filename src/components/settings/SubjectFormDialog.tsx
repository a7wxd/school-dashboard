"use client";

// src/components/settings/SubjectFormDialog.tsx
import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Pencil, X } from "lucide-react";
import { useEscapeKey } from "@/hooks/useEscapeKey";

const YEAR_GROUPS = ["Y7", "Y8", "Y9", "Y10", "Y11"] as const;

interface SubjectFormDialogProps {
  mode: "create" | "edit";
  subject?: { id: string; name: string; code: string; appliesToYearGroups: string[] };
}

export function SubjectFormDialog({ mode, subject }: SubjectFormDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(subject?.name ?? "");
  const [code, setCode] = useState(subject?.code ?? "");
  const [years, setYears] = useState<string[]>(subject?.appliesToYearGroups ?? []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const titleId = useId();

  useEscapeKey(isOpen, () => setIsOpen(false));

  function toggleYear(year: string) {
    setYears((prev) => (prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]));
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);
    try {
      const res =
        mode === "create"
          ? await fetch("/api/subjects", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name, code, appliesToYearGroups: years }),
            })
          : await fetch(`/api/subjects/${subject!.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name, appliesToYearGroups: years }),
            });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(typeof data?.error === "string" ? data.error : "Couldn't save the subject.");
      }
      setIsOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {mode === "create" ? (
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition-default hover:opacity-90"
        >
          <Plus size={16} /> Add subject
        </button>
      ) : (
        <button onClick={() => setIsOpen(true)} className="text-muted-foreground transition-default hover:text-foreground" aria-label="Edit subject">
          <Pencil size={15} />
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onClick={() => setIsOpen(false)}>
          <div role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 id={titleId} className="font-serif text-lg font-medium text-foreground">
                {mode === "create" ? "Add subject" : "Edit subject"}
              </h2>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Subject name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-brand focus:outline-none"
                />
              </div>
              {mode === "create" && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Code</label>
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. ENG-LANG"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-brand focus:outline-none"
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Applies to year groups</label>
                <div className="flex flex-wrap gap-2">
                  {YEAR_GROUPS.map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => toggleYear(y)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-default ${
                        years.includes(y) ? "border-brand bg-brand/10 text-brand" : "border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {y.replace("Y", "Year ")}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && <p className="mt-3 text-sm text-danger">{error}</p>}

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsOpen(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !name || (mode === "create" && !code) || years.length === 0}
                className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition-default hover:opacity-90 disabled:opacity-60"
              >
                {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                {mode === "create" ? "Create" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
