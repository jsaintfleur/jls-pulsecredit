"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ForecastPoint, SeriesPoint } from "@/lib/types";

type ForecastChartRow = {
  date: string;
  label: string;
  observed: number | null;
  forecast: number | null;
  bandBase: number | null;
  band: number | null;
  lower: number | null;
  upper: number | null;
};

function cssVar(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

export function ForecastChart({
  history,
  forecast,
  height = 340,
  ariaLabel,
}: {
  history: SeriesPoint[];
  forecast: ForecastPoint[];
  height?: number;
  ariaLabel: string;
}) {
  if (!history.length || !forecast.length) {
    return (
      <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-[var(--border-subtle)] text-sm text-[var(--text-tertiary)]">
        Forecast data is unavailable.
      </div>
    );
  }

  const anchor = history[history.length - 1];
  const rows: ForecastChartRow[] = [
    ...history.map((p) => ({
      date: p.date,
      label: p.date.slice(0, 4),
      observed: p.value,
      forecast: null,
      bandBase: null,
      band: null,
      lower: null,
      upper: null,
    })),
    ...forecast.map((p) => ({
      date: p.date,
      label: p.date.slice(0, 4),
      observed: null,
      forecast: p.value,
      bandBase: p.lower,
      band: p.upper - p.lower,
      lower: p.lower,
      upper: p.upper,
    })),
  ];
  rows[rows.length - forecast.length - 1] = {
    ...rows[rows.length - forecast.length - 1],
    forecast: anchor.value,
    bandBase: anchor.value,
    band: 0,
    lower: anchor.value,
    upper: anchor.value,
  };

  const blue = cssVar("--accent-600", "#142d8c");
  const ink = cssVar("--ink-soft", "#334155");
  const grid = cssVar("--border-subtle", "#e2e8f0");
  const band = cssVar("--data-band", "#bfdbfe");

  return (
    <div role="img" aria-label={ariaLabel} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={rows} margin={{ top: 10, right: 18, bottom: 8, left: 2 }}>
          <CartesianGrid stroke={grid} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            minTickGap={34}
            tickFormatter={(v) => String(v).slice(0, 4)}
            tick={{ fill: "var(--ink-muted)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            width={46}
            tickFormatter={(v) => `${Number(v).toFixed(1)}%`}
            tick={{ fill: "var(--ink-muted)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ stroke: blue, strokeWidth: 1, strokeDasharray: "4 4" }}
            contentStyle={{
              background: "var(--panel)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 12,
              color: "var(--ink)",
              boxShadow: "var(--shadow-1)",
            }}
            formatter={(value, name) => {
              if (value == null || name === "bandBase" || name === "band") return [null, ""];
              return [`${Number(value).toFixed(2)}%`, name === "observed" ? "Observed" : "Forecast"];
            }}
            labelFormatter={(label) => String(label).slice(0, 10)}
          />
          <Legend wrapperStyle={{ color: "var(--ink-muted)", fontSize: 12 }} />
          <Area dataKey="bandBase" stackId="band" stroke="transparent" fill="transparent" legendType="none" isAnimationActive={false} />
          <Area
            dataKey="band"
            name="80% confidence band"
            stackId="band"
            stroke="transparent"
            fill={band}
            fillOpacity={0.45}
            isAnimationActive
          />
          <Line
            type="monotone"
            dataKey="observed"
            name="Observed"
            stroke={ink}
            strokeWidth={2}
            dot={false}
            connectNulls
            isAnimationActive
          />
          <Line
            type="monotone"
            dataKey="forecast"
            name="Forecast"
            stroke={blue}
            strokeWidth={2.5}
            dot={{ r: 3, fill: blue, strokeWidth: 0 }}
            strokeDasharray="5 4"
            connectNulls
            isAnimationActive
          />
          <ReferenceLine x={anchor.date} stroke={grid} strokeDasharray="4 4" label={{ value: "forecast", fill: "var(--ink-muted)", fontSize: 11 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
