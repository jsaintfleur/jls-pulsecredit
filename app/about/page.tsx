export const metadata = { title: "About — PulseCredit" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 pb-8 pt-14">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">About PulseCredit</h1>

      <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-ink-soft">
        <p>
          Household financial stress builds quietly and then breaks suddenly. By the time delinquencies
          spike in a quarterly report, the strain has been accumulating for months. Risk, policy, and
          macro teams need one defensible instrument that combines <em>where delinquency is heading</em>,{" "}
          <em>how sensitive it is to the labor market</em>, and <em>where consumers are already
          shouting</em> — early enough to act.
        </p>
        <p>
          PulseCredit turns three authoritative public feeds into that instrument: a forecast of
          credit-card delinquency with an honest confidence band, an unemployment-shock scenario model,
          and a complaint-anomaly early-warning layer — every number traceable to its source, every
          limitation stated plainly, including where the forecast falls short.
        </p>

        <h2 className="pt-4 text-xl font-semibold tracking-tight text-ink">Who it&apos;s for</h2>
        <p>
          Consumer-credit risk officers, bank and fintech portfolio analysts, macro and rates
          strategists, financial-stability and consumer-protection policy teams, and economics
          researchers who need a fast, auditable read on U.S. household credit stress.
        </p>

        <h2 className="pt-4 text-xl font-semibold tracking-tight text-ink">About the author</h2>
        <p>
          PulseCredit is part of a five-product data portfolio by <b>Jean-Luc Saint-Fleur</b>, spanning
          housing, financial services, healthcare, retail, and transportation &amp; climate. Each
          product pairs a real business problem, credible public data, a defensible analytical method,
          and an executive-ready interface — and is honest about what the data can and cannot support.
        </p>

        <div className="mt-6 rounded-xl border border-slate-200 bg-panel p-5 text-sm">
          <p className="font-semibold text-ink">Built with</p>
          <p className="mt-1.5 text-ink-muted">
            Next.js 15 · TypeScript · Tailwind CSS · dependency-free SVG charts · Python (Pandas,
            statsmodels) · FRED &amp; CFPB public data. Deployed on Vercel.
          </p>
        </div>
      </div>
    </div>
  );
}
