// src/app/api/subjects/[subjectId]/teachers/route.ts
// Adds or removes a teacher from a subject's TeacherSubject list. Deliberately
// NOT scoped to a year group or "class" — a subject can have any number of
// teachers, and any teacher linked here can enter grades for any year group
// of that subject (some teachers cover every class, others just one or two).
// Admin-only, matching SUBJECT_MANAGE.

import { prisma } from "@/lib/prisma";
import { requirePermission, handleAuthError } from "@/lib/session";
import { logActivity } from "@/lib/activity-log";
import { subjectTeacherSchema } from "@/lib/validation/subject-teacher";

export async function POST(request: Request, { params }: { params: { subjectId: string } }) {
  try {
    const actingUser = await requirePermission("SUBJECT_MANAGE");

    const body = await request.json();
    const parsed = subjectTeacherSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { teacherId } = parsed.data;

    const teacher = await prisma.user.findUnique({ where: { id: teacherId } });
    if (!teacher || teacher.role !== "TEACHER" || !teacher.isActive) {
      return Response.json({ error: "That teacher account isn't valid or is inactive" }, { status: 400 });
    }

    await prisma.teacherSubject.upsert({
      where: { teacherId_subjectId: { teacherId, subjectId: params.subjectId } },
      update: {},
      create: { teacherId, subjectId: params.subjectId },
    });

    await logActivity({
      userId: actingUser.id,
      action: "SUBJECT_UPDATED",
      entityType: "Subject",
      entityId: params.subjectId,
      metadata: { addedTeacherId: teacherId },
    });

    return Response.json({ success: true });
  } catch (error) {
    return handleAuthError(error) ?? Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { subjectId: string } }) {
  try {
    const actingUser = await requirePermission("SUBJECT_MANAGE");

    const body = await request.json();
    const parsed = subjectTeacherSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { teacherId } = parsed.data;

    await prisma.teacherSubject.deleteMany({
      where: { teacherId, subjectId: params.subjectId },
    });

    await logActivity({
      userId: actingUser.id,
      action: "SUBJECT_UPDATED",
      entityType: "Subject",
      entityId: params.subjectId,
      metadata: { removedTeacherId: teacherId },
    });

    return Response.json({ success: true });
  } catch (error) {
    return handleAuthError(error) ?? Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
