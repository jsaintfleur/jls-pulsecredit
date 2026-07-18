import { getSources, getSummary } from "@/lib/data";
import { fmtSigned } from "@/lib/format";

export const metadata = { title: "Methodology & Data — PulseCredit" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold tracking-tight text-ink">{title}</h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-ink-soft">{children}</div>
    </section>
  );
}

export default function MethodologyPage() {
  const meta = getSources();
  const s = getSummary();
  const c = s.scenario.detail.coefficients;
  const bt = s.forecast.backtest;

  return (
    <div className="mx-auto max-w-3xl px-6 pb-8 pt-14">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">Methodology &amp; Data</h1>
      <p className="mt-3 text-lg leading-relaxed text-ink-soft">
        PulseCredit is built to be auditable: every number traces back to keyless, public-domain U.S.
        government data through a single reproducible pipeline. This page documents the sources, the
        three methods, their limits, and how to regenerate everything.
      </p>

      <Section title="Data sources">
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-4 py-2.5 font-medium">Source</th>
                <th className="px-4 py-2.5 font-medium">Role</th>
                <th className="px-4 py-2.5 font-medium">Access</th>
              </tr>
            </thead>
            <tbody>
              {meta.sources.map((src) => (
                <tr key={src.series_id} className="border-t border-slate-100 align-top">
                  <td className="px-4 py-2.5">
                    <a
                      href={src.url}
                      className="font-medium text-brand-700 underline-offset-2 hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {src.name}
                    </a>
                    <span className="block text-xs text-ink-faint">{src.series_id}</span>
                    <span className="mt-0.5 block text-xs text-ink-muted">{src.description}</span>
                  </td>
                  <td className="px-4 py-2.5 text-ink-soft">{src.role.replace(/_/g, " ")}</td>
                  <td className="px-4 py-2.5 text-ink-soft">{src.access}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm">
          All sources are U.S. Government public-domain data (FRED Terms of Use; CFPB open data) and
          require no API key.
        </p>
      </Section>

      <Section title="Method 1 — Delinquency forecasting">
        <p>
          The forecast target is FRED <b>DRCCLACBS</b> (credit-card delinquency rate, all commercial
          banks), a quarterly series back to 1991. We fit a{" "}
          <b>{s.forecast.method.replace(" 80% band", "")}</b> model and project four quarters ahead,
          publishing the central path with an <b>80% confidence band</b>.
        </p>
        <p>
          The model is <b>backtested honestly</b> on an {bt.holdout_quarters}-quarter rolling holdout
          against a naive last-value baseline. It currently{" "}
          <b>does not beat naive</b>: model MAPE {bt.model_mape_pct.toFixed(2)}% / RMSE{" "}
          {bt.model_rmse.toFixed(3)} versus naive MAPE {bt.naive_mape_pct.toFixed(2)}% / RMSE{" "}
          {bt.naive_rmse.toFixed(3)}. We report this scorecard on the overview rather than hiding it —
          for a slow, persistent series, beating persistence is genuinely hard, and pretending
          otherwise would be dishonest.
        </p>
      </Section>

      <Section title="Method 2 — Scenario regression">
        <p>
          To stress-test delinquency against the macro cycle we fit an OLS regression{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[13px]">
            DRCCLACBS ~ const + UNRATE + TDSP
          </code>{" "}
          on {s.scenario.detail.n_obs} quarterly-aligned observations (R² ={" "}
          {s.scenario.r_squared.toFixed(3)}). The fitted coefficients are const{" "}
          {fmtSigned(c.const)}, UNRATE {fmtSigned(c.UNRATE)} (percentage points of delinquency per
          point of unemployment), and TDSP {fmtSigned(c.TDSP)}. Scenarios step unemployment by
          +0/+1/+2/+3pp from its base of {s.scenario.detail.base.unrate}% while holding household
          debt-service (TDSP) fixed, yielding the marginal deltas shown on the overview.
        </p>
      </Section>

      <Section title="Method 3 — Complaint anomaly detection">
        <p>
          Monthly consumer-complaint volumes from the CFPB trends API are scanned per product line for
          spikes. Each month&apos;s value is compared to a trailing rolling mean and standard deviation;
          the resulting <b>z-score</b> ranks how unusual the surge is. Months exceeding the threshold
          are flagged, and the largest are surfaced as the top-anomalies table. This is an early-warning
          layer — a spike signals attention, not causation.
        </p>
      </Section>

      <Section title="Limitations (read before acting)">
        <ul className="ml-5 list-disc space-y-2">
          <li>
            <b>Forecast does not beat naive.</b> Over the holdout the SARIMAX model trails a last-value
            baseline; treat the point forecast as indicative and lean on the band.
          </li>
          <li>
            <b>Correlation, not causation.</b> The scenario regression is descriptive. A +2pp
            unemployment shock mapping to a delinquency change assumes the historical relationship
            holds and other drivers stay fixed.
          </li>
          <li>
            <b>Complaint volume is behavioral.</b> CFPB counts reflect complaint propensity, media
            cycles, and category reclassifications — not only underlying stress. Product taxonomies
            changed over the window.
          </li>
          <li>
            <b>National, quarterly granularity.</b> These are national aggregates; regional and
            higher-frequency breakdowns are future work, not shown here as results.
          </li>
        </ul>
      </Section>

      <Section title="Reproducibility">
        <p>
          The pipeline is one command —{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[13px]">npm run data</code>{" "}
          (<code className="rounded bg-slate-100 px-1.5 py-0.5 text-[13px]">python3 scripts/build_index.py</code>)
          — which pulls FRED and CFPB, fits the forecast, regression, and anomaly scores, and writes
          validated JSON artifacts. A separate check,{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[13px]">npm run validate</code>, asserts
          the outputs are well-formed and face-valid. No manual steps, no hand-edited numbers.
        </p>
      </Section>
    </div>
  );
}
