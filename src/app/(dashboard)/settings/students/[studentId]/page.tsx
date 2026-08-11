// src/app/(dashboard)/students/[studentId]/page.tsx
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/permissions";
import { ProfileHeader } from "@/components/students/profile/ProfileHeader";
import { SubjectGradesTable, type SubjectGradeRow } from "@/components/students/profile/SubjectGradesTable";
import { ParentContactsCard } from "@/components/students/profile/ParentContactsCard";
import { ProfileTabs, type ProfileTab } from "@/components/students/profile/ProfileTabs";
import { AcademicHistoryTable, type AcademicHistoryRow } from "@/components/students/profile/AcademicHistoryTable";
import { ProgressChartsPanel, type GradeTrendPoint } from "@/components/students/profile/ProgressChartsPanel";
import { AttendanceBehaviourPanel, type AttendancePoint, type BehaviourRow } from "@/components/students/profile/AttendanceBehaviourPanel";
import { calculateAverageGrade } from "@/lib/grades";

const TERMS = ["TERM_1", "TERM_2", "TERM_3"] as const;
const TERM_LABELS: Record<string, string> = { TERM_1: "Term 1", TERM_2: "Term 2", TERM_3: "Term 3" };

function slugifySubject(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export default async function StudentProfilePage({ params }: { params: { studentId: string } }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!can(session.user.role, "STUDENT_VIEW")) redirect("/dashboard");

  const student = await prisma.student.findUnique({
    where: { id: params.studentId },
    include: {
      parentContacts: true,
      notes: { include: { author: { select: { fullName: true } } }, orderBy: { createdAt: "desc" } },
      enrolments: {
        where: { academicYear: { isCurrent: true } },
        include: {
          subject: { select: { name: true } },
          teacher: { select: { fullName: true } },
          termRecords: { orderBy: { term: "asc" } },
        },
        orderBy: { subject: { name: "asc" } },
      },
    },
  });

  if (!student || student.deletedAt) notFound();

  // ---- Overview tab data: latest term with any data recorded ----
  const termsWithData = new Set<string>();
  for (const e of student.enrolments) {
    for (const tr of e.termRecords) {
      if (tr.currentGrade !== null) termsWithData.add(tr.term);
    }
  }
  const latestTerm = termsWithData.has("TERM_3") ? "TERM_3" : termsWithData.has("TERM_2") ? "TERM_2" : "TERM_1";

  const subjectRows: SubjectGradeRow[] = student.enrolments.map((e) => {
    const record = e.termRecords.find((tr) => tr.term === latestTerm);
    return {
      subjectName: e.subject.name,
      teacherName: e.teacher?.fullName ?? null,
      currentGrade: record?.currentGrade ?? null,
      workingAtGrade: record?.workingAtGrade ?? null,
      predictedGrade: record?.predictedGrade ?? null,
      targetGrade: record?.targetGrade ?? null,
      differenceFromTarget: record?.differenceFromTarget ?? null,
    };
  });
  const averageGrade = calculateAverageGrade(subjectRows.map((r) => r.currentGrade));

  // ---- Academic History tab data ----
  const historyRows: AcademicHistoryRow[] = student.enrolments.map((e) => {
    const terms = {} as AcademicHistoryRow["terms"];
    for (const t of TERMS) {
      const record = e.termRecords.find((tr) => tr.term === t);
      terms[t] = {
        currentGrade: record?.currentGrade ?? null,
        targetGrade: record?.targetGrade ?? null,
        predictedGrade: record?.predictedGrade ?? null,
      };
    }
    return { subjectName: e.subject.name, terms };
  });

  // ---- Progress charts tab data ----
  const subjectKeys = student.enrolments.map((e) => ({ key: slugifySubject(e.subject.name), name: e.subject.name }));
  const gradeTrend: GradeTrendPoint[] = TERMS.map((t) => {
    const gradesThisTerm = student.enrolments
      .map((e) => e.termRecords.find((tr) => tr.term === t)?.currentGrade ?? null)
      .filter((g): g is number => g !== null);
    const point: GradeTrendPoint = {
      term: TERM_LABELS[t],
      averageGrade: gradesThisTerm.length > 0 ? calculateAverageGrade(gradesThisTerm) : null,
    };
    for (const e of student.enrolments) {
      const record = e.termRecords.find((tr) => tr.term === t);
      point[slugifySubject(e.subject.name)] = record?.currentGrade ?? null;
    }
    return point;
  });

  // ---- Attendance & Behaviour tab data ----
  const attendanceTrend: AttendancePoint[] = TERMS.map((t) => {
    const values = student.enrolments
      .map((e) => e.termRecords.find((tr) => tr.term === t)?.attendancePercent ?? null)
      .filter((v): v is NonNullable<typeof v> => v !== null)
      .map((v) => Number(v));
    return {
      term: TERM_LABELS[t],
      attendance: values.length > 0 ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10 : null,
    };
  });

  const behaviourRows: BehaviourRow[] = student.enrolments.map((e) => {
    const terms = {} as BehaviourRow["terms"];
    for (const t of TERMS) {
      const record = e.termRecords.find((tr) => tr.term === t);
      terms[t] = {
        behaviourRating: record?.behaviourRating ?? null,
        attitudeToLearning: record?.attitudeToLearning ?? null,
      };
    }
    return { subjectName: e.subject.name, terms };
  });

  const tabs: ProfileTab[] = [
    {
      key: "overview",
      label: "Overview",
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">Average grade</p>
              <p className="mt-1 font-serif text-2xl font-medium text-foreground">{averageGrade ?? "N/A"}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">Attendance</p>
              <p className="mt-1 font-serif text-2xl font-medium text-foreground">
                {student.overallAttendance ? `${student.overallAttendance}%` : "N/A"}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">SATs Reading</p>
              <p className="mt-1 font-serif text-2xl font-medium text-foreground">{student.satsReadingScore ?? "N/A"}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">SATs Maths</p>
              <p className="mt-1 font-serif text-2xl font-medium text-foreground">{student.satsMathsScore ?? "N/A"}</p>
            </div>
          </div>
          <section>
            <h2 className="mb-3 font-serif text-lg font-medium text-foreground">
              Subject grades — {TERM_LABELS[latestTerm]}
            </h2>
            <SubjectGradesTable rows={subjectRows} term={TERM_LABELS[latestTerm]} />
          </section>
        </div>
      ),
    },
    {
      key: "history",
      label: "Academic History",
      content: <AcademicHistoryTable rows={historyRows} />,
    },
    {
      key: "progress",
      label: "Progress",
      content: <ProgressChartsPanel data={gradeTrend} subjectKeys={subjectKeys} />,
    },
    {
      key: "attendance",
      label: "Attendance & Behaviour",
      content: <AttendanceBehaviourPanel attendanceData={attendanceTrend} behaviourRows={behaviourRows} />,
    },
    {
      key: "sen",
      label: "SEN & Notes",
      content: (
        <div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm text-foreground">{student.senNotes || "No SEN notes recorded."}</p>
            {student.causeForConcern && (
              <p className="mt-2 text-sm text-danger">
                Cause for concern: {student.causeForConcernReason || "No reason given."}
              </p>
            )}
          </div>
          {student.notes.length > 0 && (
            <ul className="mt-4 space-y-3">
              {student.notes.map((note) => (
                <li key={note.id} className="rounded-lg border border-border p-3 text-sm">
                  <p className="text-foreground">{note.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {note.author.fullName} · {new Date(note.createdAt).toLocaleDateString("en-GB")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      ),
    },
    {
      key: "parents",
      label: "Parents",
      content: <ParentContactsCard contacts={student.parentContacts} />,
    },
  ];

  return (
    <div className="max-w-5xl space-y-8">
      <ProfileHeader
        studentId={student.studentId}
        dbId={student.id}
        fullName={`${student.firstName} ${student.lastName}`}
        yearGroup={student.yearGroup}
        senStatus={student.senStatus}
        causeForConcern={student.causeForConcern}
        canDelete={can(session.user.role, "STUDENT_DELETE")}
      />
      <ProfileTabs tabs={tabs} />
    </div>
  );
}
