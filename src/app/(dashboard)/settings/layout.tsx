// src/app/(dashboard)/settings/layout.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { SettingsSubNav } from "@/components/settings/SettingsSubNav";
import { ADMIN_SETTINGS_NAV, TEACHER_SETTINGS_NAV } from "@/lib/settings-navigation";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const navItems = session.user.role === "ADMIN" ? ADMIN_SETTINGS_NAV : TEACHER_SETTINGS_NAV;

  return (
    <div>
      <PageHeader title="Settings" description="School branding, academic year, users, and templates." />
      <SettingsSubNav items={navItems} />
      <div className="pt-6">{children}</div>
    </div>
  );
}
