"use client";

// src/components/analytics/PredictedOutcomesChart.tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function PredictedOutcomesChart({ data }: { data: { grade: number; count: number }[] }) {
  const hasData = data.some((d) => d.count > 0);

  if (!hasData) {
    return <p className="text-sm text-muted-foreground">No predicted grades recorded yet for Year 10/11.</p>;
  }

  return (
    <div style={{ height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="grade" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} label={{ value: "Predicted grade", position: "insideBottom", offset: -2, fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
          <Tooltip contentStyle={{ borderRadius: 8, borderColor: "hsl(var(--border))", fontSize: 13 }} />
          <Bar dataKey="count" name="Students" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
