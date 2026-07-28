import Link from "next/link";
import { getSummary, getSeries } from "@/lib/data";
import { fmtInt, fmtPct, fmtPp, fmtMonth, fmtQuarter } from "@/lib/format";
import { KpiCard } from "@/components/KpiCard";
import { AnomalyTable } from "@/components/AnomalyTable";
import { ExportActions } from "@/components/ExportActions";
import { LazyAnomalyTimeline, LazyForecastChart, LazyScenarioPanel } from "@/components/LazyCharts";
import { Badge, Callout, DataTable, FreshnessPill, SectionHeader, Tooltip } from "@/lib/design/primitives";

export default function OverviewPage() {
  const s = getSummary();
  const series = getSeries();
  const freshness = new Date(s.generated_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const traj = s.forecast.trajectory_pct;
  const latest = s.headline.latest_value_pct;
  const end = traj[traj.length - 1];
  const dir = end < latest ? "easing" : end > latest ? "rising" : "flat";
  const histWindow = series.historical.DRCCLACBS.slice(-48);
  const fc = series.forecast.points;
  const totals = series.complaints_monthly.total;
  const flaggedDates = s.complaint_anomalies.top.map((a) => a.date);
  const bt = s.forecast.backtest;
  const topAnomaly = s.complaint_anomalies.top[0];
  const baseScenario = s.scenario.detail.scenarios[0];

  const execFindings = [
    {
      finding: `Card delinquency is ${fmtPct(latest)} as of ${fmtMonth(s.headline.as_of)}.`,
      implication: `${fmtPp(s.headline.yoy_change_pp)} year over year means the current signal is not a broad acceleration by itself.`,
      action: "Keep the watchlist active, but size reserves and outreach from the confidence band rather than a single point estimate.",
    },
    {
      finding: `The four-quarter forecast is ${dir} to ${fmtPct(end)} by ${fmtQuarter(s.forecast.horizon_end)}.`,
      implication: `Its 80% band is ${fmtPct(fc[fc.length - 1].lower)} to ${fmtPct(fc[fc.length - 1].upper)}, so precision is limited.`,
      action: "Use the forecast as a planning envelope, not as a trading-style prediction.",
    },
    {
      finding: `A +2pp unemployment stress adds ${fmtPp(s.scenario.plus_2pp_unemployment_delta_pp)} in modeled card delinquency.`,
      implication: `The regression explains R² ${s.scenario.r_squared.toFixed(2)} of historical variation with ${s.scenario.detail.n_obs} aligned quarters.`,
      action: "Translate macro scenarios into portfolio exposure, then test whether product teams can absorb the higher delinquency path.",
    },
    {
      finding: `${s.complaint_anomalies.top.length} complaint spikes are flagged, led by ${topAnomaly.series}.`,
      implication: `The top z-score is ${topAnomaly.score.toFixed(2)}σ, which is a servicing and compliance triage signal, not proof of causation.`,
      action: "Route the affected product line to operations review before complaints harden into losses or enforcement risk.",
    },
  ];

  return (
    <main className="mx-auto max-w-7xl px-5 pb-12 sm:px-6">
      <section className="grid gap-8 pb-8 pt-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.7fr)] lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-text)]">
            Consumer Credit · Financial-Stress Monitor
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-5xl">
            See household credit strain before it breaks.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--text-secondary)]">
            PulseCredit gives risk and policy teams a public-data read on delinquency direction,
            unemployment sensitivity, complaint stress, and the limits of the model.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              href="/methodology"
              className="ds-focus-ring rounded-[var(--radius-md)] bg-[var(--accent-600)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-700)]"
            >
              Review methodology
            </Link>
            <FreshnessPill label={freshness} />
            <Badge tone={bt.beats_naive_rmse ? "success" : "warning"}>
              Forecast does not beat naive baseline
            </Badge>
          </div>
        </div>
        <aside className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-panel)] p-5 shadow-[var(--shadow-1)]">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
            Decision warning
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            The SARIMAX forecast is useful for scenario discipline, but it currently trails a naive
            last-value baseline. PulseCredit keeps that scorecard visible so stakeholders do not
            mistake a statistical model for guaranteed predictive edge.
          </p>
        </aside>
      </section>

      <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Card delinquency"
          value={fmtPct(latest)}
          sub={`${fmtPp(s.headline.yoy_change_pp)} YoY · ${fmtMonth(s.headline.as_of)}`}
          hint="The share of credit-card loans at commercial banks that are delinquent. It is a lagging stress indicator and is updated quarterly."
        />
        <KpiCard
          label="Forecast · next 4Q"
          value={fmtPct(end)}
          sub={`${dir} to ${fmtQuarter(s.forecast.horizon_end)}`}
          hint="Central forecast for the end of the four-quarter horizon. Read it with the 80% band and the backtest scorecard."
        />
        <KpiCard
          label="+2pp unemployment"
          value={fmtPp(s.scenario.plus_2pp_unemployment_delta_pp)}
          sub={`delinquency · R² ${s.scenario.r_squared.toFixed(2)}`}
          hint="Estimated delinquency movement if unemployment rises two percentage points while debt-service burden is held fixed."
        />
        <KpiCard
          label="Complaint spikes"
          value={String(s.complaint_anomalies.top.length)}
          sub="flagged monthly anomalies"
          hint="Product-level CFPB complaint months with unusual volume based on rolling z-score. It is an attention signal, not proof of harm."
        />
      </section>

      <section className="mt-10">
        <SectionHeader eyebrow="Executive summary" title="What a stakeholder should do next">
          <p>Each finding below ties to a number already visible on this page.</p>
        </SectionHeader>
        <div className="grid gap-4 lg:grid-cols-2">
          {execFindings.map((item, index) => (
            <article key={item.finding} className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-panel)] p-5 shadow-[var(--shadow-1)]">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-600)] text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <h2 className="font-semibold text-[var(--text-primary)]">{item.finding}</h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                <b>Implication:</b> {item.implication}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                <b>Recommended action:</b> {item.action}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <div className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-panel)] p-5 shadow-[var(--shadow-1)]">
          <SectionHeader eyebrow="Forecast fan chart" title="Delinquency path with an 80% uncertainty band">
            <p>Observed rate, central forecast, and planning range for the next four quarters.</p>
          </SectionHeader>
          <LazyForecastChart
            history={histWindow}
            forecast={fc}
            ariaLabel={`Credit-card delinquency history and four-quarter forecast. Latest observed value is ${fmtPct(latest)}. Forecast ends at ${fmtPct(end)} with an 80 percent band from ${fmtPct(fc[fc.length - 1].lower)} to ${fmtPct(fc[fc.length - 1].upper)}.`}
          />
        </div>
        <div className="space-y-4">
          <Callout tone="warning" title="So what?">
            The point forecast is less important than the width of the band and the fact that the
            model does not beat a naive baseline. Treat it as a range for staffing, reserves, and
            policy planning.
          </Callout>
          <DataTable
            caption="Four-quarter forecast values with confidence bounds."
            columns={["Quarter", "Forecast", "80% lower", "80% upper"]}
            rows={fc.map((p) => [fmtQuarter(p.date), fmtPct(p.value), fmtPct(p.lower), fmtPct(p.upper)])}
          />
        </div>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)]">
        <div className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-panel)] p-5 shadow-[var(--shadow-1)]">
          <SectionHeader eyebrow="Scenario simulator" title="Translate unemployment shocks into delinquency">
            <p>Move the slider to recompute the projection from the stored OLS unemployment coefficient.</p>
          </SectionHeader>
          <LazyScenarioPanel rows={s.scenario.detail.scenarios} beta={s.scenario.unrate_beta_pp_per_pp} base={baseScenario} />
        </div>
        <div className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-panel)] p-5 shadow-[var(--shadow-1)]">
          <SectionHeader eyebrow="Complaint anomaly timeline" title="Watch operational stress before it becomes loss">
            <p>Zoom the monthly timeline to inspect flagged complaint spikes across product lines.</p>
          </SectionHeader>
          <LazyAnomalyTimeline
            points={totals}
            flaggedDates={flaggedDates}
            ariaLabel={`Monthly consumer-complaint volume from ${totals[0].date.slice(0, 7)} to ${totals[totals.length - 1].date.slice(0, 7)}, with ${flaggedDates.length} flagged spike months.`}
          />
          <div className="mt-4">
            <Callout tone="info" title="So what?">
              Complaint spikes are early-warning signals for servicing load and consumer-protection
              risk. They should trigger queue review, not automatic causal conclusions.
            </Callout>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
            Top flagged anomalies
          </h2>
          <Tooltip label="A z-score compares the month to its recent rolling mean and standard deviation. Higher values are more unusual.">
            <span className="rounded-full border border-[var(--border-default)] px-3 py-1 text-xs font-semibold text-[var(--text-tertiary)]">
              z-score definition
            </span>
          </Tooltip>
        </div>
        <AnomalyTable rows={s.complaint_anomalies.top} />
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-panel)] p-5 shadow-[var(--shadow-1)]">
          <SectionHeader eyebrow="Product breakdown" title="Where complaint volume is concentrated">
            <p>Computed from CFPB product trends; no regional figures are shown unless the public endpoint supports them.</p>
          </SectionHeader>
          <DataTable
            caption="Product complaint breakdowns by latest month and trailing twelve month total."
            columns={["Product", "Latest month", "Latest complaints", "TTM complaints", "TTM YoY"]}
            rows={s.breakdowns.product.map((p) => [
              p.product,
              fmtMonth(p.latest_month),
              fmtInt(p.latest_month_complaints),
              fmtInt(p.trailing_12m_complaints),
              p.trailing_12m_yoy_pct == null ? "n/a" : fmtPct(p.trailing_12m_yoy_pct, 1),
            ])}
          />
          <p className="mt-3 text-xs leading-5 text-[var(--text-tertiary)]">
            Regional breakdown status: <b>{s.breakdowns.region.status}</b>. {s.breakdowns.region.note}
          </p>
        </div>

        <div className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-panel)] p-5 shadow-[var(--shadow-1)]">
          <SectionHeader eyebrow="Macro drivers" title="Richer context for the delinquency signal">
            <p>Latest macro readings and their historical correlation with card delinquency.</p>
          </SectionHeader>
          <DataTable
            caption="Macro driver latest values, year over year change, and correlation with credit-card delinquency."
            columns={["Driver", "Latest", "YoY", "Correlation"]}
            rows={s.macro_drivers.drivers.map((d) => [
              d.label,
              fmtPct(d.latest, 2),
              d.yoy_change == null ? "n/a" : fmtPp(d.yoy_change, 2),
              d.corr_with_card_delinquency == null ? "n/a" : d.corr_with_card_delinquency.toFixed(2),
            ])}
          />
        </div>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.55fr)]">
        <div className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-panel)] p-5 shadow-[var(--shadow-1)]">
          <SectionHeader eyebrow="How to use this" title="For risk officers and policy analysts">
            <p>Use PulseCredit as a decision briefing, not as a black-box score.</p>
          </SectionHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">Consumer-credit risk officer</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                Pair the forecast band with unemployment scenarios to size reserve sensitivity,
                collections staffing, and customer-assistance triggers by product.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">Policy analyst</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                Use complaint anomalies and macro drivers to prioritize monitoring questions,
                then validate with source agencies before recommending intervention.
              </p>
            </div>
          </div>
        </div>
        <aside className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-panel)] p-5 shadow-[var(--shadow-1)]">
          <h2 className="font-semibold text-[var(--text-primary)]">Export the brief</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            Save the current executive view as a PDF/print brief, or download the ranked forecast,
            scenario, and anomaly CSV for handoff.
          </p>
          <div className="mt-4">
            <ExportActions />
          </div>
        </aside>
      </section>

      <section className="mt-12 rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-inset)] p-6">
        <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
          Computed vs. proposed
        </h2>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-[var(--text-secondary)]">
          Delinquency forecast, backtest, confidence band, scenario simulator, complaint anomalies,
          product breakdowns, macro driver context, freshness, and export CSV are computed from public
          FRED and CFPB data. Regional complaint breakdowns remain unavailable in this run because the
          keyless endpoint did not return a credible regional aggregate; they are not displayed as
          results. No fabricated portfolio, regional, or product metrics are used.
        </p>
      </section>
    </main>
  );
}
