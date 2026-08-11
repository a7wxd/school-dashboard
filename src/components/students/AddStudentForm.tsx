"use client";

// src/components/students/AddStudentForm.tsx
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { createStudentSchema, type CreateStudentInput } from "@/lib/validation/student";

const inputClass =
  "w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground transition-default placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";
const labelClass = "text-sm font-medium text-foreground";

export function AddStudentForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateStudentInput>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: {
      senStatus: "NONE",
      causeForConcern: false,
      parentContacts: [{ name: "", relationship: "Parent", email: "", phone: "", isPrimaryContact: true }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "parentContacts" });
  const causeForConcern = watch("causeForConcern");

  async function onSubmit(values: CreateStudentInput) {
    setSubmitError(null);
    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setSubmitError(
        typeof data?.error === "string" ? data.error : "Couldn't add the student. Check the form and try again."
      );
      return;
    }

    const { student } = await res.json();
    router.push(`/students/${student.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
      {/* Personal details */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-serif text-lg font-medium text-foreground">Personal details</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className={labelClass}>First name</label>
            <input className={inputClass} {...register("firstName")} />
            {errors.firstName && <p className="text-sm text-danger">{errors.firstName.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Last name</label>
            <input className={inputClass} {...register("lastName")} />
            {errors.lastName && <p className="text-sm text-danger">{errors.lastName.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Year group</label>
            <select className={inputClass} {...register("yearGroup")}>
              <option value="Y7">Year 7</option>
              <option value="Y8">Year 8</option>
              <option value="Y9">Year 9</option>
              <option value="Y10">Year 10</option>
              <option value="Y11">Year 11</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Date of birth</label>
            <input type="date" className={inputClass} {...register("dateOfBirth")} />
          </div>
        </div>
      </section>

      {/* SATs scores */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-serif text-lg font-medium text-foreground">SATs scores</h2>
        <p className="mt-1 text-sm text-muted-foreground">Optional — leave blank if not available.</p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className={labelClass}>Reading score</label>
            <input type="number" className={inputClass} {...register("satsReadingScore")} />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Maths score</label>
            <input type="number" className={inputClass} {...register("satsMathsScore")} />
          </div>
        </div>
      </section>

      {/* SEN & cause for concern */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-serif text-lg font-medium text-foreground">SEN & wellbeing</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className={labelClass}>SEN status</label>
            <select className={inputClass} {...register("senStatus")}>
              <option value="NONE">None</option>
              <option value="SEN_SUPPORT">SEN Support</option>
              <option value="EHCP">EHCP</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" className="h-4 w-4 rounded border-border text-brand" {...register("causeForConcern")} />
              Flag as a cause for concern
            </label>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label className={labelClass}>SEN notes</label>
            <textarea rows={2} className={inputClass} {...register("senNotes")} />
          </div>
          {causeForConcern && (
            <div className="space-y-1.5 sm:col-span-2">
              <label className={labelClass}>Reason for concern</label>
              <textarea rows={2} className={inputClass} {...register("causeForConcernReason")} />
            </div>
          )}
        </div>
      </section>

      {/* Parent contacts */}
      <section className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-medium text-foreground">Parent / guardian contacts</h2>
          <button
            type="button"
            onClick={() => append({ name: "", relationship: "Parent", email: "", phone: "", isPrimaryContact: false })}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-default hover:opacity-80"
          >
            <Plus size={15} /> Add contact
          </button>
        </div>
        {!Array.isArray(errors.parentContacts) && errors.parentContacts?.message && (
          <p className="mt-2 text-sm text-danger">{errors.parentContacts.message}</p>
        )}

        <div className="mt-4 space-y-5">
          {fields.map((field, index) => (
            <div key={field.id} className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">Contact {index + 1}</p>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-muted-foreground transition-default hover:text-danger"
                    aria-label="Remove contact"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className={labelClass}>Name</label>
                  <input className={inputClass} {...register(`parentContacts.${index}.name` as const)} />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Relationship</label>
                  <input className={inputClass} {...register(`parentContacts.${index}.relationship` as const)} />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Email</label>
                  <input type="email" className={inputClass} {...register(`parentContacts.${index}.email` as const)} />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Phone</label>
                  <input className={inputClass} {...register(`parentContacts.${index}.phone` as const)} />
                </div>
                <label className="flex items-center gap-2 text-sm text-foreground sm:col-span-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border text-brand"
                    {...register(`parentContacts.${index}.isPrimaryContact` as const)}
                  />
                  Primary contact
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>

      {submitError && (
        <div role="alert" className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
          {submitError}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground transition-default hover:opacity-90 disabled:opacity-60"
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting ? "Adding student…" : "Add student"}
        </button>
      </div>
    </form>
  );
}
