// src/app/api/reports/generate/route.ts
import { prisma } from "@/lib/prisma";
import { requirePermission, handleAuthError } from "@/lib/session";
import { logActivity } from "@/lib/activity-log";
import { generateReportSchema } from "@/lib/validation/report";
import { buildReportSnapshot, buildEndOfYearSnapshot } from "@/lib/reports";

export async function POST(request: Request) {
  try {
    const actingUser = await requirePermission("REPORT_GENERATE");

    const body = await request.json();
    const parsed = generateReportSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { studentId, type, term } = parsed.data;

    const userRecord = await prisma.user.findUnique({ where: { id: actingUser.id } });
    if (!userRecord) return Response.json({ error: "User not found" }, { status: 404 });

    const { snapshot, academicYearId } =
      type === "END_OF_YEAR"
        ? await buildEndOfYearSnapshot(studentId, userRecord.fullName)
        : await buildReportSnapshot(studentId, term!, userRecord.fullName);

    const report = await prisma.report.create({
      data: {
        studentId,
        type,
        term: type === "END_OF_YEAR" ? null : term,
        academicYearId,
        status: "DRAFT",
        contentSnapshot: snapshot as unknown as object,
        generatedById: actingUser.id,
      },
    });

    await logActivity({
      userId: actingUser.id,
      action: "REPORT_GENERATED",
      entityType: "Report",
      entityId: report.id,
      metadata: { studentId, type, term },
    });

    return Response.json({ report }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && (error.message.includes("Student not found") || error.message.includes("academic year"))) {
      return Response.json({ error: error.message }, { status: 422 });
    }
    return handleAuthError(error) ?? Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
