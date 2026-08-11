// src/app/api/reports/[id]/send/route.tsx
// Renders the report PDF once, then actually emails it to every parent
// contact on file via Resend (src/lib/email.ts). Each attempt gets its own
// ReportEmailLog row with a real deliveryStatus — SENT (accepted by the
// provider) or FAILED (with the reason, e.g. no API key configured yet).
// Report.status only moves to SENT if at least one email actually went out.

import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { requirePermission, handleAuthError } from "@/lib/session";
import { logActivity } from "@/lib/activity-log";
import { sendReportEmail } from "@/lib/email";
import { ReportPdfDocument } from "@/components/reports/ReportPdfDocument";
import type { ReportSnapshot } from "@/lib/reports";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  try {
    const actingUser = await requirePermission("REPORT_SEND");

    const report = await prisma.report.findUnique({
      where: { id: params.id },
      include: { student: { include: { parentContacts: true } } },
    });
    if (!report) return Response.json({ error: "Report not found" }, { status: 404 });
    if (report.status !== "APPROVED") {
      return Response.json({ error: "Only an approved report can be sent." }, { status: 409 });
    }
    if (report.student.parentContacts.length === 0) {
      return Response.json({ error: "This student has no parent contacts on file to send to." }, { status: 422 });
    }

    const snapshot = report.contentSnapshot as unknown as ReportSnapshot;
    const pdfBuffer = await renderToBuffer(<ReportPdfDocument snapshot={snapshot} />);
    const studentName = `${report.student.firstName} ${report.student.lastName}`;
    const pdfFilename = `${studentName}-${report.term ?? "report"}.pdf`.replace(/\s+/g, "-");

    const results = await Promise.all(
      report.student.parentContacts.map(async (contact) => {
        const result = await sendReportEmail({
          to: contact.email,
          parentName: contact.name,
          studentName,
          termLabel: snapshot.termLabel,
          schoolName: snapshot.school.name,
          pdfBuffer,
          pdfFilename,
        });

        const log = await prisma.reportEmailLog.create({
          data: {
            reportId: params.id,
            parentContactId: contact.id,
            sentById: actingUser.id,
            deliveryStatus: result.success ? "SENT" : "FAILED",
            providerMessageId: result.providerMessageId,
          },
        });

        return { contact, result, log };
      })
    );

    const anySucceeded = results.some((r) => r.result.success);
    const updated = anySucceeded
      ? await prisma.report.update({ where: { id: params.id }, data: { status: "SENT", sentAt: new Date() } })
      : report;

    await logActivity({
      userId: actingUser.id,
      action: "REPORT_SENT",
      entityType: "Report",
      entityId: params.id,
      metadata: {
        recipientCount: report.student.parentContacts.length,
        succeeded: results.filter((r) => r.result.success).length,
        failed: results.filter((r) => !r.result.success).length,
      },
    });

    return Response.json({
      report: updated,
      results: results.map((r) => ({
        email: r.contact.email,
        success: r.result.success,
        error: r.result.error ?? null,
      })),
    });
  } catch (error) {
    return handleAuthError(error) ?? Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
