"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ScenarioRow } from "@/lib/types";
import { fmtPct, fmtPp } from "@/lib/format";

export function ScenarioPanel({
  rows,
  beta,
  base,
}: {
  rows: ScenarioRow[];
  beta: number;
  base: ScenarioRow;
}) {
  const [shock, setShock] = useState(2);
  const simulated = base.predicted_delinquency + beta * shock;
  const chartRows = useMemo(
    () =>
      rows.map((r) => ({
        label: r.label,
        delinquency: r.predicted_delinquency,
        delta: r.delta_vs_base,
      })),
    [rows],
  );

  if (!rows.length) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-[var(--border-subtle)] text-sm text-[var(--text-tertiary)]">
        Scenario data is unavailable.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-inset)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">
              Interactive unemployment shock
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-[var(--text-primary)]">
              {fmtPct(simulated)}
            </p>
            <p className="text-sm text-[var(--text-tertiary)]">
              {fmtPp(beta * shock)} versus current modeled conditions
            </p>
          </div>
          <label className="min-w-56 flex-1 text-sm font-medium text-[var(--text-secondary)]">
            Shock: +{shock.toFixed(2)}pp unemployment
            <input
              className="mt-2 w-full accent-[var(--accent-600)]"
              type="range"
              min="0"
              max="5"
              step="0.25"
              value={shock}
              onChange={(e) => setShock(Number(e.currentTarget.value))}
            />
          </label>
        </div>
      </div>

      <div className="h-72" role="img" aria-label="Predicted credit-card delinquency under unemployment shocks from baseline through plus three percentage points.">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartRows} layout="vertical" margin={{ top: 6, right: 18, bottom: 2, left: 6 }}>
            <CartesianGrid stroke="var(--border-subtle)" strokeDasharray="3 3" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={(v) => `${Number(v).toFixed(1)}%`}
              tick={{ fill: "var(--ink-muted)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={90}
              tick={{ fill: "var(--ink-soft)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "var(--panel)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 12,
                color: "var(--ink)",
                boxShadow: "var(--shadow-1)",
              }}
              formatter={(value, name, props) => [
                `${Number(value).toFixed(2)}% (${props.payload.delta === 0 ? "base" : fmtPp(props.payload.delta)})`,
                "Predicted delinquency",
              ]}
            />
            <Bar dataKey="delinquency" radius={[0, 8, 8, 0]} fill="var(--accent-600)" isAnimationActive />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs leading-relaxed text-[var(--text-tertiary)]">
        OLS sensitivity: each +1pp unemployment maps to{" "}
        <span className="font-semibold text-[var(--text-secondary)]">{fmtPp(beta)}</span> of credit-card delinquency,
        holding household debt-service fixed. This is a stress-test relationship, not a causal claim.
      </p>
    </div>
  );
}
