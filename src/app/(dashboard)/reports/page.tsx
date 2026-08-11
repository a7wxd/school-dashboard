// src/app/(dashboard)/reports/page.tsx
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/PageHeader";
import { GenerateReportDialog } from "@/components/reports/GenerateReportDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { FileText } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  EDITED: "bg-amber-100 text-amber-800",
  PREVIEW: "bg-muted text-muted-foreground",
  APPROVED: "bg-brand/10 text-brand",
  SENT: "bg-success/10 text-success",
};

const TERM_LABELS: Record<string, string> = { TERM_1: "Term 1", TERM_2: "Term 2", TERM_3: "Term 3" };

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [reports, students] = await Promise.all([
    prisma.report.findMany({
      orderBy: { generatedAt: "desc" },
      include: { student: { select: { firstName: true, lastName: true, studentId: true } } },
      take: 100,
    }),
    prisma.student.findMany({
      where: { deletedAt: null },
      select: { id: true, firstName: true, lastName: true, yearGroup: true },
      orderBy: { lastName: "asc" },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Generate, preview, approve and send student reports."
        actions={<GenerateReportDialog students={students} />}
      />

      {reports.length === 0 ? (
        <EmptyState icon={FileText} description="No reports generated yet." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Student</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Term</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reports.map((report) => (
                <tr key={report.id} className="transition-default hover:bg-muted/40">
                  <td className="px-5 py-3.5">
                    <Link href={`/reports/${report.id}`} className="font-medium text-foreground hover:text-brand">
                      {report.student.firstName} {report.student.lastName}
                    </Link>
                    <p className="text-xs text-muted-foreground">{report.student.studentId}</p>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {report.type === "TERM" ? "Term report" : "End of year"}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{report.term ? TERM_LABELS[report.term] : "—"}</td>
                  <td className="px-5 py-3.5">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[report.status]}`}>
                      {report.status.charAt(0) + report.status.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {new Date(report.generatedAt).toLocaleDateString("en-GB")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
