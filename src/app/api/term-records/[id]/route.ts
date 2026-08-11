// src/app/api/term-records/[id]/route.ts
// Saves a single student's grade/behaviour/comment data for one term. This is
// what the bulk grade entry grid autosaves to, one row at a time.
//
// Access rule (per the corrected design — see ARCHITECTURE.md / CHANGELOG):
// admins can always edit; teachers can only edit if they're linked to the
// enrolment's subject via TeacherSubject — no per-class restriction.
//
// Calculation rules applied on every save (ARCHITECTURE.md §5):
//   - differenceFromTarget = currentGrade - targetGrade
//   - progressRating classified from that difference
//   - predictedGrade auto-derived from the trend across this enrolment's terms
//     + a small adjustment from attitudeToLearning, UNLESS an admin explicitly
//     overrides it (PREDICTED_GRADE_OVERRIDE permission, logged separately).

import { prisma } from "@/lib/prisma";
import { requireUser, handleAuthError, ForbiddenError } from "@/lib/session";
import { can } from "@/lib/permissions";
import { logActivity } from "@/lib/activity-log";
import { updateTermRecordSchema } from "@/lib/validation/term-record";
import {
  calculateDifferenceFromTarget,
  classifyProgress,
  derivePredictedGrade,
} from "@/lib/grades";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const sessionUser = await requireUser();

    const dbUser = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { id: true, role: true, isActive: true },
    });
    if (!dbUser || !dbUser.isActive) throw new ForbiddenError("Your account is not active.");
    if (!can(dbUser.role, "GRADE_ENTER")) throw new ForbiddenError();

    const existing = await prisma.termRecord.findUnique({
      where: { id: params.id },
      include: {
        enrolment: {
          include: {
            subject: { include: { teacherSubjects: { select: { teacherId: true } } } },
            termRecords: { orderBy: { term: "asc" } },
          },
        },
      },
    });
    if (!existing) return Response.json({ error: "Term record not found" }, { status: 404 });

    if (dbUser.role === "TEACHER") {
      const isAssigned = existing.enrolment.subject.teacherSubjects.some(
        (ts) => ts.teacherId === dbUser.id
      );
      if (!isAssigned) throw new ForbiddenError("You're not assigned to teach this subject.");
    }

    const body = await request.json();
    const parsed = updateTermRecordSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const input = parsed.data;

    const isPredictedOverride =
      input.predictedGrade !== undefined && input.predictedGrade !== existing.predictedGrade;
    if (isPredictedOverride && !can(dbUser.role, "PREDICTED_GRADE_OVERRIDE")) {
      return Response.json(
        { error: "Only an administrator can override the predicted grade." },
        { status: 403 }
      );
    }

    const mergedCurrentGrade = input.currentGrade !== undefined ? input.currentGrade : existing.currentGrade;
    const mergedTargetGrade = input.targetGrade !== undefined ? input.targetGrade : existing.targetGrade;
    const mergedAttitude =
      input.attitudeToLearning !== undefined ? input.attitudeToLearning : existing.attitudeToLearning;

    const differenceFromTarget = calculateDifferenceFromTarget(mergedCurrentGrade, mergedTargetGrade);
    const progressRating = classifyProgress(differenceFromTarget);

    let predictedGrade: number | null;
    if (isPredictedOverride) {
      predictedGrade = input.predictedGrade ?? null;
    } else {
      const termsInOrder = existing.enrolment.termRecords.map((tr) =>
        tr.term === existing.term ? mergedCurrentGrade : tr.currentGrade
      );
      predictedGrade = derivePredictedGrade({
        termCurrentGrades: termsInOrder,
        teacherAssessmentAdjustment: mergedAttitude === "CAUSE_FOR_CONCERN" ? -1 : 0,
      });
    }

    const updated = await prisma.termRecord.update({
      where: { id: params.id },
      data: {
        ...input,
        differenceFromTarget,
        progressRating: progressRating ?? undefined,
        predictedGrade,
        enteredById: dbUser.id,
      },
    });

    await logActivity({
      userId: dbUser.id,
      action: isPredictedOverride ? "PREDICTED_GRADE_OVERRIDDEN" : "GRADE_UPDATED",
      entityType: "TermRecord",
      entityId: updated.id,
      metadata: { term: updated.term, currentGrade: updated.currentGrade },
    });

    return Response.json({ termRecord: updated });
  } catch (error) {
    return handleAuthError(error) ?? Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
