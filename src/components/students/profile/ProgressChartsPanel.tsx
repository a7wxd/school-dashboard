"use client";

// src/components/students/profile/ProgressChartsPanel.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export interface GradeTrendPoint {
  term: string;
  averageGrade: number | null;
  [subjectKey: string]: string | number | null;
}

interface ProgressChartsPanelProps {
  data: GradeTrendPoint[];
  subjectKeys: { key: string; name: string }[];
}

const LINE_COLORS = [
  "hsl(var(--brand))",
  "hsl(var(--accent))",
  "hsl(var(--success))",
  "hsl(var(--danger))",
  "hsl(220 9% 46%)",
];

export function ProgressChartsPanel({ data, subjectKeys }: ProgressChartsPanelProps) {
  const hasData = data.some((d) => d.averageGrade !== null);

  if (!hasData) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
        <p className="text-sm text-muted-foreground">No grades recorded yet — the chart will appear once a term has data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 text-sm font-medium text-foreground">Average grade over time</h3>
        <div className="rounded-xl border border-border bg-card p-4" style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="term" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis domain={[1, 9]} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                contentStyle={{ borderRadius: 8, borderColor: "hsl(var(--border))", fontSize: 13 }}
              />
              <Line type="monotone" dataKey="averageGrade" name="Average grade" stroke="hsl(var(--brand))" strokeWidth={2.5} dot={{ r: 4 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {subjectKeys.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-medium text-foreground">By subject</h3>
          <div className="rounded-xl border border-border bg-card p-4" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="term" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis domain={[1, 9]} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ borderRadius: 8, borderColor: "hsl(var(--border))", fontSize: 13 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {subjectKeys.map((s, i) => (
                  <Line
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    name={s.name}
                    stroke={LINE_COLORS[i % LINE_COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
