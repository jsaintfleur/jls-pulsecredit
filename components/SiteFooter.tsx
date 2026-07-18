export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-[var(--chrome-border)] bg-[var(--chrome-bg)]">
      <div className="mx-auto max-w-7xl px-6 py-10 text-sm text-[var(--chrome-muted)]">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <p className="font-semibold text-[var(--chrome-text)]">PulseCredit</p>
            <p className="mt-1.5 leading-relaxed">
              A portfolio project by Jean-Luc Saint-Fleur. A consumer financial-stress monitor for
              risk, policy, and macro teams — delinquency forecasting, scenario shocks, and
              complaint-anomaly detection, built entirely on public data.
            </p>
          </div>
          <div className="text-xs leading-relaxed">
            <p className="font-semibold uppercase tracking-wide text-[var(--chrome-text)]">Data sources</p>
            <p className="mt-1.5">
              FRED (Federal Reserve Bank of St. Louis) — keyless fredgraph CSV.
              <br />CFPB Consumer Complaint Database — keyless trends API. Public domain.
            </p>
          </div>
        </div>
        <p className="mt-8 border-t border-[var(--chrome-border)] pt-5 text-xs text-[var(--chrome-muted)]">
          Demonstration analytics on public data. Not investment, credit, or policy advice.
        </p>
      </div>
    </footer>
  );
}
