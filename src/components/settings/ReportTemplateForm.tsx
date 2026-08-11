"use client";

// src/components/settings/ReportTemplateForm.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function ReportTemplateForm({ initialFooterNote }: { initialFooterNote: string }) {
  const router = useRouter();
  const [footerNote, setFooterNote] = useState(initialFooterNote);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    setSaved(false);
    const res = await fetch("/api/settings/report-template", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ footerNote }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(typeof data?.error === "string" ? data.error : "Couldn't save.");
      setIsSaving(false);
      return;
    }
    setSaved(true);
    setIsSaving(false);
    router.refresh();
  }

  return (
    <div className="max-w-xl rounded-xl border border-border bg-card p-6">
      <h2 className="font-serif text-lg font-medium text-foreground">Report footer note</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Optional — appears at the bottom of every generated report (term and end-of-year), under the signature. The
        rest of the report's structure and section order is fixed and can't be customised, to keep every report
        consistent for staff and parents.
      </p>
      <textarea
        rows={3}
        value={footerNote}
        onChange={(e) => setFooterNote(e.target.value)}
        placeholder="e.g. school address, a motto, or a contact line for questions"
        className="mt-4 w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
      />
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition-default hover:opacity-90 disabled:opacity-60"
        >
          {isSaving && <Loader2 size={14} className="animate-spin" />}
          Save
        </button>
        {saved && !isSaving && <span className="text-sm text-success">Saved</span>}
      </div>
    </div>
  );
}
