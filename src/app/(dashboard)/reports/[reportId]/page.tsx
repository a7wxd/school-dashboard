// src/app/(dashboard)/reports/[reportId]/page.tsx
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/permissions";
import { PageHeader } from "@/components/layout/PageHeader";
import { ReportPreview } from "@/components/reports/ReportPreview";
import { ReportEditForm } from "@/components/reports/ReportEditForm";
import { ReportActions } from "@/components/reports/ReportActions";
import { ReportEmailHistory } from "@/components/reports/ReportEmailHistory";
import type { ReportSnapshot } from "@/lib/reports";

const TERM_LABELS: Record<string, string> = { TERM_1: "Term 1", TERM_2: "Term 2", TERM_3: "Term 3" };

export default async function ReportDetailPage({ params }: { params: { reportId: string } }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const report = await prisma.report.findUnique({
    where: { id: params.reportId },
    include: {
      student: { select: { firstName: true, lastName: true, parentContacts: { select: { id: true } } } },
      emailLogs: {
        include: { parentContact: { select: { name: true, email: true } }, sentBy: { select: { fullName: true } } },
        orderBy: { sentAt: "desc" },
      },
    },
  });
  if (!report) notFound();

  const snapshot = report.contentSnapshot as unknown as ReportSnapshot;
  const isEditable = report.status !== "APPROVED" && report.status !== "SENT";
  const canEdit = can(session.user.role, "REPORT_EDIT") && isEditable;

  const emailLogRows = report.emailLogs.map((log) => ({
    id: log.id,
    parentName: log.parentContact.name,
    parentEmail: log.parentContact.email,
    sentByName: log.sentBy.fullName,
    sentAt: log.sentAt,
    deliveryStatus: log.deliveryStatus,
  }));

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={`${report.student.firstName} ${report.student.lastName} — ${report.term ? TERM_LABELS[report.term] : "End of year"}`}
        description={`Status: ${report.status.charAt(0) + report.status.slice(1).toLowerCase()}`}
      />

      <div className="mb-6">
        <ReportActions
          reportId={report.id}
          status={report.status}
          canApprove={can(session.user.role, "REPORT_APPROVE")}
          canSend={can(session.user.role, "REPORT_SEND")}
          parentContactCount={report.student.parentContacts.length}
        />
      </div>

      {report.status === "APPROVED" && (
        <div className="mb-6 rounded-lg border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-brand">
          This report has been approved and its content is now locked — regenerate the report if changes are needed.
        </div>
      )}

      {report.emailLogs.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 font-serif text-lg font-medium text-foreground">Email history</h2>
          <ReportEmailHistory logs={emailLogRows} />
        </section>
      )}

      <div className="space-y-6">
        {canEdit && (
          <ReportEditForm
            reportId={report.id}
            reportType={report.type}
            initialPraise={snapshot.praise}
            initialCausesForConcern={snapshot.causesForConcern}
            initialTargets={snapshot.targets}
          />
        )}
        <ReportPreview snapshot={snapshot} />
      </div>
    </div>
  );
}
