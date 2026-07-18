import Link from "next/link";
import { getSummary, getSeries } from "@/lib/data";
import { fmtPct, fmtPp, fmtMonth, fmtQuarter } from "@/lib/format";
import { KpiCard } from "@/components/KpiCard";
import { ForecastChart } from "@/components/ForecastChart";
import { ScenarioPanel } from "@/components/ScenarioPanel";
import { AnomalyTimeline } from "@/components/AnomalyTimeline";
import { AnomalyTable } from "@/components/AnomalyTable";

export default function OverviewPage() {
  const s = getSummary();
  const series = getSeries();

  const freshness = new Date(s.generated_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Forecast direction (compare last forecast quarter to latest observed).
  const traj = s.forecast.trajectory_pct;
  const last = s.headline.latest_value_pct;
  const end = traj[traj.length - 1];
  const dir = end < last ? "easing" : end > last ? "rising" : "flat";
  const dirArrow = dir === "easing" ? "↓" : dir === "rising" ? "↑" : "→";

  // Forecast chart window: last 48 quarters of history for legibility.
  const hist = series.historical.DRCCLACBS;
  const histWindow = hist.slice(-48);
  const fc = series.forecast.points;

  // Complaint anomaly timeline: total monthly volume, flag months in the top list.
  const totals = series.complaints_monthly.total;
  const flagged = new Set(s.complaint_anomalies.top.map((a) => a.date));

  const bt = s.forecast.backtest;

  return (
    <div className="mx-auto max-w-7xl px-6">
      {/* Hero */}
      <section className="pt-14 pb-10">
        <p className="text-sm font-semibold uppercase tracking-wider text-[var(--accent-text)]">
          Consumer Credit · Financial-Stress Monitor
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          See the strain before it breaks.
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">
          PulseCredit tracks U.S. household financial stress in one instrument — forecasting
          credit-card delinquency, stress-testing it against unemployment shocks, and flagging
          anomalous surges in consumer complaints, all from keyless public data.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
          <Link
            href="/methodology"
            className="rounded-lg bg-brand-700 px-4 py-2 font-medium text-white transition-colors hover:bg-brand-800"
          >
            How it works
          </Link>
          <span className="inline-flex items-center gap-1.5 text-ink-muted">
            <span className="h-2 w-2 rounded-full bg-brand-500" />
            Built {freshness} · latest observation {fmtMonth(s.headline.as_of)}
          </span>
        </div>
      </section>

      {/* KPI row */}
      <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Card delinquency"
          value={fmtPct(s.headline.latest_value_pct)}
          sub={`${fmtPp(s.headline.yoy_change_pp)} YoY · ${fmtMonth(s.headline.as_of)}`}
          hint="Delinquency rate on credit-card loans, all commercial banks (FRED DRCCLACBS), latest quarter."
        />
        <KpiCard
          label="Forecast · next 4Q"
          value={`${fmtPct(end)} ${dirArrow}`}
          sub={`${dir} to ${fmtQuarter(s.forecast.horizon_end)}`}
          hint="SARIMAX(1,1,1) central forecast for the final quarter of the 4-quarter horizon, with an 80% band."
        />
        <KpiCard
          label="+2pp unemployment"
          value={fmtPp(s.scenario.plus_2pp_unemployment_delta_pp)}
          sub={`delinquency · R² ${s.scenario.r_squared.toFixed(2)}`}
          hint="Modeled increase in card delinquency from a +2pp unemployment shock (OLS on UNRATE + TDSP)."
        />
        <KpiCard
          label="Complaint anomalies"
          value={String(s.complaint_anomalies.top.length)}
          sub="flagged monthly spikes"
          hint="Number of top monthly complaint spikes flagged by rolling z-score across CFPB product lines."
        />
      </section>

      {/* Forecast chart */}
      <section className="mt-12">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink">
              Credit-card delinquency forecast
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Observed rate (last 12 years) with a 4-quarter SARIMAX forecast and 80% confidence band.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-ink-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-4 rounded-sm bg-ink-soft" /> Observed
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-4 rounded-sm bg-[var(--data-primary)]" /> Forecast
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-4 rounded-sm bg-[var(--data-band)]" /> 80% band
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-panel p-5 shadow-card">
          <ForecastChart
            history={histWindow}
            forecast={fc}
            ariaLabel={`Credit-card delinquency rate from ${histWindow[0].date.slice(0, 4)} to ${s.headline.as_of.slice(0, 4)} declined toward ${fmtPct(last)}. The SARIMAX forecast projects it ${dir} to ${fmtPct(end)} by ${fmtQuarter(s.forecast.horizon_end)}, within an 80% band of roughly ${fmtPct(fc[fc.length - 1].lower)} to ${fmtPct(fc[fc.length - 1].upper)}.`}
          />
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-sm">
              <caption className="sr-only">Quarterly forecast values with 80% lower and upper bounds.</caption>
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-ink-muted">
                  <th scope="col" className="py-2 pr-4 font-medium">Quarter</th>
                  <th scope="col" className="py-2 pr-4 text-right font-medium">Forecast</th>
                  <th scope="col" className="py-2 pr-4 text-right font-medium">80% lower</th>
                  <th scope="col" className="py-2 text-right font-medium">80% upper</th>
                </tr>
              </thead>
              <tbody>
                {fc.map((p) => (
                  <tr key={p.date} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 pr-4 font-medium text-ink">{fmtQuarter(p.date)}</td>
                    <td className="py-2 pr-4 text-right tabular-nums text-ink-soft">{fmtPct(p.value)}</td>
                    <td className="py-2 pr-4 text-right tabular-nums text-ink-muted">{fmtPct(p.lower)}</td>
                    <td className="py-2 text-right tabular-nums text-ink-muted">{fmtPct(p.upper)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Honesty note — the candor is the feature. */}
        <div className="mt-4 rounded-xl border border-slate-300 bg-slate-50 p-5">
          <h3 className="text-sm font-semibold text-ink">Forecast honesty note</h3>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-soft">
            Over an {bt.holdout_quarters}-quarter holdout, this SARIMAX model does{" "}
            <span className="font-semibold text-ink">not</span> beat a naive last-value baseline. Model
            MAPE is {bt.model_mape_pct.toFixed(2)}% (RMSE {bt.model_rmse.toFixed(3)}) versus the naive{" "}
            {bt.naive_mape_pct.toFixed(2)}% (RMSE {bt.naive_rmse.toFixed(3)}). Delinquency is a slow,
            highly-persistent series, so &ldquo;tomorrow looks like today&rdquo; is hard to beat. The
            forecast is shown with its band and this scorecard rather than as a false promise of edge.
          </p>
        </div>
      </section>

      {/* Scenario + anomalies */}
      <section className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-xl border border-slate-200 bg-panel p-6 shadow-card">
          <h2 className="text-lg font-semibold tracking-tight text-ink">Unemployment shock scenarios</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Predicted card delinquency under stepped unemployment shocks (OLS, {s.scenario.detail.n_obs}{" "}
            quarters).
          </p>
          <div className="mt-5">
            <ScenarioPanel rows={s.scenario.detail.scenarios} beta={s.scenario.unrate_beta_pp_per_pp} />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold tracking-tight text-ink">Complaint anomaly timeline</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Monthly CFPB complaint volume; amber bars mark months with a flagged product-level spike.
          </p>
          <div className="mt-4 rounded-xl border border-slate-200 bg-panel p-5 shadow-card">
            <AnomalyTimeline
              points={totals}
              flagged={flagged}
              ariaLabel={`Monthly consumer-complaint volume from ${totals[0].date.slice(0, 7)} to ${totals[totals.length - 1].date.slice(0, 7)}, with ${flagged.size} months highlighted as flagged spikes, the largest being ${s.complaint_anomalies.top[0].series} at ${s.complaint_anomalies.top[0].score.toFixed(2)} standard deviations.`}
            />
          </div>
        </div>
      </section>

      {/* Top anomalies table */}
      <section className="mt-8">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">
          Top flagged anomalies
        </h3>
        <AnomalyTable rows={s.complaint_anomalies.top} />
      </section>

      {/* Computed vs proposed callout */}
      <section className="mt-12 rounded-xl border border-amber-200 bg-amber-50/70 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-800">
          What is computed vs. proposed
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-amber-900/90">
          Every figure on this page is <span className="font-semibold">computed</span> from live public
          data: the delinquency forecast (SARIMAX with an 80% band and an honest backtest), the
          unemployment-shock scenarios (OLS on FRED UNRATE + TDSP), and the complaint anomalies
          (rolling z-scores on the CFPB trends API). Nothing here is a projection of proposed or
          hypothetical data — the sources file lists no proposed domains. Natural extensions (regional
          breakdowns, richer macro drivers, regime-aware models) are noted in Methodology as future
          work, not shown as results.
        </p>
      </section>
    </div>
  );
}
