// src/app/api/reports/[id]/approve/route.ts
// Approving locks the snapshot (ARCHITECTURE.md §6) — after this, PATCH
// /api/reports/[id] refuses further edits, and Send becomes available.

import { prisma } from "@/lib/prisma";
import { requirePermission, handleAuthError } from "@/lib/session";
import { logActivity } from "@/lib/activity-log";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  try {
    const actingUser = await requirePermission("REPORT_APPROVE");

    const existing = await prisma.report.findUnique({ where: { id: params.id } });
    if (!existing) return Response.json({ error: "Report not found" }, { status: 404 });
    if (existing.status === "APPROVED" || existing.status === "SENT") {
      return Response.json({ error: "This report is already approved." }, { status: 409 });
    }

    const updated = await prisma.report.update({
      where: { id: params.id },
      data: { status: "APPROVED", approvedById: actingUser.id, approvedAt: new Date() },
    });

    await logActivity({
      userId: actingUser.id,
      action: "REPORT_APPROVED",
      entityType: "Report",
      entityId: params.id,
    });

    return Response.json({ report: updated });
  } catch (error) {
    return handleAuthError(error) ?? Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
