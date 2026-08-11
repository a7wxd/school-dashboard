// src/app/api/subjects/[id]/route.ts
// No hard delete — per ARCHITECTURE.md §3, removing a subject with existing
// enrolments would break historical grade/report data. Admins instead toggle
// isActive, which removes it from new-enrolment pickers system-wide
// immediately without touching history.

import { prisma } from "@/lib/prisma";
import { requirePermission, handleAuthError } from "@/lib/session";
import { logActivity } from "@/lib/activity-log";
import { updateSubjectSchema } from "@/lib/validation/subject";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const actingUser = await requirePermission("SUBJECT_MANAGE");

    const existing = await prisma.subject.findUnique({ where: { id: params.id } });
    if (!existing) return Response.json({ error: "Subject not found" }, { status: 404 });

    const body = await request.json();
    const parsed = updateSubjectSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const updated = await prisma.subject.update({
      where: { id: params.id },
      data: parsed.data,
    });

    await logActivity({
      userId: actingUser.id,
      action: parsed.data.isActive !== undefined ? "SUBJECT_DEACTIVATED" : "SUBJECT_UPDATED",
      entityType: "Subject",
      entityId: params.id,
      metadata: parsed.data,
    });

    return Response.json({ subject: updated });
  } catch (error) {
    return handleAuthError(error) ?? Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
