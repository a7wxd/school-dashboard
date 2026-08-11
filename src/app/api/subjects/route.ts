// src/app/api/subjects/route.ts
import { prisma } from "@/lib/prisma";
import { requirePermission, handleAuthError } from "@/lib/session";
import { logActivity } from "@/lib/activity-log";
import { createSubjectSchema } from "@/lib/validation/subject";

export async function POST(request: Request) {
  try {
    const actingUser = await requirePermission("SUBJECT_MANAGE");

    const body = await request.json();
    const parsed = createSubjectSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { name, code, appliesToYearGroups } = parsed.data;

    const existing = await prisma.subject.findUnique({ where: { code } });
    if (existing) {
      return Response.json({ error: "A subject with that code already exists" }, { status: 409 });
    }

    const subject = await prisma.subject.create({
      data: { name, code, appliesToYearGroups },
    });

    await logActivity({
      userId: actingUser.id,
      action: "SUBJECT_CREATED",
      entityType: "Subject",
      entityId: subject.id,
      metadata: { name: subject.name, code: subject.code },
    });

    return Response.json({ subject }, { status: 201 });
  } catch (error) {
    return handleAuthError(error) ?? Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
