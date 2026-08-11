"use client";

// src/components/settings/AcademicYearForm.tsx
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { academicYearSchema, type AcademicYearInput } from "@/lib/validation/academic-year";

const inputClass =
  "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none";
const labelClass = "text-xs font-medium text-muted-foreground";

export function AcademicYearForm() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const titleId = useId();

  useEscapeKey(isOpen, () => setIsOpen(false));

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AcademicYearInput>({ resolver: zodResolver(academicYearSchema) });

  async function onSubmit(values: AcademicYearInput) {
    setError(null);
    const res = await fetch("/api/academic-years", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(typeof data?.error === "string" ? data.error : "Couldn't create the academic year.");
      return;
    }
    reset();
    setIsOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition-default hover:opacity-90"
      >
        <Plus size={16} /> Add academic year
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onClick={() => setIsOpen(false)}>
          <div role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 id={titleId} className="font-serif text-lg font-medium text-foreground">Add academic year</h2>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4" noValidate>
              <div className="space-y-1">
                <label className={labelClass}>Label</label>
                <input placeholder="2027/2028" className={inputClass} {...register("label")} />
                {errors.label && <p className="text-xs text-danger">{errors.label.message}</p>}
              </div>

              {(["term1", "term2", "term3"] as const).map((term, i) => (
                <div key={term} className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className={labelClass}>Term {i + 1} start</label>
                    <input type="date" className={inputClass} {...register(`${term}Start` as const)} />
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass}>Term {i + 1} end</label>
                    <input type="date" className={inputClass} {...register(`${term}End` as const)} />
                  </div>
                </div>
              ))}

              {error && <p className="text-sm text-danger">{error}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition-default hover:opacity-90 disabled:opacity-60"
                >
                  {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
```

## `src/components/settings/CreateTeacherDialog.tsx`

```tsx
"use client";

// src/components/settings/CreateTeacherDialog.tsx
import { useId, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { createTeacherSchema, type CreateTeacherInput } from "@/lib/validation/teacher";

interface SubjectOption {
  id: string;
  name: string;
}

const inputClass =
  "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none";
const labelClass = "text-xs font-medium text-muted-foreground";

export function CreateTeacherDialog({ subjects }: { subjects: SubjectOption[] }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const titleId = useId();

  useEscapeKey(isOpen, () => setIsOpen(false));

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateTeacherInput>({
    resolver: zodResolver(createTeacherSchema),
    defaultValues: { subjectIds: [] },
  });

  async function onSubmit(values: CreateTeacherInput) {
    setError(null);
    const res = await fetch("/api/teachers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(typeof data?.error === "string" ? data.error : "Couldn't create the teacher account.");
      return;
    }
    reset();
    setIsOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition-default hover:opacity-90"
      >
        <Plus size={16} /> Add teacher
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onClick={() => setIsOpen(false)}>
          <div role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 id={titleId} className="font-serif text-lg font-medium text-foreground">Add teacher</h2>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4" noValidate>
              <div className="space-y-1">
                <label className={labelClass}>Full name</label>
                <input className={inputClass} {...register("fullName")} />
                {errors.fullName && <p className="text-xs text-danger">{errors.fullName.message}</p>}
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Email</label>
                <input type="email" className={inputClass} {...register("email")} />
                {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Temporary password</label>
                <input type="password" className={inputClass} {...register("password")} />
                {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Subjects taught</label>
                <Controller
                  control={control}
                  name="subjectIds"
                  render={({ field }) => (
                    <select
                      multiple
                      value={field.value}
                      onChange={(e) => field.onChange(Array.from(e.target.selectedOptions, (o) => o.value))}
                      className={`${inputClass} h-28`}
                    >
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  )}
                />
                <p className="text-xs text-muted-foreground">Cmd/Ctrl-click to select multiple.</p>
              </div>

              {error && <p className="text-sm text-danger">{error}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition-default hover:opacity-90 disabled:opacity-60"
                >
                  {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                  Create account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
