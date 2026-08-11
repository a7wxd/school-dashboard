// src/app/(auth)/login/page.tsx
import { prisma } from "@/lib/prisma";
import { getCurrentTermLabel } from "@/lib/academic-year";
import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage() {
  const settings = await prisma.schoolSettings.findFirst();
  const termLabel = await getCurrentTermLabel().catch(() => null);
  const schoolName = settings?.schoolName ?? "School Management Dashboard";
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[3fr_2fr]">
      {/* Brand panel — the "register page" motif: ruled lines like a mark register,
          a quiet nod to school stationery without being twee. */}
      <div className="relative hidden overflow-hidden bg-brand lg:flex lg:flex-col lg:justify-between lg:p-14">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, transparent, transparent 47px, hsl(var(--brand-foreground)) 47px, hsl(var(--brand-foreground)) 48px)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-16 w-px opacity-[0.12]"
          style={{ backgroundColor: "hsl(var(--accent))" }}
        />

        <div className="relative z-10">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-brand-foreground/60">
            School Management Dashboard
          </p>
          <h1 className="mt-6 font-serif text-5xl font-medium leading-[1.05] text-brand-foreground">
            {schoolName}
          </h1>
        </div>

        <div className="relative z-10 flex items-end justify-between border-t border-brand-foreground/15 pt-6 text-brand-foreground/80">
          <div>
            <p className="text-xs uppercase tracking-wide text-brand-foreground/50">Today</p>
            <p className="mt-1 text-sm font-medium">{today}</p>
          </div>
          {termLabel && (
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-brand-foreground/50">Current term</p>
              <p className="mt-1 text-sm font-medium" style={{ color: "hsl(var(--accent))" }}>
                {termLabel}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-col items-center justify-center bg-background px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {schoolName}
            </p>
          </div>
          <h2 className="font-serif text-2xl font-medium text-foreground">Welcome back</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Sign in with the email and password your administrator gave you.
          </p>
          <div className="mt-8">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
