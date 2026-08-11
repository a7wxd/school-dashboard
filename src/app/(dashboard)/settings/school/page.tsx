// src/app/(dashboard)/settings/school/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/permissions";
import { SchoolSettingsForm } from "@/components/settings/SchoolSettingsForm";

export default async function SchoolSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!can(session.user.role, "SETTINGS_MANAGE")) redirect("/settings/profile");

  const settings = await prisma.schoolSettings.findFirst();

  return (
    <SchoolSettingsForm
      initial={{
        schoolName: settings?.schoolName ?? "",
        logoUrl: settings?.logoUrl ?? "",
        primaryColour: settings?.primaryColour ?? "#1E3A8A",
        secondaryColour: settings?.secondaryColour ?? "#F59E0B",
      }}
    />
  );
}
