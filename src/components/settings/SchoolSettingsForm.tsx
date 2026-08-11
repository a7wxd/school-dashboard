"use client";

// src/components/settings/SchoolSettingsForm.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { schoolSettingsSchema, type SchoolSettingsInput } from "@/lib/validation/settings";

const inputClass =
  "w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground transition-default focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

export function SchoolSettingsForm({ initial }: { initial: SchoolSettingsInput }) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SchoolSettingsInput>({ resolver: zodResolver(schoolSettingsSchema), defaultValues: initial });

  const primaryColour = watch("primaryColour");
  const secondaryColour = watch("secondaryColour");

  async function onSubmit(values: SchoolSettingsInput) {
    setError(null);
    setSaved(false);
    const res = await fetch("/api/settings/school", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(typeof data?.error === "string" ? data.error : "Couldn't save settings.");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-6" noValidate>
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-serif text-lg font-medium text-foreground">Identity</h2>
        <div className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">School name</label>
            <input className={inputClass} {...register("schoolName")} />
            {errors.schoolName && <p className="text-sm text-danger">{errors.schoolName.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Logo URL</label>
            <input className={inputClass} placeholder="https://…" {...register("logoUrl")} />
            {errors.logoUrl && <p className="text-sm text-danger">{errors.logoUrl.message}</p>}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-serif text-lg font-medium text-foreground">Brand colours</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Used throughout the whole app — sidebar, buttons, charts — and on generated reports.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Primary colour</label>
            <div className="flex items-center gap-2">
              <input type="color" {...register("primaryColour")} className="h-10 w-12 rounded-lg border border-border" />
              <input className={inputClass} {...register("primaryColour")} />
            </div>
            {errors.primaryColour && <p className="text-sm text-danger">{errors.primaryColour.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Secondary colour</label>
            <div className="flex items-center gap-2">
              <input type="color" {...register("secondaryColour")} className="h-10 w-12 rounded-lg border border-border" />
              <input className={inputClass} {...register("secondaryColour")} />
            </div>
            {errors.secondaryColour && <p className="text-sm text-danger">{errors.secondaryColour.message}</p>}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-border p-3">
          <span className="h-8 w-8 rounded-full" style={{ backgroundColor: primaryColour }} />
          <span className="h-8 w-8 rounded-full" style={{ backgroundColor: secondaryColour }} />
          <span className="text-xs text-muted-foreground">Live preview — takes effect app-wide after saving.</span>
        </div>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground transition-default hover:opacity-90 disabled:opacity-60"
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          Save changes
        </button>
        {saved && !isSubmitting && <span className="text-sm text-success">Saved</span>}
      </div>
    </form>
  );
}
```

## `src/components/settings/SetCurrentYearButton.tsx`

```tsx
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
