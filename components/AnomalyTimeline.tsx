"use client";

import { Bar, BarChart, Brush, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SeriesPoint } from "@/lib/types";

export function AnomalyTimeline({
  points,
  flagged,
  height = 260,
  ariaLabel,
}: {
  points: SeriesPoint[];
  flagged: Set<string>;
  height?: number;
  ariaLabel: string;
}) {
  if (!points.length) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-[var(--border-subtle)] text-sm text-[var(--text-tertiary)]">
        Complaint timeline is unavailable.
      </div>
    );
  }

  const rows = points.map((p) => ({
    ...p,
    flagged: flagged.has(p.date),
    month: p.date.slice(0, 7),
  }));

  return (
    <div style={{ height }} role="region" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 18, bottom: 8, left: 4 }}>
          <CartesianGrid stroke="var(--border-subtle)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="month"
            minTickGap={34}
            tick={{ fill: "var(--ink-muted)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            width={56}
            tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`}
            tick={{ fill: "var(--ink-muted)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "var(--bg-inset)" }}
            contentStyle={{
              background: "var(--panel)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 12,
              color: "var(--ink)",
              boxShadow: "var(--shadow-1)",
            }}
            formatter={(value) => [Number(value).toLocaleString(), "Complaints"]}
            labelFormatter={(label) => `${label}`}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} isAnimationActive>
            {rows.map((r) => (
              <Cell key={r.date} fill={r.flagged ? "var(--danger)" : "var(--accent-500)"} fillOpacity={r.flagged ? 0.95 : 0.42} />
            ))}
          </Bar>
          <Brush dataKey="month" height={22} travellerWidth={10} stroke="var(--accent-600)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
