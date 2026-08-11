// src/app/(dashboard)/layout.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentTermLabel } from "@/lib/academic-year";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [settings, termLabel] = await Promise.all([
    prisma.schoolSettings.findFirst(),
    getCurrentTermLabel().catch(() => null),
  ]);

  return (
    <div className="flex min-h-screen bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-brand-foreground"
      >
        Skip to main content
      </a>
      <Sidebar schoolName={settings?.schoolName ?? "School Dashboard"} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          fullName={session.user.fullName}
          role={session.user.role}
          termLabel={termLabel}
          schoolName={settings?.schoolName ?? "School Dashboard"}
        />
        <main id="main-content" className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
