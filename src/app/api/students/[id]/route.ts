// src/app/api/students/[id]/route.ts
import { prisma } from "@/lib/prisma";
import { requirePermission, handleAuthError } from "@/lib/session";
import { logActivity } from "@/lib/activity-log";

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const actingUser = await requirePermission("STUDENT_DELETE");

    const student = await prisma.student.findUnique({ where: { id: params.id } });
    if (!student || student.deletedAt) {
      return Response.json({ error: "Student not found" }, { status: 404 });
    }

    await prisma.student.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    });

    await logActivity({
      userId: actingUser.id,
      action: "STUDENT_DELETED",
      entityType: "Student",
      entityId: params.id,
      metadata: { studentId: student.studentId, name: `${student.firstName} ${student.lastName}` },
    });

    return Response.json({ success: true });
  } catch (error) {
    return handleAuthError(error) ?? Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
