// src/app/api/teachers/route.ts
// ADMIN-only: list all teachers and create new teacher accounts. This is the
// backend foundation for Settings → Users (full UI built in Stage 11) and the
// reference pattern every other protected route in this project should follow:
// requirePermission() first, Zod-validate the body, mutate, then logActivity().

import { prisma } from "@/lib/prisma";
import { requirePermission, handleAuthError } from "@/lib/session";
import { hashPassword } from "@/lib/password";
import { logActivity } from "@/lib/activity-log";
import { createTeacherSchema } from "@/lib/validation/teacher";
import { Role } from "@prisma/client";

export async function GET() {
  try {
    await requirePermission("USER_MANAGE");

    const teachers = await prisma.user.findMany({
      where: { role: Role.TEACHER },
      select: {
        id: true,
        fullName: true,
        email: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        teacherSubjects: {
          select: { subject: { select: { id: true, name: true } } },
        },
      },
      orderBy: { fullName: "asc" },
    });

    return Response.json({ teachers });
  } catch (error) {
    return handleAuthError(error) ?? Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const actingUser = await requirePermission("USER_MANAGE");

    const body = await request.json();
    const parsed = createTeacherSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { fullName, email, password, subjectIds } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return Response.json({ error: "A user with that email already exists" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const teacher = await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash,
        role: Role.TEACHER,
        teacherSubjects: {
          create: subjectIds.map((subjectId) => ({ subjectId })),
        },
      },
      select: { id: true, fullName: true, email: true, createdAt: true },
    });

    await logActivity({
      userId: actingUser.id,
      action: "TEACHER_CREATED",
      entityType: "User",
      entityId: teacher.id,
      metadata: { fullName: teacher.fullName, email: teacher.email },
    });

    return Response.json({ teacher }, { status: 201 });
  } catch (error) {
    return handleAuthError(error) ?? Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
