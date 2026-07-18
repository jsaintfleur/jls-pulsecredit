"use client";

import dynamic from "next/dynamic";
import type { ForecastPoint, ScenarioRow, SeriesPoint } from "@/lib/types";

const ChartSkeleton = ({ height = 300 }: { height?: number }) => (
  <div
    aria-hidden="true"
    className="animate-pulse rounded-[var(--radius-lg)] bg-[var(--bg-inset)]"
    style={{ height }}
  />
);

const DynamicForecastChart = dynamic(
  () => import("./ForecastChart").then((mod) => mod.ForecastChart),
  { loading: () => <ChartSkeleton height={340} /> },
);
const DynamicScenarioPanel = dynamic(
  () => import("./ScenarioPanel").then((mod) => mod.ScenarioPanel),
  { loading: () => <ChartSkeleton height={420} /> },
);
const DynamicAnomalyTimeline = dynamic(
  () => import("./AnomalyTimeline").then((mod) => mod.AnomalyTimeline),
  { loading: () => <ChartSkeleton height={260} /> },
);

export function LazyForecastChart(props: {
  history: SeriesPoint[];
  forecast: ForecastPoint[];
  height?: number;
  ariaLabel: string;
}) {
  return <DynamicForecastChart {...props} />;
}

export function LazyScenarioPanel(props: {
  rows: ScenarioRow[];
  beta: number;
  base: ScenarioRow;
}) {
  return <DynamicScenarioPanel {...props} />;
}

export function LazyAnomalyTimeline(props: {
  points: SeriesPoint[];
  flaggedDates: string[];
  height?: number;
  ariaLabel: string;
}) {
  return <DynamicAnomalyTimeline {...props} flagged={new Set(props.flaggedDates)} />;
}
