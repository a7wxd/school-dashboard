// prisma/seed.ts
// Run with: npm run prisma:seed
// Creates one Administrator, three Teachers, the full Y7-11 subject list,
// one current AcademicYear, default SchoolSettings, and a handful of demo
// students with enrolments + term records so Stage 1 has something to view.

import { PrismaClient, Role, YearGroup } from "@prisma/client";
import bcrypt from "bcryptjs";
import { calculateDifferenceFromTarget, classifyProgress } from "../src/lib/grades";

const prisma = new PrismaClient();

const KS3_SUBJECTS = [
  { name: "English Language", code: "ENG-LANG" },
  { name: "English Literature", code: "ENG-LIT" },
  { name: "Maths", code: "MATHS" },
  { name: "Combined Science", code: "SCI-COMB" },
  { name: "History", code: "HIST" },
  { name: "Computer Science", code: "CS" },
  { name: "Art", code: "ART" },
  { name: "Urdu", code: "URDU" },
  { name: "PSHE", code: "PSHE" },
];

const KS4_ONLY_SUBJECTS = [
  { name: "Biology", code: "BIO" },
  { name: "Chemistry", code: "CHEM" },
  { name: "Physics", code: "PHYS" },
];

const KS4_SHARED_SUBJECTS = KS3_SUBJECTS.filter((s) => s.code !== "SCI-COMB");

async function main() {
  console.log("Seeding database...");

  // --- School settings ---
  await prisma.schoolSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      schoolName: "Example Secondary School",
      primaryColour: "#1E3A8A",
      secondaryColour: "#F59E0B",
    },
  });

  // --- Users ---
  const adminPassword = await bcrypt.hash("ChangeMe123!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@example-school.uk" },
    update: {},
    create: {
      fullName: "School Administrator",
      email: "admin@example-school.uk",
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
  });

  const teacherPassword = await bcrypt.hash("Teacher123!", 12);
  const teacherData = [
    { fullName: "Sarah Whitfield", email: "s.whitfield@example-school.uk" },
    { fullName: "James Okafor", email: "j.okafor@example-school.uk" },
    { fullName: "Priya Anand", email: "p.anand@example-school.uk" },
  ];
  const teachers = [];
  for (const t of teacherData) {
    const teacher = await prisma.user.upsert({
      where: { email: t.email },
      update: {},
      create: { ...t, passwordHash: teacherPassword, role: Role.TEACHER },
    });
    teachers.push(teacher);
  }

  // --- Academic year ---
  const academicYear = await prisma.academicYear.upsert({
    where: { label: "2026/2027" },
    update: {},
    create: {
      label: "2026/2027",
      term1Start: new Date("2026-09-01"),
      term1End: new Date("2026-12-18"),
      term2Start: new Date("2027-01-05"),
      term2End: new Date("2027-03-26"),
      term3Start: new Date("2027-04-13"),
      term3End: new Date("2027-07-18"),
      isCurrent: true,
    },
  });

  // --- Subjects (year-group aware) ---
  const allSubjectDefs = [
    ...KS4_SHARED_SUBJECTS.map((s) => ({ ...s, years: [YearGroup.Y7, YearGroup.Y8, YearGroup.Y9, YearGroup.Y10, YearGroup.Y11] })),
    { name: "Combined Science", code: "SCI-COMB", years: [YearGroup.Y7, YearGroup.Y8, YearGroup.Y9] },
    ...KS4_ONLY_SUBJECTS.map((s) => ({ ...s, years: [YearGroup.Y10, YearGroup.Y11] })),
  ];

  const subjects = [];
  for (const def of allSubjectDefs) {
    const subject = await prisma.subject.upsert({
      where: { code: def.code },
      update: { appliesToYearGroups: def.years },
      create: { name: def.name, code: def.code, appliesToYearGroups: def.years },
    });
    subjects.push(subject);
  }

  // Assign each teacher to a few subjects (many-to-many)
  for (let i = 0; i < teachers.length; i++) {
    const assigned = subjects.filter((_, idx) => idx % teachers.length === i);
    for (const subject of assigned) {
      await prisma.teacherSubject.upsert({
        where: { teacherId_subjectId: { teacherId: teachers[i].id, subjectId: subject.id } },
        update: {},
        create: { teacherId: teachers[i].id, subjectId: subject.id },
      });
    }
  }

  // --- Demo students ---
  const demoStudents = [
    { first: "Amelia", last: "Clarke", year: YearGroup.Y10 },
    { first: "Noah", last: "Patel", year: YearGroup.Y10 },
    { first: "Isla", last: "Robinson", year: YearGroup.Y8 },
  ];

  let studentCounter = 1;
  for (const s of demoStudents) {
    const studentId = `STU2026-${String(studentCounter).padStart(4, "0")}`;
    studentCounter++;

    const student = await prisma.student.create({
      data: {
        studentId,
        firstName: s.first,
        lastName: s.last,
        yearGroup: s.year,
        senStatus: "NONE",
        overallAttendance: 96.5,
        createdById: admin.id,
        parentContacts: {
          create: [
            {
              name: `${s.first === "Amelia" ? "David" : "Parent"} ${s.last}`,
              relationship: "Parent",
              email: `${s.last.toLowerCase()}.family@example.com`,
              isPrimaryContact: true,
            },
          ],
        },
      },
    });

    // Enrol in the subjects that apply to their year group, assign a teacher round-robin
    const applicable = subjects.filter((sub) => sub.appliesToYearGroups.includes(s.year));
    for (let i = 0; i < applicable.length; i++) {
      const teacher = teachers[i % teachers.length];
      const enrolment = await prisma.enrolment.create({
        data: {
          studentId: student.id,
          subjectId: applicable[i].id,
          academicYearId: academicYear.id,
          teacherId: teacher.id,
        },
      });

      // Term 1 record only for the demo (Term 2/3 start empty, created when a
      // teacher first opens the bulk-entry grid for that term).
      const currentGrade = 5 + (i % 4); // varied demo grades 5-8
      const targetGrade = 6;
      const diff = calculateDifferenceFromTarget(currentGrade, targetGrade);

      await prisma.termRecord.create({
        data: {
          enrolmentId: enrolment.id,
          term: "TERM_1",
          currentGrade,
          workingAtGrade: currentGrade,
          targetGrade,
          previousGrade: null,
          differenceFromTarget: diff,
          progressRating: classifyProgress(diff) ?? undefined,
          behaviourRating: "GOOD",
          attitudeToLearning: "GOOD",
          attendancePercent: 96.5,
          teacherComment: "Solid start to the term.",
          enteredById: teacher.id,
        },
      });
    }
  }

  console.log("Seed complete.");
  console.log(`Admin login: admin@example-school.uk / ChangeMe123!`);
  console.log(`Teacher login (any of the 3): [email] / Teacher123!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
