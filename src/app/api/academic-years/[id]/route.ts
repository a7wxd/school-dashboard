// src/app/api/academic-years/[id]/route.ts
import { prisma } from "@/lib/prisma";
import { requirePermission, handleAuthError } from "@/lib/session";
import { logActivity } from "@/lib/activity-log";
import { academicYearSchema } from "@/lib/validation/academic-year";
import { z } from "zod";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const actingUser = await requirePermission("SETTINGS_MANAGE");

    const body = await request.json();

    // Two possible shapes: setting as current, or editing full details.
    const setCurrentSchema = z.object({ isCurrent: z.literal(true) });
    const setCurrentParsed = setCurrentSchema.safeParse(body);

    if (setCurrentParsed.success) {
      const updated = await prisma.$transaction(async (tx) => {
        await tx.academicYear.updateMany({ where: { isCurrent: true }, data: { isCurrent: false } });
        return tx.academicYear.update({ where: { id: params.id }, data: { isCurrent: true } });
      });

      await logActivity({
        userId: actingUser.id,
        action: "SETTINGS_UPDATED",
        entityType: "AcademicYear",
        entityId: params.id,
        metadata: { setCurrent: updated.label },
      });

      return Response.json({ academicYear: updated });
    }

    const parsed = academicYearSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const data = parsed.data;

    const updated = await prisma.academicYear.update({
      where: { id: params.id },
      data: {
        label: data.label,
        term1Start: new Date(data.term1Start),
        term1End: new Date(data.term1End),
        term2Start: new Date(data.term2Start),
        term2End: new Date(data.term2End),
        term3Start: new Date(data.term3Start),
        term3End: new Date(data.term3End),
      },
    });

    await logActivity({
      userId: actingUser.id,
      action: "SETTINGS_UPDATED",
      entityType: "AcademicYear",
      entityId: params.id,
    });

    return Response.json({ academicYear: updated });
  } catch (error) {
    return handleAuthError(error) ?? Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
