// src/app/(dashboard)/settings/academic-year/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/permissions";
import { AcademicYearForm } from "@/components/settings/AcademicYearForm";
import { SetCurrentYearButton } from "@/components/settings/SetCurrentYearButton";

function fmt(date: Date) {
  return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default async function AcademicYearSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!can(session.user.role, "SETTINGS_MANAGE")) redirect("/settings/profile");

  const years = await prisma.academicYear.findMany({ orderBy: { label: "desc" } });

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-lg font-medium text-foreground">Academic years</h2>
          <p className="text-sm text-muted-foreground">Term dates and which year is currently active.</p>
        </div>
        <AcademicYearForm />
      </div>

      {years.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">No academic years configured yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {years.map((year) => (
            <div key={year.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <h3 className="font-serif text-base font-medium text-foreground">{year.label}</h3>
                  {year.isCurrent && (
                    <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">Current</span>
                  )}
                </div>
                {!year.isCurrent && <SetCurrentYearButton academicYearId={year.id} label={year.label} />}
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 text-sm text-muted-foreground sm:grid-cols-3">
                <p>Term 1: {fmt(year.term1Start)} – {fmt(year.term1End)}</p>
                <p>Term 2: {fmt(year.term2Start)} – {fmt(year.term2End)}</p>
                <p>Term 3: {fmt(year.term3Start)} – {fmt(year.term3End)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
