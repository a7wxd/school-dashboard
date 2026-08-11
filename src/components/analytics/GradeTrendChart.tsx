"use client";

// src/components/analytics/GradeTrendChart.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function GradeTrendChart({ data }: { data: { term: string; averageGrade: number | null }[] }) {
  const hasData = data.some((d) => d.averageGrade !== null);

  if (!hasData) {
    return <p className="text-sm text-muted-foreground">No grades recorded yet.</p>;
  }

  return (
    <div style={{ height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="term" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
          <YAxis domain={[1, 9]} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
          <Tooltip contentStyle={{ borderRadius: 8, borderColor: "hsl(var(--border))", fontSize: 13 }} />
          <Line type="monotone" dataKey="averageGrade" name="School average" stroke="hsl(var(--brand))" strokeWidth={2.5} dot={{ r: 4 }} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
