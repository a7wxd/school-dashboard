// src/app/api/reports/[id]/pdf/route.ts
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { requireUser, handleAuthError } from "@/lib/session";
import { ReportPdfDocument } from "@/components/reports/ReportPdfDocument";
import type { ReportSnapshot } from "@/lib/reports";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    await requireUser(); // any signed-in staff member can download a report they can see

    const report = await prisma.report.findUnique({
      where: { id: params.id },
      include: { student: { select: { firstName: true, lastName: true } } },
    });
    if (!report) return Response.json({ error: "Report not found" }, { status: 404 });

    const snapshot = report.contentSnapshot as unknown as ReportSnapshot;
    const buffer = await renderToBuffer(<ReportPdfDocument snapshot={snapshot} />);

    const filename = `${report.student.firstName}-${report.student.lastName}-${report.term ?? "report"}.pdf`.replace(/\s+/g, "-");

    return new Response(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    });
  } catch (error) {
    return handleAuthError(error) ?? Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
