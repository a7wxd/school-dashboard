"use client";

// src/components/analytics/BehaviourSummaryChart.tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const RATING_LABELS: Record<string, string> = {
  OUTSTANDING: "Outstanding",
  GOOD: "Good",
  REQUIRES_IMPROVEMENT: "Requires improvement",
  CAUSE_FOR_CONCERN: "Cause for concern",
};

const RATING_COLORS: Record<string, string> = {
  OUTSTANDING: "hsl(var(--success))",
  GOOD: "hsl(var(--brand))",
  REQUIRES_IMPROVEMENT: "hsl(var(--accent))",
  CAUSE_FOR_CONCERN: "hsl(var(--danger))",
};

export function BehaviourSummaryChart({ data }: { data: { rating: string; count: number }[] }) {
  const hasData = data.some((d) => d.count > 0);
  if (!hasData) {
    return <p className="text-sm text-muted-foreground">No behaviour data recorded yet.</p>;
  }

  const chartData = data.map((d) => ({ ...d, label: RATING_LABELS[d.rating] ?? d.rating }));

  return (
    <div style={{ height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
          <YAxis type="category" dataKey="label" width={140} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
          <Tooltip contentStyle={{ borderRadius: 8, borderColor: "hsl(var(--border))", fontSize: 13 }} />
          <Bar dataKey="count" name="Students" radius={[0, 4, 4, 0]}>
            {chartData.map((d) => (
              <Cell key={d.rating} fill={RATING_COLORS[d.rating] ?? "hsl(var(--brand))"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
