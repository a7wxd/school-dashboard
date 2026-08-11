// src/app/(dashboard)/settings/report-templates/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/permissions";
import { ReportTemplateForm } from "@/components/settings/ReportTemplateForm";

export default async function ReportTemplatesSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!can(session.user.role, "SETTINGS_MANAGE")) redirect("/settings/profile");

  const settings = await prisma.schoolSettings.findFirst();
  const config = (settings?.reportTemplateConfig as { footerNote?: string } | null) ?? null;

  return <ReportTemplateForm initialFooterNote={config?.footerNote ?? ""} />;
}
