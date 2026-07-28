import { getSources, getSummary } from "@/lib/data";
import { fmtPp, fmtSigned } from "@/lib/format";
import { DataTable, SectionHeader } from "@/lib/design/primitives";

export const metadata = { title: "Methodology & Data — PulseCredit" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">{title}</h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-[var(--text-secondary)]">{children}</div>
    </section>
  );
}

export default function MethodologyPage() {
  const meta = getSources();
  const s = getSummary();
  const c = s.scenario.detail.coefficients;
  const bt = s.forecast.backtest;

  return (
    <main className="mx-auto max-w-4xl px-5 pb-10 pt-12 sm:px-6">
      <SectionHeader eyebrow="Methodology & data" title="Built for decision audit, not model theater">
        <p>
          PulseCredit turns keyless public data into a briefing product for risk and policy teams.
          Every displayed number is either computed by the pipeline or explicitly marked unavailable.
        </p>
      </SectionHeader>

      <Section title="Source coverage">
        <DataTable
          caption="PulseCredit data sources, role, and access terms."
          columns={["Source", "Role", "Access"]}
          rows={meta.sources.map((src) => [
            `${src.name} (${src.series_id})`,
            src.role.replace(/_/g, " "),
            `${src.access}; ${src.license}`,
          ])}
        />
        <p className="text-sm">
          FRED and CFPB data are public U.S. government or government-distributed sources and require
          no API key for this pipeline.
        </p>
      </Section>

      <Section title="Delinquency forecast">
        <p>
          The target is FRED <b>DRCCLACBS</b>, the quarterly delinquency rate on credit-card loans at
          commercial banks. The pipeline fits <b>{s.forecast.method.replace(" 80% band", "")}</b> and
          publishes a four-quarter central forecast with an <b>80% confidence band</b>.
        </p>
        <p>
          The forecast is intentionally scored against a naive last-value baseline. On the current{" "}
          {bt.holdout_quarters}-quarter holdout, it <b>does not beat naive</b>: model MAPE{" "}
          {bt.model_mape_pct.toFixed(2)}% / RMSE {bt.model_rmse.toFixed(3)} versus naive MAPE{" "}
          {bt.naive_mape_pct.toFixed(2)}% / RMSE {bt.naive_rmse.toFixed(3)}. That is why the overview
          frames the forecast as a planning range instead of a claim of predictive advantage.
        </p>
      </Section>

      <Section title="Scenario simulator">
        <p>
          The unemployment slider uses the stored OLS coefficient from{" "}
          <code className="rounded bg-[var(--bg-inset)] px-1.5 py-0.5 text-[13px]">
            DRCCLACBS ~ const + UNRATE + TDSP
          </code>
          . The model uses {s.scenario.detail.n_obs} quarterly-aligned observations and has R²{" "}
          {s.scenario.r_squared.toFixed(3)}. Coefficients are const {fmtSigned(c.const)}, UNRATE{" "}
          {fmtSigned(c.UNRATE)}, and TDSP {fmtSigned(c.TDSP)}.
        </p>
        <p>
          Plain-language reading: each +1pp of unemployment maps to{" "}
          <b>{fmtPp(s.scenario.unrate_beta_pp_per_pp)}</b> of modeled card delinquency while TDSP is
          held fixed. This is descriptive sensitivity analysis, not a causal claim.
        </p>
      </Section>

      <Section title="Complaint anomalies and breakdowns">
        <p>
          CFPB product-level complaint trends are scanned for rolling z-score spikes. A high z-score
          means the product line is unusually elevated relative to its own recent history. It is a
          triage signal for servicing and compliance review, not evidence that the product caused the
          stress.
        </p>
        <p>
          Product breakdowns are computed from CFPB product trend series using latest-month volume and
          trailing-12-month totals. Regional breakdowns are <b>{s.breakdowns.region.status}</b> in this
          run: {s.breakdowns.region.note}
        </p>
      </Section>

      <Section title="Freshness, uncertainty, and limits">
        <ul className="ml-5 list-disc space-y-2">
          <li>Freshness is reported from the generated artifacts and latest FRED observation windows.</li>
          <li>The forecast band is shown because point estimates can imply false precision.</li>
          <li>Complaint behavior can reflect awareness, media cycles, and taxonomy changes.</li>
          <li>Regional figures are not fabricated when the public endpoint does not support them.</li>
          <li>No private portfolio balances, borrower income, or lender-specific performance files are used.</li>
        </ul>
      </Section>

      <Section title="Reproducibility">
        <p>
          Run{" "}
          <code className="rounded bg-[var(--bg-inset)] px-1.5 py-0.5 text-[13px]">npm run data</code>{" "}
          to regenerate the artifacts, then{" "}
          <code className="rounded bg-[var(--bg-inset)] px-1.5 py-0.5 text-[13px]">npm run validate</code>{" "}
          to check schema, sanity ranges, public copies, and export files. The app reads only those
          committed artifacts at build time.
        </p>
      </Section>
    </main>
  );
}
