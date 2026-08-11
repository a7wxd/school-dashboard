// src/app/(dashboard)/parents/[parentId]/page.tsx
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/PageHeader";
import { ReportEmailHistory } from "@/components/reports/ReportEmailHistory";
import { Mail, Phone, Star, FileText } from "lucide-react";

const TERM_LABELS: Record<string, string> = { TERM_1: "Term 1", TERM_2: "Term 2", TERM_3: "Term 3" };

export default async function ParentDetailPage({ params }: { params: { parentId: string } }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const contact = await prisma.parentContact.findUnique({
    where: { id: params.parentId },
    include: {
      student: {
        select: { id: true, firstName: true, lastName: true, yearGroup: true, studentId: true },
      },
      emailsSent: {
        include: {
          report: { select: { id: true, term: true, type: true } },
          sentBy: { select: { fullName: true } },
        },
        orderBy: { sentAt: "desc" },
      },
    },
  });
  if (!contact) notFound();

  const reportsForStudent = await prisma.report.findMany({
    where: { studentId: contact.student.id, status: "APPROVED" },
    orderBy: { generatedAt: "desc" },
  });

  const emailLogRows = contact.emailsSent.map((log) => ({
    id: log.id,
    parentName: contact.name,
    parentEmail: contact.email,
    sentByName: log.sentBy.fullName,
    sentAt: log.sentAt,
    deliveryStatus: log.deliveryStatus,
  }));

  return (
    <div className="max-w-3xl space-y-8">
      <PageHeader title={contact.name} description={contact.relationship} />

      <section className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2">
          <h2 className="font-serif text-lg font-medium text-foreground">Contact details</h2>
          {contact.isPrimaryContact && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-accent">
              <Star size={11} fill="currentColor" /> Primary contact
            </span>
          )}
        </div>
        <div className="mt-3 space-y-1.5 text-sm text-foreground">
          <p className="flex items-center gap-2"><Mail size={14} className="text-muted-foreground" /> {contact.email}</p>
          {contact.phone && <p className="flex items-center gap-2"><Phone size={14} className="text-muted-foreground" /> {contact.phone}</p>}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-serif text-lg font-medium text-foreground">Linked student</h2>
        <Link href={`/students/${contact.student.id}`} className="mt-2 inline-block text-sm font-medium text-brand hover:underline">
          {contact.student.firstName} {contact.student.lastName} — {contact.student.yearGroup.replace("Y", "Year ")} ({contact.student.studentId})
        </Link>
      </section>

      {reportsForStudent.length > 0 && (
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-3 font-serif text-lg font-medium text-foreground">Ready to send</h2>
          <ul className="divide-y divide-border">
            {reportsForStudent.map((report) => (
              <li key={report.id} className="flex items-center justify-between py-2.5">
                <span className="flex items-center gap-2 text-sm text-foreground">
                  <FileText size={14} className="text-muted-foreground" />
                  {report.term ? TERM_LABELS[report.term] : "End of year"} report
                </span>
                <Link href={`/reports/${report.id}`} className="text-sm font-medium text-brand hover:underline">
                  Go to report →
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-3 font-serif text-lg font-medium text-foreground">Communication history</h2>
        <ReportEmailHistory logs={emailLogRows} />
      </section>
    </div>
  );
}
