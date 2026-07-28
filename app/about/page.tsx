import { SectionHeader } from "@/lib/design/primitives";

export const metadata = { title: "About — PulseCredit" };

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 pb-10 pt-12 sm:px-6">
      <SectionHeader eyebrow="About PulseCredit" title="A public-data briefing product for household credit stress">
        <p>
          PulseCredit helps credit-risk, macro, and policy teams ask better operating questions before
          delinquency stress becomes obvious in quarterly reporting.
        </p>
      </SectionHeader>

      <div className="space-y-5 text-[15px] leading-relaxed text-[var(--text-secondary)]">
        <p>
          The product combines four decision layers: a card-delinquency forecast with an honest
          confidence band, an unemployment-shock simulator, a complaint-anomaly monitor, and product
          concentration context. Its most important design choice is candor: the current forecast does
          not beat a naive baseline, and regional breakdowns are not shown when the public endpoint
          cannot support them.
        </p>
        <p>
          That makes PulseCredit useful as a briefing instrument. It does not replace lender portfolio
          data or supervisory analysis; it gives stakeholders a defensible public-data starting point
          for reserve planning, staffing, policy monitoring, and product triage.
        </p>

        <section className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-panel)] p-5 shadow-[var(--shadow-1)]">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">Who it is for</h2>
          <p className="mt-3">
            Consumer-credit risk officers, payer and bank portfolio analysts, macro strategists,
            financial-stability teams, consumer-protection policy analysts, and researchers who need a
            fast, auditable read on U.S. household credit stress.
          </p>
        </section>

        <section className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-panel)] p-5 shadow-[var(--shadow-1)]">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">About the author</h2>
          <p className="mt-3">
            PulseCredit is part of a five-product data portfolio by <b>Jean-Luc Saint-Fleur</b>,
            spanning housing, financial services, healthcare, retail, and transportation. Each product
            pairs a real business problem, credible public data, defensible analytics, and an
            executive-ready interface.
          </p>
        </section>

        <section className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-panel)] p-5 shadow-[var(--shadow-1)]">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">Built with</h2>
          <p className="mt-3">
            Next.js 15, TypeScript, Tailwind CSS, Recharts, Python, Pandas, statsmodels, FRED public
            data, and CFPB public data. Deployed on Vercel.
          </p>
        </section>
      </div>
    </main>
  );
}
