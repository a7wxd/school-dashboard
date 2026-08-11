"use client";

// src/components/analytics/ProgressOverTimeChart.tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ProgressPoint {
  term: string;
  aboveTarget: number;
  onTarget: number;
  belowTarget: number;
}

export function ProgressOverTimeChart({ data }: { data: ProgressPoint[] }) {
  const hasData = data.some((d) => d.aboveTarget + d.onTarget + d.belowTarget > 0);
  if (!hasData) {
    return <p className="text-sm text-muted-foreground">No progress data recorded yet.</p>;
  }

  return (
    <div style={{ height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="term" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
          <Tooltip contentStyle={{ borderRadius: 8, borderColor: "hsl(var(--border))", fontSize: 13 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="aboveTarget" name="Above target" stackId="progress" fill="hsl(var(--success))" radius={[0, 0, 0, 0]} />
          <Bar dataKey="onTarget" name="On target" stackId="progress" fill="hsl(var(--brand))" />
          <Bar dataKey="belowTarget" name="Below target" stackId="progress" fill="hsl(var(--danger))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
