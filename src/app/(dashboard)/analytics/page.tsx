// src/app/(dashboard)/analytics/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { getAnalyticsData } from "@/lib/analytics";
import { GradeTrendChart } from "@/components/analytics/GradeTrendChart";
import { PredictedOutcomesChart } from "@/components/analytics/PredictedOutcomesChart";
import { AttendanceCharts } from "@/components/analytics/AttendanceCharts";
import { BehaviourSummaryChart } from "@/components/analytics/BehaviourSummaryChart";
import { ProgressOverTimeChart } from "@/components/analytics/ProgressOverTimeChart";
import { SubjectPerformanceChart } from "@/components/analytics/SubjectPerformanceChart";

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const data = await getAnalyticsData();

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="School-wide grade trends, predicted outcomes, attendance and behaviour insights."
      />

      {!data ? (
        <div className="rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            No current academic year is configured yet — set one in Settings to see school-wide analytics.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-1 font-serif text-lg font-medium text-foreground">Grade trend over time</h2>
            <p className="mb-4 text-xs text-muted-foreground">School-wide average current grade, by term</p>
            <GradeTrendChart data={data.gradeTrend} />
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-1 font-serif text-lg font-medium text-foreground">Predicted GCSE outcomes</h2>
            <p className="mb-4 text-xs text-muted-foreground">Year 10 &amp; 11, by predicted grade</p>
            <PredictedOutcomesChart data={data.predictedOutcomes} />
          </div>

          <div className="rounded-xl border border-border bg-card p-6 lg:col-span-2">
            <h2 className="mb-1 font-serif text-lg font-medium text-foreground">Attendance</h2>
            <p className="mb-4 text-xs text-muted-foreground">Average attendance, by term and by year group</p>
            <AttendanceCharts byTerm={data.attendanceByTerm} byYearGroup={data.attendanceByYearGroup} />
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-1 font-serif text-lg font-medium text-foreground">Behaviour summary</h2>
            <p className="mb-4 text-xs text-muted-foreground">Most recent term recorded, school-wide</p>
            <BehaviourSummaryChart data={data.behaviourDistribution} />
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-1 font-serif text-lg font-medium text-foreground">Progress over time</h2>
            <p className="mb-4 text-xs text-muted-foreground">Students above / on / below target, by term</p>
            <ProgressOverTimeChart data={data.progressOverTime} />
          </div>

          <div className="rounded-xl border border-border bg-card p-6 lg:col-span-2">
            <h2 className="mb-1 font-serif text-lg font-medium text-foreground">Subject performance</h2>
            <p className="mb-4 text-xs text-muted-foreground">Average current grade per subject, most recent term recorded</p>
            <SubjectPerformanceChart data={data.subjectPerformance} />
          </div>
        </div>
      )}
    </div>
  );
}
