// src/app/api/settings/school/route.ts
import { prisma } from "@/lib/prisma";
import { requirePermission, handleAuthError } from "@/lib/session";
import { logActivity } from "@/lib/activity-log";
import { schoolSettingsSchema } from "@/lib/validation/settings";

export async function PATCH(request: Request) {
  try {
    const actingUser = await requirePermission("SETTINGS_MANAGE");

    const body = await request.json();
    const parsed = schoolSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { schoolName, logoUrl, primaryColour, secondaryColour } = parsed.data;

    const updated = await prisma.schoolSettings.upsert({
      where: { id: "default" },
      update: { schoolName, logoUrl: logoUrl || null, primaryColour, secondaryColour },
      create: { id: "default", schoolName, logoUrl: logoUrl || null, primaryColour, secondaryColour },
    });

    await logActivity({
      userId: actingUser.id,
      action: "SETTINGS_UPDATED",
      entityType: "SchoolSettings",
      entityId: updated.id,
    });

    return Response.json({ settings: updated });
  } catch (error) {
    return handleAuthError(error) ?? Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
