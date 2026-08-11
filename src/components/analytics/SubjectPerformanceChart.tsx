"use client";

// src/components/analytics/SubjectPerformanceChart.tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function SubjectPerformanceChart({ data }: { data: { subject: string; averageGrade: number | null }[] }) {
  const hasData = data.some((d) => d.averageGrade !== null);
  if (!hasData) {
    return <p className="text-sm text-muted-foreground">No subject grade data recorded yet.</p>;
  }

  return (
    <div style={{ height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 16, left: -8, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="subject"
            angle={-30}
            textAnchor="end"
            interval={0}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            height={60}
          />
          <YAxis domain={[1, 9]} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
          <Tooltip contentStyle={{ borderRadius: 8, borderColor: "hsl(var(--border))", fontSize: 13 }} />
          <Bar dataKey="averageGrade" name="Average grade" fill="hsl(var(--brand))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
