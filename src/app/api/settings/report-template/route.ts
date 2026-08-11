// src/app/api/settings/report-template/route.ts
import { prisma } from "@/lib/prisma";
import { requirePermission, handleAuthError } from "@/lib/session";
import { logActivity } from "@/lib/activity-log";
import { reportTemplateSchema } from "@/lib/validation/settings";

export async function PATCH(request: Request) {
  try {
    const actingUser = await requirePermission("SETTINGS_MANAGE");

    const body = await request.json();
    const parsed = reportTemplateSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const existing = await prisma.schoolSettings.findFirst();
    const updated = await prisma.schoolSettings.upsert({
      where: { id: "default" },
      update: { reportTemplateConfig: parsed.data },
      create: {
        id: "default",
        schoolName: existing?.schoolName ?? "School",
        reportTemplateConfig: parsed.data,
      },
    });

    await logActivity({
      userId: actingUser.id,
      action: "SETTINGS_UPDATED",
      entityType: "SchoolSettings",
      entityId: updated.id,
      metadata: { reportTemplateConfig: parsed.data },
    });

    return Response.json({ settings: updated });
  } catch (error) {
    return handleAuthError(error) ?? Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
