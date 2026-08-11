// src/app/api/reports/[id]/route.ts
// Edits the Praise / Causes for Concern / Targets sections of a report's
// snapshot. Only allowed before approval — once APPROVED, the snapshot is
// frozen per ARCHITECTURE.md §6 and must be regenerated to change (Part B).

import { prisma } from "@/lib/prisma";
import { requirePermission, handleAuthError } from "@/lib/session";
import { logActivity } from "@/lib/activity-log";
import { updateReportContentSchema } from "@/lib/validation/report";
import type { ReportSnapshot } from "@/lib/reports";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const actingUser = await requirePermission("REPORT_EDIT");

    const existing = await prisma.report.findUnique({ where: { id: params.id } });
    if (!existing) return Response.json({ error: "Report not found" }, { status: 404 });
    if (existing.status === "APPROVED" || existing.status === "SENT") {
      return Response.json(
        { error: "This report has already been approved and can no longer be edited here." },
        { status: 409 }
      );
    }

    const body = await request.json();
    const parsed = updateReportContentSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const currentSnapshot = existing.contentSnapshot as unknown as ReportSnapshot;
    const updatedSnapshot: ReportSnapshot = {
      ...currentSnapshot,
      praise: parsed.data.praise ?? currentSnapshot.praise,
      causesForConcern: parsed.data.causesForConcern ?? currentSnapshot.causesForConcern,
      targets: parsed.data.targets ?? currentSnapshot.targets,
    };

    const updated = await prisma.report.update({
      where: { id: params.id },
      data: {
        contentSnapshot: updatedSnapshot as unknown as object,
        status: "EDITED",
      },
    });

    await logActivity({
      userId: actingUser.id,
      action: "REPORT_EDITED",
      entityType: "Report",
      entityId: params.id,
    });

    return Response.json({ report: updated });
  } catch (error) {
    return handleAuthError(error) ?? Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
