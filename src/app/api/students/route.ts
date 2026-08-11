// src/app/api/students/route.ts
import { requirePermission, handleAuthError } from "@/lib/session";
import { logActivity } from "@/lib/activity-log";
import { createStudentSchema } from "@/lib/validation/student";
import { createStudentWithEnrolments } from "@/lib/students";

export async function POST(request: Request) {
  try {
    const actingUser = await requirePermission("STUDENT_CREATE");

    const body = await request.json();
    const parsed = createStudentSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const student = await createStudentWithEnrolments(parsed.data, actingUser.id);

    await logActivity({
      userId: actingUser.id,
      action: "STUDENT_CREATED",
      entityType: "Student",
      entityId: student.id,
      metadata: { studentId: student.studentId, name: `${student.firstName} ${student.lastName}` },
    });

    return Response.json({ student }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("academic year")) {
      return Response.json({ error: error.message }, { status: 422 });
    }
    return handleAuthError(error) ?? Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
