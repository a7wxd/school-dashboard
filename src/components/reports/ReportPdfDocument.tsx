// src/components/reports/ReportPdfDocument.tsx
// The actual downloadable PDF, built with @react-pdf/renderer primitives (NOT
// regular HTML/Tailwind — react-pdf has its own layout engine). Mirrors
// ReportPreview.tsx exactly, including the Stage 9 end-of-year adaptations:
// same fixed section order, same N/A fallback, relabelled sections and a
// Term 1/2/3 subject trend table when snapshot.type is END_OF_YEAR. Uses the
// built-in Helvetica font for reliability (no network fetch needed to
// render) — swap in Font.register() here if the school wants an exact
// brand-font match later.

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { ReportSnapshot } from "@/lib/reports";

const PROGRESS_LABELS: Record<string, string> = {
  ABOVE_TARGET: "Above target",
  ON_TARGET: "On target",
  BELOW_TARGET: "Below target",
};

const BEHAVIOUR_LABELS: Record<string, string> = {
  OUTSTANDING: "Outstanding",
  GOOD: "Good",
  REQUIRES_IMPROVEMENT: "Requires improvement",
  CAUSE_FOR_CONCERN: "Cause for concern",
};

function na(value: string | number | null | undefined): string {
  return value === null || value === undefined || value === "" ? "N/A" : String(value);
}

// A single shared style sheet keeps font, spacing and margins identical across
// every report, per the "visual consistency" formatting rule.
const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10.5, fontFamily: "Helvetica", color: "#1e293b", lineHeight: 1.4 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", borderBottom: 1.5, borderBottomColor: "#1E3A8A", paddingBottom: 12, marginBottom: 20 },
  schoolName: { fontSize: 9, color: "#64748b", textTransform: "uppercase", letterSpacing: 1 },
  studentName: { fontSize: 18, fontFamily: "Helvetica-Bold", marginTop: 4, color: "#0f172a" },
  studentMeta: { fontSize: 10, color: "#64748b", marginTop: 3 },
  headerRight: { alignItems: "flex-end" },
  termLabel: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#0f172a" },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 0.6, color: "#64748b", marginBottom: 5 },
  bodyText: { fontSize: 10.5, color: "#1e293b" },
  table: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 2 },
  tableHeaderRow: { flexDirection: "row", backgroundColor: "#f8fafc", borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  th: { flex: 1, padding: 6, fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#64748b", textTransform: "uppercase" },
  thSubject: { flex: 2, padding: 6, fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#64748b", textTransform: "uppercase" },
  td: { flex: 1, padding: 6, fontSize: 10 },
  tdSubject: { flex: 2, padding: 6, fontSize: 10, fontFamily: "Helvetica-Bold" },
  signatureSection: { marginTop: 24, borderTopWidth: 1, borderTopColor: "#e2e8f0", paddingTop: 10 },
  footerMeta: { fontSize: 8.5, color: "#94a3b8", marginTop: 2 },
});

export function ReportPdfDocument({ snapshot }: { snapshot: ReportSnapshot }) {
  const isEndOfYear = snapshot.type === "END_OF_YEAR";

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* Student Header */}
        <View style={styles.headerRow} wrap={false}>
          <View>
            <Text style={styles.schoolName}>{snapshot.school.name}</Text>
            <Text style={styles.studentName}>{snapshot.student.fullName}</Text>
            <Text style={styles.studentMeta}>
              {snapshot.student.studentId} · {snapshot.student.yearGroup.replace("Y", "Year ")}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.termLabel}>{snapshot.termLabel}</Text>
            <Text style={styles.studentMeta}>{snapshot.academicYearLabel}</Text>
          </View>
        </View>

        {/* Attendance Summary */}
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>Attendance Summary</Text>
          <Text style={styles.bodyText}>
            {isEndOfYear ? "Overall attendance for the year: " : "Overall attendance: "}
            {na(snapshot.attendanceSummary.overallPercent ? `${snapshot.attendanceSummary.overallPercent}%` : null)}
          </Text>
        </View>

        {/* Behaviour Summary */}
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>Behaviour Summary</Text>
          <Text style={styles.bodyText}>
            {na(snapshot.behaviourSummary.mostCommonRating ? BEHAVIOUR_LABELS[snapshot.behaviourSummary.mostCommonRating] : null)}
          </Text>
        </View>

        {/* Overall Academic Summary */}
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>Overall Academic Summary</Text>
          <Text style={styles.bodyText}>
            Average grade: {na(snapshot.academicSummary.averageGrade)}  ·  Overall progress:{" "}
            {na(snapshot.academicSummary.overallProgress ? PROGRESS_LABELS[snapshot.academicSummary.overallProgress] : null)}
          </Text>
          {isEndOfYear && (
            <Text style={[styles.bodyText, { marginTop: 3 }]}>
              Year progress: {na(snapshot.academicSummary.yearStartAverage)} (Term 1) → {na(snapshot.academicSummary.yearEndAverage)} (Term 3)
              {snapshot.academicSummary.improvement !== null && snapshot.academicSummary.improvement !== undefined
                ? `  (${snapshot.academicSummary.improvement > 0 ? "+" : ""}${snapshot.academicSummary.improvement} over the year)`
                : ""}
            </Text>
          )}
        </View>

        {/* Subject Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subject Breakdown</Text>
          <View style={styles.table}>
            <View style={styles.tableHeaderRow} fixed>
              <Text style={styles.thSubject}>Subject</Text>
              {isEndOfYear ? (
                <>
                  <Text style={styles.th}>Term 1</Text>
                  <Text style={styles.th}>Term 2</Text>
                  <Text style={styles.th}>Term 3</Text>
                </>
              ) : (
                <>
                  <Text style={styles.th}>Current</Text>
                  <Text style={styles.th}>Working At</Text>
                  <Text style={styles.th}>Predicted</Text>
                </>
              )}
              <Text style={styles.th}>Target</Text>
            </View>
            {snapshot.subjects.map((s) => (
              <View key={s.subjectName} style={styles.tableRow} wrap={false}>
                <Text style={styles.tdSubject}>{s.subjectName}</Text>
                {isEndOfYear ? (
                  <>
                    <Text style={styles.td}>{na(s.termTrend?.term1 ?? null)}</Text>
                    <Text style={styles.td}>{na(s.termTrend?.term2 ?? null)}</Text>
                    <Text style={styles.td}>{na(s.termTrend?.term3 ?? null)}</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.td}>{na(s.currentGrade)}</Text>
                    <Text style={styles.td}>{na(s.workingAtGrade)}</Text>
                    <Text style={styles.td}>{na(s.predictedGrade)}</Text>
                  </>
                )}
                <Text style={styles.td}>{na(s.targetGrade)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Teacher Comments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Teacher Comments</Text>
          {snapshot.subjects.map((s) => (
            <Text key={s.subjectName} style={[styles.bodyText, { marginBottom: 3 }]} wrap={false}>
              {s.subjectName}: {na(s.teacherComment)}
            </Text>
          ))}
        </View>

        {/* Praise / Strengths & Achievements */}
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>{isEndOfYear ? "Strengths & Achievements" : "Praise"}</Text>
          <Text style={styles.bodyText}>{na(snapshot.praise)}</Text>
        </View>

        {/* Causes for Concern / Recurring Concerns */}
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>{isEndOfYear ? "Recurring Concerns" : "Causes for Concern"}</Text>
          <Text style={styles.bodyText}>{na(snapshot.causesForConcern)}</Text>
        </View>

        {/* Targets / Recommendations */}
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>{isEndOfYear ? "Recommendations for Next Year" : "Targets for Improvement"}</Text>
          <Text style={styles.bodyText}>{na(snapshot.targets)}</Text>
        </View>

        {/* Signature */}
        <View style={styles.signatureSection} wrap={false}>
          <Text style={styles.bodyText}>{snapshot.teacherSignatureName}</Text>
          <Text style={styles.footerMeta}>
            Generated {new Date(snapshot.generatedAt).toLocaleString("en-GB")}
          </Text>
          {snapshot.footerNote && (
            <Text style={[styles.footerMeta, { marginTop: 8, fontStyle: "italic" }]}>{snapshot.footerNote}</Text>
          )}
        </View>
      </Page>
    </Document>
  );
}
