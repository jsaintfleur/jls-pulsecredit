import type { ScenarioRow } from "@/lib/types";
import { fmtPct, fmtPp } from "@/lib/format";

/**
 * Unemployment-shock scenario panel: horizontal bars of predicted credit-card
 * delinquency at +0/+1/+2/+3pp unemployment, with the marginal delta vs. base.
 * Dependency-free; the same numbers appear in the table beneath the bars.
 */
export function ScenarioPanel({ rows, beta }: { rows: ScenarioRow[]; beta: number }) {
  const maxV = Math.max(...rows.map((r) => r.predicted_delinquency));

  return (
    <div>
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-3">
            <span className="w-32 shrink-0 text-sm font-medium text-ink-soft">{r.label}</span>
            <div className="h-7 flex-1 overflow-hidden rounded bg-slate-100">
              <div
                className="flex h-full items-center justify-end rounded bg-brand-600 pr-2 text-xs font-semibold text-white tabular-nums"
                style={{ width: `${(r.predicted_delinquency / maxV) * 100}%` }}
              >
                {fmtPct(r.predicted_delinquency)}
              </div>
            </div>
            <span className="w-20 shrink-0 text-right text-xs font-medium tabular-nums text-brand-700">
              {r.delta_vs_base === 0 ? "base" : fmtPp(r.delta_vs_base)}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-ink-muted">
        OLS sensitivity: each +1pp of unemployment maps to{" "}
        <span className="font-semibold text-ink-soft">{fmtPp(beta)}</span> of credit-card
        delinquency, holding household debt-service (TDSP) fixed.
      </p>
    </div>
  );
}
