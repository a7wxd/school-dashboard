// src/app/api/academic-years/route.ts
import { prisma } from "@/lib/prisma";
import { requirePermission, handleAuthError } from "@/lib/session";
import { logActivity } from "@/lib/activity-log";
import { academicYearSchema } from "@/lib/validation/academic-year";

export async function POST(request: Request) {
  try {
    const actingUser = await requirePermission("SETTINGS_MANAGE");

    const body = await request.json();
    const parsed = academicYearSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const data = parsed.data;

    const existing = await prisma.academicYear.findUnique({ where: { label: data.label } });
    if (existing) {
      return Response.json({ error: "An academic year with that label already exists" }, { status: 409 });
    }

    const academicYear = await prisma.academicYear.create({
      data: {
        label: data.label,
        term1Start: new Date(data.term1Start),
        term1End: new Date(data.term1End),
        term2Start: new Date(data.term2Start),
        term2End: new Date(data.term2End),
        term3Start: new Date(data.term3Start),
        term3End: new Date(data.term3End),
        isCurrent: false,
      },
    });

    await logActivity({
      userId: actingUser.id,
      action: "SETTINGS_UPDATED",
      entityType: "AcademicYear",
      entityId: academicYear.id,
      metadata: { created: academicYear.label },
    });

    return Response.json({ academicYear }, { status: 201 });
  } catch (error) {
    return handleAuthError(error) ?? Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
