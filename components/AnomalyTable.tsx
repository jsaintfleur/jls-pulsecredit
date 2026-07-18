import type { AnomalyRow } from "@/lib/types";
import { fmtInt, fmtMonth, severityLabel, stressColor } from "@/lib/format";

/** Top complaint anomalies: month, product, volume vs. rolling mean, z-score. */
export function AnomalyTable({ rows }: { rows: AnomalyRow[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-panel shadow-card">
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">
          Top consumer-complaint anomalies by z-score, with month, product, monthly volume, rolling
          mean, and severity.
        </caption>
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-ink-muted">
            <th scope="col" className="px-4 py-2.5 font-medium">Month</th>
            <th scope="col" className="px-4 py-2.5 font-medium">Product</th>
            <th scope="col" className="px-4 py-2.5 text-right font-medium">Volume</th>
            <th scope="col" className="px-4 py-2.5 text-right font-medium">Rolling mean</th>
            <th scope="col" className="px-4 py-2.5 text-right font-medium">z-score</th>
            <th scope="col" className="px-4 py-2.5 font-medium">Severity</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-slate-100 last:border-0">
              <td className="whitespace-nowrap px-4 py-2.5 font-medium tabular-nums text-ink">
                {fmtMonth(r.date)}
              </td>
              <td className="px-4 py-2.5 text-ink-soft">{r.series}</td>
              <td className="px-4 py-2.5 text-right tabular-nums text-ink-soft">{fmtInt(r.value)}</td>
              <td className="px-4 py-2.5 text-right tabular-nums text-ink-muted">
                {fmtInt(r.rolling_mean)}
              </td>
              <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-ink">
                {r.score.toFixed(2)}σ
              </td>
              <td className="px-4 py-2.5">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium text-white"
                  style={{ backgroundColor: stressColor(r.score) }}
                >
                  {severityLabel(r.score)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
