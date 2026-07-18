import type { AnomalyRow } from "@/lib/types";
import { fmtInt, fmtMonth, severityLabel, stressColor } from "@/lib/format";

/** Top complaint anomalies: month, product, volume vs. rolling mean, z-score. */
export function AnomalyTable({ rows }: { rows: AnomalyRow[] }) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-panel)] shadow-[var(--shadow-1)]">
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">
          Top consumer-complaint anomalies by z-score, with month, product, monthly volume, rolling
          mean, and severity.
        </caption>
        <thead>
          <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-inset)] text-left text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
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
            <tr key={i} className="border-b border-[var(--border-subtle)] last:border-0">
              <td className="whitespace-nowrap px-4 py-2.5 font-medium tabular-nums text-[var(--text-primary)]">
                {fmtMonth(r.date)}
              </td>
              <td className="px-4 py-2.5 text-[var(--text-secondary)]">{r.series}</td>
              <td className="px-4 py-2.5 text-right tabular-nums text-[var(--text-secondary)]">{fmtInt(r.value)}</td>
              <td className="px-4 py-2.5 text-right tabular-nums text-[var(--text-tertiary)]">
                {fmtInt(r.rolling_mean)}
              </td>
              <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-[var(--text-primary)]">
                {r.score.toFixed(2)}σ
              </td>
              <td className="px-4 py-2.5">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium text-white"
                  style={{ backgroundColor: stressColor(r.score), color: r.score >= 3.25 ? "#ffffff" : "#111827" }}
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
