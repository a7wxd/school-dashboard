// src/app/api/teachers/[id]/route.ts
// ADMIN-only: edit a teacher's details, subject assignments, or active status.
// Deactivating a teacher never deletes their account or history — see
// ARCHITECTURE.md §2. A deactivated teacher's existing session is also cut off
// on their next request via requirePermission()'s isActive re-check.

import { prisma } from "@/lib/prisma";
import { requirePermission, handleAuthError } from "@/lib/session";
import { logActivity } from "@/lib/activity-log";
import { updateTeacherSchema } from "@/lib/validation/teacher";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const actingUser = await requirePermission("USER_MANAGE");

    const body = await request.json();
    const parsed = updateTeacherSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { fullName, isActive, subjectIds } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { id: params.id } });
    if (!existing || existing.role !== "TEACHER") {
      return Response.json({ error: "Teacher not found" }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const teacher = await tx.user.update({
        where: { id: params.id },
        data: {
          ...(fullName !== undefined ? { fullName } : {}),
          ...(isActive !== undefined ? { isActive } : {}),
        },
      });

      if (subjectIds !== undefined) {
        await tx.teacherSubject.deleteMany({ where: { teacherId: params.id } });
        await tx.teacherSubject.createMany({
          data: subjectIds.map((subjectId) => ({ teacherId: params.id, subjectId })),
          skipDuplicates: true,
        });
      }

      return teacher;
    });

    if (isActive !== undefined) {
      await logActivity({
        userId: actingUser.id,
        action: isActive ? "TEACHER_REACTIVATED" : "TEACHER_DEACTIVATED",
        entityType: "User",
        entityId: params.id,
      });
    } else {
      await logActivity({
        userId: actingUser.id,
        action: "TEACHER_UPDATED",
        entityType: "User",
        entityId: params.id,
        metadata: { fullName, subjectIds },
      });
    }

    return Response.json({ teacher: updated });
  } catch (error) {
    return handleAuthError(error) ?? Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
