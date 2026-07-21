// middleware.ts (project root)
// Protects every route except /login and static assets. Runs at the edge before
// any page renders, so an unauthenticated request never even reaches a server
// component — this is the first line of defence, backed up by requirePermission()
// on individual API routes/server actions (see src/lib/session.ts).

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isLoginPage = req.nextUrl.pathname === "/login";
  const isApiAuthRoute = req.nextUrl.pathname.startsWith("/api/auth");

  if (isApiAuthRoute) return NextResponse.next();

  if (!isLoggedIn && !isLoginPage) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  // Run on everything except static files and Next internals.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
```

## `prisma/schema.prisma`

```prisma
// prisma/schema.prisma
// School Management Dashboard — Stage 1 Foundation
// See ARCHITECTURE.md §3 for the full rationale behind this schema.

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ---------- Enums ----------

enum Role {
  ADMIN
  TEACHER
}

enum YearGroup {
  Y7
  Y8
  Y9
  Y10
  Y11
}

enum SenStatus {
  NONE
  SEN_SUPPORT
  EHCP
}

enum Term {
  TERM_1
  TERM_2
  TERM_3
}

enum ProgressRating {
  ABOVE_TARGET
  ON_TARGET
  BELOW_TARGET
}

enum BehaviourRating {
  OUTSTANDING
  GOOD
  REQUIRES_IMPROVEMENT
  CAUSE_FOR_CONCERN
}

enum AttitudeRating {
  EXCELLENT
  GOOD
  REQUIRES_IMPROVEMENT
  CAUSE_FOR_CONCERN
}

enum ReportType {
  TERM
  END_OF_YEAR
}

enum ReportStatus {
  DRAFT
  PREVIEW
  EDITED
  APPROVED
  SENT
}

enum DeliveryStatus {
  SENT
  DELIVERED
  FAILED
  BOUNCED
}

enum BackupStatus {
  RUNNING
  SUCCESS
  FAILED
}

// ---------- Core models ----------

model User {
  id            String    @id @default(cuid())
  fullName      String
  email         String    @unique
  passwordHash  String
  role          Role
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  lastLoginAt   DateTime?

  // Relations
  teacherSubjects   TeacherSubject[]
  enrolmentsTaught  Enrolment[]        @relation("EnrolmentTeacher")
  studentsCreated   Student[]          @relation("StudentCreatedBy")
  termRecords       TermRecord[]       @relation("TermRecordEnteredBy")
  reportsGenerated  Report[]           @relation("ReportGeneratedBy")
  reportsApproved   Report[]           @relation("ReportApprovedBy")
  reportEmailsSent  ReportEmailLog[]   @relation("ReportEmailSentBy")
  notes             NoteFromTeacher[]
  activityLogs      ActivityLog[]

  @@index([email])
}

model TeacherSubject {
  id        String  @id @default(cuid())
  teacherId String
  subjectId String

  teacher User    @relation(fields: [teacherId], references: [id])
  subject Subject @relation(fields: [subjectId], references: [id])

  @@unique([teacherId, subjectId])
}

model Subject {
  id                  String   @id @default(cuid())
  name                String
  code                String   @unique
  appliesToYearGroups YearGroup[]
  isActive            Boolean  @default(true)

  teacherSubjects TeacherSubject[]
  enrolments      Enrolment[]
}

model Student {
  id                 String     @id @default(cuid())
  studentId          String     @unique // e.g. STU2026-0147, generated on create
  firstName          String
  lastName           String
  yearGroup          YearGroup
  dateOfBirth        DateTime?
  satsReadingScore   Int?
  satsMathsScore     Int?
  senStatus          SenStatus  @default(NONE)
  senNotes           String?
  causeForConcern    Boolean    @default(false)
  causeForConcernReason String?
  overallAttendance  Decimal?   @db.Decimal(5, 2)
  deletedAt          DateTime?  // soft delete — null = active

  createdById String
  createdBy   User   @relation("StudentCreatedBy", fields: [createdById], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  parentContacts ParentContact[]
  enrolments     Enrolment[]
  reports        Report[]
  notes          NoteFromTeacher[]

  @@index([yearGroup])
  @@index([deletedAt])
}

model ParentContact {
  id               String  @id @default(cuid())
  studentId        String
  name             String
  relationship     String
  email            String
  phone            String?
  isPrimaryContact Boolean @default(false)

  student      Student          @relation(fields: [studentId], references: [id])
  emailsSent   ReportEmailLog[]

  @@index([studentId])
}

model AcademicYear {
  id          String   @id @default(cuid())
  label       String   @unique // e.g. "2026/2027"
  term1Start  DateTime
  term1End    DateTime
  term2Start  DateTime
  term2End    DateTime
  term3Start  DateTime
  term3End    DateTime
  isCurrent   Boolean  @default(false)

  enrolments Enrolment[]
  reports    Report[]
}

model Enrolment {
  id             String @id @default(cuid())
  studentId      String
  subjectId      String
  academicYearId String
  teacherId      String? // nullable: a student is auto-enrolled in every applicable
                          // subject on creation, before a specific class teacher is
                          // assigned (assigned later via Subjects/Settings, Stage 5/11)
  predictedGrade Int? // 1-9, denormalised "latest" for quick display; source of truth is TermRecord

  student      Student      @relation(fields: [studentId], references: [id])
  subject      Subject      @relation(fields: [subjectId], references: [id])
  academicYear AcademicYear @relation(fields: [academicYearId], references: [id])
  teacher      User?        @relation("EnrolmentTeacher", fields: [teacherId], references: [id])

  termRecords TermRecord[]

  @@unique([studentId, subjectId, academicYearId])
  @@index([teacherId])
}

model TermRecord {
  id             String @id @default(cuid())
  enrolmentId    String
  term           Term

  // Grades — all 1-9 GCSE scale, enforced in application-layer Zod validation
  currentGrade         Int?
  workingAtGrade       Int?
  predictedGrade       Int?
  targetGrade          Int?
  previousGrade        Int?
  differenceFromTarget Int? // recalculated server-side = currentGrade - targetGrade

  teacherAssessment String?
  behaviourRating   BehaviourRating?
  attitudeToLearning AttitudeRating?
  progressRating    ProgressRating?
  attendancePercent Decimal?          @db.Decimal(5, 2)
  teacherComment    String?
  additionalNotes   String?

  enteredById  String
  enteredBy    User      @relation("TermRecordEnteredBy", fields: [enteredById], references: [id])
  lastEditedAt DateTime  @updatedAt

  enrolment Enrolment @relation(fields: [enrolmentId], references: [id])

  @@unique([enrolmentId, term])
}

model Report {
  id              String       @id @default(cuid())
  studentId       String
  type            ReportType
  term            Term?
  academicYearId  String
  status          ReportStatus @default(DRAFT)
  contentSnapshot Json // frozen data used to render the PDF; immutable once APPROVED
  pdfUrl          String?

  generatedById String
  generatedBy   User     @relation("ReportGeneratedBy", fields: [generatedById], references: [id])
  approvedById  String?
  approvedBy    User?    @relation("ReportApprovedBy", fields: [approvedById], references: [id])

  generatedAt DateTime  @default(now())
  approvedAt  DateTime?
  sentAt      DateTime?

  student      Student          @relation(fields: [studentId], references: [id])
  academicYear AcademicYear     @relation(fields: [academicYearId], references: [id])
  emailLogs    ReportEmailLog[]

  @@index([studentId])
  @@index([status])
}

model ReportEmailLog {
  id                String         @id @default(cuid())
  reportId          String
  parentContactId   String
  sentById          String
  sentAt            DateTime       @default(now())
  deliveryStatus    DeliveryStatus @default(SENT)
  providerMessageId String?

  report        Report        @relation(fields: [reportId], references: [id])
  parentContact ParentContact @relation(fields: [parentContactId], references: [id])
  sentBy        User          @relation("ReportEmailSentBy", fields: [sentById], references: [id])
}

model NoteFromTeacher {
  id        String   @id @default(cuid())
  studentId String
  authorId  String
  body      String
  createdAt DateTime @default(now())

  student Student @relation(fields: [studentId], references: [id])
  author  User    @relation(fields: [authorId], references: [id])
}

model ActivityLog {
  id         String   @id @default(cuid())
  userId     String
  action     String // e.g. "STUDENT_CREATED", "GRADE_UPDATED", "REPORT_SENT"
  entityType String // e.g. "Student", "Report", "TermRecord"
  entityId   String
  metadata   Json?
  createdAt  DateTime @default(now())

  user User @relation(fields: [userId], references: [id])

  @@index([entityType, entityId])
  @@index([createdAt])
}

model SchoolSettings {
  id                    String @id @default(cuid())
  schoolName            String
  logoUrl               String?
  primaryColour         String  @default("#1E3A8A")
  secondaryColour       String  @default("#F59E0B")
  emailProviderConfig   Json?
  reportTemplateConfig  Json?
}

model BackupLog {
  id            String       @id @default(cuid())
  startedAt     DateTime     @default(now())
  completedAt   DateTime?
  status        BackupStatus @default(RUNNING)
  fileLocation  String?
  sizeBytes     Int?
  triggeredBy   String // "SCHEDULED" or a userId for manual triggers (future)
}
