# PulseCredit — Consumer Financial Stress & Risk Monitor

> **Tagline:** *See the strain before it breaks.*
> **Portfolio owner:** Jean-Luc Saint-Fleur — Product Strategist + Analytics Lead
> **Package status:** Implementation-ready (datasets verified as of July 2026)
> **Sector:** Financial Services / Fintech — Consumer Credit Risk

---

## PART 1 — PRODUCT ONE-PAGER

### Name & Positioning
**PulseCredit** is a public-data early-warning cockpit that fuses consumer-complaint signals with delinquency and charge-off dynamics so risk teams can *see the strain before it breaks* — months before losses hit the P&L or land on a regulator's desk.

### Sector
Financial Services / Fintech — consumer credit risk, servicing, and compliance.

### Target Employers
JPMorgan Chase, Capital One, American Express, Discover, SoFi, Affirm, Upstart, Experian, TransUnion, the CFPB / Federal Reserve, and advisory shops (Deloitte, McKinsey).

### Target Users
- Consumer-credit **risk officers** (underwriting & credit-line strategy)
- **Collections / portfolio strategy** analysts
- **Complaints / compliance** teams (CFPB response)
- **Fintech growth-risk PMs**
- **Economists** tracking the household-credit cycle

### Business Problem
Consumer-credit deterioration and servicing failures surface in *leading* public signals — complaint spikes and delinquency-transition upticks — **months before** they reach charge-off P&L and regulators. But these feeds (CFPB, FRED, Fed G.19, NY Fed HHDC) are siloed, published on mismatched cadences, and use incompatible product taxonomies. Nobody is watching them together, on one clock.

### Five Primary Decisions It Informs
1. **Where to tighten** underwriting / credit-line strategy — by product and region.
2. **Which product lines or peers** show anomalous complaint surges worth investigating.
3. **Loss-reserve / collections provisioning** under a macro scenario (e.g., "+2pp unemployment").
4. **Is a local uptick noise or a cycle's leading edge** — signal vs. seasonality.
5. **Where to prioritize CFPB-response / remediation** resourcing.

### Value Proposition
One monitored clock across five authoritative public feeds; forecasts with honest hold-out validation; complaint anomaly flags backtested to *precede* confirmed delinquency/charge-off rises with a reported lead time — turning fragmented public data into a defensible early-warning system.

### Measurable Success Framework
- **Forecast quality:** delinquency/charge-off forecast beats a seasonal-naive baseline on hold-out quarters (target MAPE improvement ≥ 15% vs naive).
- **Lead-time evidence:** backtest shows anomaly flags lead confirmed delinquency/charge-off inflections by a measurable number of weeks (reported, not asserted).
- **Coverage:** 100% of in-scope products × states refreshed on each pipeline run with freshness timestamps.
- **Trust:** every KPI carries a definition, source, and limitation; zero un-sourced numbers on screen.

### Distinct Visual Identity
- **Base:** deep navy `#0B1B2B` / graphite `#1E2A38`.
- **Stress accent:** amber `#F2A900` for elevated-stress states and anomaly flags.
- **Diverging stress scale:** colorblind-safe teal → grey → amber (calm → neutral → strained), verified against deuteranopia/protanopia simulation; never red/green alone.
- **Type & feel:** tabular-numeric, dense-but-calm dashboards; annotation-first charts.

---

## PART 2 — PRODUCT REQUIREMENTS DOCUMENT (condensed, all 22 areas)

### 1. Product & Tagline
PulseCredit — "See the strain before it breaks." A consumer financial stress & risk monitor built entirely on authoritative public data.

### 2. Industry & Target Employers
Consumer credit risk / fintech (issuers, BNPL, lenders, bureaus, regulators, advisory). Employers as listed above.

### 3. Target Users
Risk officers, collections/portfolio strategists, complaints/compliance teams, fintech growth-risk PMs, economists. Personas differ in cadence (daily complaint watch vs. quarterly reserve cycle) and in tolerance for false positives.

### 4. Business Problem
See one-pager. Core friction: **siloed feeds + mismatched cadence + incompatible taxonomy** hide a signal that is, in aggregate, already public.

### 5. User Needs
- Trust every number (source + definition + limitation visible).
- Distinguish noise from a cycle's leading edge.
- Simulate a macro scenario without a data-science team.
- Drill from national trend → product → state → company.
- Defend a call to a credit committee or examiner.

### 6. Primary Decisions
The five decisions above; each dashboard page maps to at least one.

### 7. Dataset Inventory

| Dataset | Source / URL | License | Cadence | Coverage | Time span | Key fields | Limitations & quality risks | Why it's here |
|---|---|---|---|---|---|---|---|---|
| **CFPB Consumer Complaint Database** | CFPB — https://www.consumerfinance.gov/data-research/consumer-complaints/ · API https://www.consumerfinance.gov/data-research/consumer-complaints/search/api/v1/ (append `?format=csv`) | Public domain (US Gov); complaints de-identified | **Daily** | US, state + 3-digit ZIP | Dec 2011–present (~6–8M rows) | `date_received, product, sub_product, issue, sub_issue, company, state, zip_code (3-digit), company_response, timely_response, consumer_disputed, complaint_what_happened, complaint_id` | Self-selected (not representative); volume swings from press/policy; reporting lag near current date | The leading, high-frequency signal — the "pulse" |
| **FRED delinquency / charge-off** | St. Louis Fed — DRCCLACBS (card delinquency) https://fred.stlouisfed.org/series/DRCCLACBS · DRCLACBS (consumer-loan delinquency) · CORCCACBS (card charge-off); API https://fred.stlouisfed.org/docs/api/fred/ | FRED Terms of Use — free w/ attribution | **Quarterly**, national | US national | ~1985–present | `date, value (%)` | Quarterly national only — no state/product granularity; revisions | Ground-truth outcome the pulse is meant to lead |
| **Federal Reserve G.19 Consumer Credit** | Fed — https://www.federalreserve.gov/releases/g19/current/ (Data Download Program, `rel=G19`) | Public domain | **Monthly**, national | US national | Long history | Revolving / nonrevolving balances, card interest rates | Aggregate; monthly cadence | Credit-growth & rate driver for scenarios |
| **NY Fed Household Debt & Credit Report** | NY Fed — https://www.newyorkfed.org/microeconomics/hhdc | Free w/ attribution; aggregated (no PII) | **Quarterly** | US national | 2003–present | Delinquency **transition rates** (30/90+), balances by loan type (**auto / card / student** — *not mortgage*, to stay distinct from the housing project) | Aggregate; XLSX format, layout shifts between releases | Transition dynamics — the mechanics of deterioration |
| **FRED macro drivers** | UNRATE (monthly) https://fred.stlouisfed.org/series/UNRATE · Household Debt Service Ratio TDSP (quarterly) https://www.federalreserve.gov/releases/dsr/ | FRED Terms of Use / Public domain | Monthly / Quarterly | US national | Long history | `date, value` | National only | Scenario regressors (unemployment, debt-service burden) |

**Join keys:** `date` (align weekly → quarterly), `state`, and a harmonized product/loan-type taxonomy (CFPB "Credit card" ↔ DRCCLACBS card series). **Aggregate only — no borrower-level joins, ever.**

### 8. Data Model (staging → marts)
- **Staging (`stg_`):** one clean table per source, typed and de-duplicated, native grain preserved.
  - `stg_cfpb_complaints` (grain: complaint_id) · `stg_fred_series` (grain: series_id × date) · `stg_g19` (grain: series × month) · `stg_nyfed_hhdc` (grain: metric × quarter) · `stg_macro` (grain: series × date).
- **Intermediate (`int_`):** taxonomy harmonization map, complaint aggregation to product × state × week, frequency-aligned macro panel.
- **Marts (`mart_`):**
  - `mart_complaints_weekly` — grain: product × state × week (counts, response mix, on-time rate).
  - `mart_stress_panel` — grain: product × state × quarter (complaints, delinquency, charge-off, transitions, macro).
  - `mart_forecast` — grain: series × horizon quarter (point + prediction interval).
  - `mart_anomaly` — grain: product × company × state × week (score, flag, z, event tag).

### 9. KPI Dictionary

Each KPI below carries: business definition · formula · source · grain · time period · inclusion/exclusion · limitations · display format · interpretation.

**KPI 1 — Complaint Anomaly Score**
- *Definition:* how unusual current complaint volume is for a product/company/state versus its own seasonal history.
- *Formula:* STL-decompose the weekly series; compute rolling z-score of the residual (Seasonal-Hybrid ESD as cross-check); `flag = |z| ≥ 3`.
- *Source:* CFPB. *Grain:* product × company × state × week. *Period:* trailing 156 weeks for baseline.
- *Inclusion/exclusion:* exclude the most recent 2–3 weeks from *confirmed* flags due to reporting lag (shown as "provisional").
- *Limitations:* CFPB is self-selected; a spike may reflect press coverage, not deterioration.
- *Display:* signed number + amber flag chip. *Interpretation:* a flag is a *prompt to investigate*, not a verdict.

**KPI 2 — Forecast Stress Index**
- *Definition:* forward-looking composite of forecasted delinquency and charge-off vs. their recent normal, on a 0–100 scale.
- *Formula:* min-max normalize each forecast series against its trailing-cycle range, weight (delinquency 0.6 / charge-off 0.4), scale to 0–100.
- *Source:* FRED (DRCCLACBS, CORCCACBS) + model output. *Grain:* series / national × forecast quarter. *Period:* next 1–4 quarters.
- *Inclusion/exclusion:* national series only (source granularity limit).
- *Limitations:* index is a *derived composite*, not a Fed statistic; sensitive to normalization window.
- *Display:* gauge + fan chart. *Interpretation:* trajectory and interval width matter more than the level.

**KPI 3 — Complaint-to-Delinquency Lead Correlation**
- *Definition:* strength and timing of the lead relationship between complaint anomalies and later delinquency rises.
- *Formula:* cross-correlation of the complaint index against DRCCLACBS across lags; report peak correlation and the lag (in weeks/quarters) where it occurs.
- *Source:* CFPB + FRED. *Grain:* national / product. *Period:* full overlapping history.
- *Inclusion/exclusion:* require ≥ 8 overlapping quarters.
- *Limitations:* correlation ≠ causation; unstable in structural breaks (e.g., 2020).
- *Display:* lag-correlation bar chart + headline lead time. *Interpretation:* evidence for how much runway a flag buys — reported honestly, including weak/negative cases.

**KPI 4 — Servicing Risk Ratio**
- *Definition:* share of complaints resolved in a way that signals servicing friction.
- *Formula:* `(complaints closed with "in progress" / untimely / disputed) ÷ total complaints`, by product × company × quarter.
- *Source:* CFPB (`company_response`, `timely_response`, `consumer_disputed`). *Grain:* product × company × quarter.
- *Inclusion/exclusion:* exclude rows with null response; exclude companies below a min-volume threshold (default 30) to avoid small-sample noise.
- *Limitations:* response fields are company-reported; taxonomy of responses shifts over time.
- *Display:* ranked bar + percentage. *Interpretation:* elevated ratio = servicing/remediation attention, distinct from credit risk.

**KPI 5 — On-time Response Rate**
- *Definition:* share of complaints the company addressed within the CFPB-timely window.
- *Formula:* `timely_response = "Yes" ÷ total complaints`, by company × quarter.
- *Source:* CFPB (`timely_response`). *Grain:* company × quarter. *Period:* rolling 4 quarters.
- *Inclusion/exclusion:* exclude null `timely_response`.
- *Limitations:* self-reported; "timely" ≠ "resolved well."
- *Display:* percentage + trend sparkline. *Interpretation:* a compliance-hygiene indicator; declines can precede regulatory attention.

*(Supporting KPIs: total complaint volume, delinquency-transition rate 30→90, revolving-balance growth, DSR level — same dictionary format in `/docs/kpi.md`.)*

### 10. Analytical Methodology
- **Forecasting:** SARIMA / Prophet / gradient-boosted lag models on delinquency & charge-off; feature set includes complaint index lags, UNRATE, DSR, G.19 revolving growth.
- **Scenario modeling:** regress delinquency on UNRATE + DSR + G.19 revolving growth; simulate shocks (e.g., "+2pp unemployment") to project delinquency/reserve implications, with prediction intervals.
- **Anomaly detection:** STL residual + rolling z-score / Seasonal-Hybrid ESD on CFPB series by product/company/state; optional Isolation Forest as a multivariate cross-check.
- **Honest validation:** hold-out quarters; **MAPE / RMSE vs a seasonal-naive baseline**; backtest that anomaly flags *precede* confirmed delinquency/charge-off rises, **reporting the measured lead time** (including where it is weak). No metric is claimed that the backtest does not produce.

### 11. Planned Pages & Navigation
`Landing` · `Executive Overview` · `Forecast & Scenario` · `Complaint Anomaly Explorer` · `Methodology / Data` · `About`.

### 12. Required Visualizations
- **Forecast fan chart** (point + 50/80/95% prediction bands) — ECharts.
- **Stress heatmap** product × state (colorblind-safe diverging scale) — ECharts.
- **Anomaly timeline** with event annotations (policy/press markers) — ECharts.
- **KPI cards** with value, trend sparkline, freshness stamp — Recharts.
- **Scenario sliders** (unemployment, DSR, revolving growth) driving a live re-forecast.

### 13. Filtering / Interaction Behavior
Global filters: product, state, company, date range, cadence. Cross-filtering (click a heatmap cell → filters timeline + KPI cards). Anomaly threshold slider. URL-synced filter state (shareable views). Hover tooltips carry source + as-of date.

### 14. Responsive Behavior
- **Desktop (≥1280px):** multi-column dashboard, side filter rail.
- **Tablet (768–1279px):** stacked panels, collapsible filters, charts keep interactivity.
- **Mobile (<768px):** single column, KPI cards first, heatmap → horizontally scrollable, sliders become steppers.

### 15. Accessibility (WCAG 2.1 AA)
Contrast ≥ 4.5:1 (verified on navy/amber); full keyboard navigation; ARIA roles on charts with text/table fallbacks; colorblind-safe diverging scale (never color-only encoding — pair with shape/label); visible focus states; `prefers-reduced-motion` respected; screen-reader summaries for every chart.

### 16. Performance Requirements
- **LCP** < 2.5s on 4G (Vercel edge).
- **JS bundle** < 250KB gzipped initial route; ECharts lazy-loaded per chart route.
- **Data payload** per page < 500KB (pre-aggregated Parquet → JSON; no raw complaint rows shipped to client).
- Static-generate marts at build; incremental revalidation for fresh data.

### 17. Testing Requirements
- **Unit (Vitest + RTL):** KPI formula functions, taxonomy map, transforms.
- **Data-validation (CI):** Zod schemas on every mart; row-count & freshness assertions; null-rate thresholds.
- **Integration:** route handlers return valid, schema-conformant JSON.
- **E2E (Playwright):** filter → chart update, scenario slider re-forecast, a11y smoke (axe).

### 18. Deployment Requirements
GitHub Actions: lint → typecheck → unit → data-validation → build → Playwright smoke. Vercel **preview per PR**, **prod from `main`**. Secrets (FRED API key) in GitHub/Vercel env, never committed.

### 19. GitHub Documentation Requirements
`README` (problem, screenshots, data lineage, run instructions), `docs/kpi.md`, `docs/methodology.md`, `docs/data-sources.md` (licenses + attribution), `docs/architecture.md`, `CONTRIBUTING`, `LICENSE`. Every dataset attribution and license reproduced.

### 20. Acceptance Criteria
- All five feeds ingest, validate, and refresh reproducibly from scripts.
- All six pages render with real (not placeholder) public data.
- Every KPI on screen traces to a dictionary entry with source + limitation.
- Forecast reports hold-out MAPE/RMSE **against the naive baseline**.
- Anomaly backtest reports a measured lead time (or states it is inconclusive).
- CI green; Lighthouse a11y ≥ 95; performance targets met.

### 21. Stretch Features
Isolation-Forest multivariate anomalies; company peer-benchmark view; alerting/email digest; downloadable scenario report (PDF); saved views; natural-language "explain this spike."

### 22. Risks & Mitigations
| Risk | Mitigation |
|---|---|
| **Taxonomy harmonization** (CFPB products ↔ FRED/NY Fed series) | Explicit, versioned mapping table in `data/metadata/`; unmapped items surfaced, not silently dropped; documented in methodology |
| **Complaint non-representativeness** (self-selected) | Framed as a *leading indicator, not a prevalence estimate*; every complaint KPI carries the limitation on-screen |
| **Frequency mismatch** (daily/weekly ↔ monthly/quarterly) | Documented alignment rules (aggregate weekly → quarterly); interval widths widen honestly across cadence gaps |
| **Near-current reporting lag** (CFPB) | Trailing 2–3 weeks marked "provisional"; excluded from confirmed flags |
| **Correlation vs causation** in lead metrics | Reported as association with explicit caveat; structural-break years annotated |

**Calculated vs. proposed-future boundary:** Everything computed from the five verified feeds (complaint aggregates, anomaly scores, forecasts, backtested lead time, scenario regressions) is a **calculated finding** and labeled as such. Alerting, NL explanations, peer benchmarking, and PDF export are **proposed future capabilities**, visibly badged "Planned" in the UI and README. No metric, user count, or business impact is ever fabricated.

---

## PART 3 — CODEX IMPLEMENTATION PACKAGE

### Repository
`jls-pulsecredit`

### Objective
Ship a production-quality, fully public-data early-warning dashboard for consumer credit stress: reproducible Python pipeline → Parquet/JSON marts → Next.js 15 App Router dashboard with forecasting, scenario modeling, and complaint anomaly detection, all honestly validated.

### Technical Architecture
```
Public APIs/files ──► Python 3.12 pipeline (Polars/Pandas + DuckDB)
  (CFPB, FRED, G.19, NY Fed, macro)      │ ingest → validate(Zod-parity/pandera) → transform → model
                                          ▼
                        data/processed/*.parquet + *.json (marts)
                                          │ (build-time import)
                                          ▼
        Next.js 15 (App Router, TS strict) ── Recharts + ECharts, TanStack Table
                     Zod-validated data loaders · Tailwind + Radix/shadcn
                                          ▼
                 Vercel (preview per PR / prod from main) · GitHub Actions CI
```

### Folder Structure
```
jls-pulsecredit/
├─ app/                      # Next.js App Router routes (6 pages)
├─ components/               # shared UI (cards, chart shells, filter rail)
├─ features/                 # forecast/, anomaly/, scenario/, overview/
├─ lib/                      # data loaders, KPI calc, zod schemas, palette
├─ data/
│  ├─ raw/                   # untouched API pulls (gitignored)
│  ├─ processed/             # Parquet + JSON marts (built)
│  └─ metadata/              # taxonomy map, source manifest, licenses
├─ scripts/
│  ├─ ingest/                # cfpb.py, fred.py, g19.py, nyfed.py, macro.py
│  ├─ transform/             # harmonize.py, align.py, features.py
│  └─ validate/              # schema + freshness + rowcount checks
├─ tests/
│  ├─ unit/                  # KPI formulas, transforms
│  ├─ integration/           # route handlers, loaders
│  └─ e2e/                   # Playwright flows + axe
├─ notebooks/                # EDA, model dev (not in prod path)
├─ docs/                     # kpi, methodology, data-sources, architecture
└─ .github/workflows/        # ci.yml
```

### Data Ingestion Plan
- **CFPB:** paginate the search API (`?format=csv` or JSON with `size`/`from`); pull incrementally by `date_received`; store raw to `data/raw/cfpb/`.
- **FRED:** REST API with free key for DRCCLACBS, DRCLACBS, CORCCACBS, UNRATE, TDSP; JSON observations.
- **Fed G.19:** Data Download Program (`rel=G19`) CSV/XML fetch.
- **NY Fed HHDC:** download quarterly XLSX; parse target sheets (transition rates, balances by loan type — auto/card/student only).
- All ingest scripts are idempotent, log an as-of timestamp, and write a source manifest to `data/metadata/`.

### Transformation Plan
1. **Harmonize** taxonomy via `data/metadata/taxonomy_map.csv` (CFPB product ↔ FRED/NY Fed series); unmapped → quarantine table.
2. **Frequency-align:** aggregate complaints weekly → quarterly; forward-align monthly macro to quarter; document rules.
3. **Feature build:** complaint index lags, seasonal residuals, macro regressors, growth rates.
4. **Model outputs:** forecast (point + intervals), anomaly scores/flags, scenario coefficients → write `mart_*` to Parquet **and** slimmed JSON for the client.

### Component List
KPICard, ForecastFanChart (ECharts), StressHeatmap (ECharts), AnomalyTimeline (ECharts), ScenarioSliders, FilterRail, DataTable (TanStack), FreshnessBadge, SourceTooltip, MethodologyCallout, PlannedBadge, ChartTableFallback.

### Page List
`/` Landing · `/overview` Executive Overview · `/forecast` Forecast & Scenario · `/anomalies` Complaint Anomaly Explorer · `/methodology` Methodology/Data · `/about` About.

### API / Route-Handler Requirements
Route handlers under `app/api/` serve pre-built mart JSON with Zod validation on read: `/api/forecast`, `/api/anomaly`, `/api/stress-panel`, `/api/kpi`. Handlers are read-only, cache-friendly (static + ISR), and never expose raw complaint rows.

### Testing Plan
Unit (KPI/transform), integration (loaders/handlers return schema-valid data), data-validation (pandera/Zod parity + freshness + row counts in CI), E2E (Playwright: filter interaction, scenario re-forecast, axe a11y). Coverage gate on `lib/` KPI functions.

### Accessibility Checklist
Contrast AA · keyboard nav · ARIA + table fallbacks on charts · colorblind-safe non-color-only encoding · focus states · reduced-motion · Lighthouse a11y ≥ 95.

### Performance Checklist
LCP < 2.5s · initial bundle < 250KB gz · ECharts lazy per route · payload < 500KB/page · static marts + ISR · image/font optimization.

### Deployment Checklist
CI passes (lint/type/unit/data-validation/build/e2e) · Vercel preview per PR · prod from `main` · env secrets set · README screenshots current.

### Git Branch Strategy
`main` (prod) ← PRs from `feat/*`, `data/*`, `chore/*`; one ticket per branch; squash-merge; CI required.

### Commit Plan
Conventional commits, one logical unit per commit; each ticket ends in a tagged, mergeable PR (see tickets).

### Definition of Done
Feeds ingest & validate reproducibly · all six pages render real data · every KPI traces to the dictionary with source + limitation · forecast reports hold-out MAPE/RMSE vs naive · anomaly backtest reports lead time (or "inconclusive") · CI green · a11y ≥ 95 · perf targets met · docs complete · deployed to Vercel prod.

---

## PART 4 — IMPLEMENTATION TICKETS

**PC-01 — Repo & tooling scaffold**
- *Objective:* Next.js 15 App Router + TS strict + Tailwind + Radix/shadcn + ESLint/Prettier + Vitest/Playwright.
- *Files:* `package.json`, `tsconfig.json`, `tailwind.config.ts`, `app/layout.tsx`, `.eslintrc`, `playwright.config.ts`.
- *Dependencies:* none.
- *Instructions:* scaffold app, strict TS, base theme tokens (navy/graphite/amber), font + layout shell.
- *Tests:* build passes; smoke test renders layout.
- *Acceptance:* `npm run build` + lint + typecheck green.
- *Commit:* `chore: scaffold next15 app with strict ts, tailwind, tooling`

**PC-02 — Design system & palette**
- *Objective:* tokens, KPICard, chart shells, PlannedBadge, colorblind-safe diverging scale.
- *Files:* `lib/palette.ts`, `components/KPICard.tsx`, `components/*Shell.tsx`.
- *Dependencies:* PC-01.
- *Instructions:* encode diverging teal→grey→amber scale + accessible contrast utilities.
- *Tests:* unit test palette contrast helper; RTL render KPICard.
- *Acceptance:* palette passes AA contrast assertions.
- *Commit:* `feat: add design system tokens and colorblind-safe stress palette`

**PC-03 — CFPB ingestion**
- *Objective:* paginated CFPB complaint pull to `data/raw/cfpb/`.
- *Files:* `scripts/ingest/cfpb.py`, `data/metadata/source_manifest.json`.
- *Dependencies:* PC-01.
- *Instructions:* paginate API, incremental by `date_received`, idempotent, log as-of.
- *Tests:* unit test pagination + dedupe on fixture.
- *Acceptance:* re-run yields no dupes; manifest updated.
- *Commit:* `feat(ingest): add paginated CFPB complaint ingestion`

**PC-04 — FRED + macro + G.19 + NY Fed ingestion**
- *Objective:* pull DRCCLACBS/DRCLACBS/CORCCACBS/UNRATE/TDSP, G.19 DDP, NY Fed XLSX.
- *Files:* `scripts/ingest/fred.py`, `g19.py`, `nyfed.py`, `macro.py`.
- *Dependencies:* PC-01.
- *Instructions:* FRED via API key (env); parse NY Fed target sheets (auto/card/student, no mortgage).
- *Tests:* unit-parse XLSX + FRED JSON fixtures.
- *Acceptance:* all series land typed in `data/raw/`.
- *Commit:* `feat(ingest): add fred, g19, ny fed, and macro ingestion`

**PC-05 — Staging & taxonomy harmonization**
- *Objective:* `stg_` tables + versioned taxonomy map; quarantine unmapped.
- *Files:* `scripts/transform/harmonize.py`, `data/metadata/taxonomy_map.csv`.
- *Dependencies:* PC-03, PC-04.
- *Instructions:* DuckDB staging; map CFPB "Credit card" ↔ card series; surface unmapped.
- *Tests:* unit test mapping + quarantine path.
- *Acceptance:* mapping coverage report generated; no silent drops.
- *Commit:* `feat(transform): harmonize product taxonomy across sources`

**PC-06 — Frequency alignment & feature build**
- *Objective:* weekly→quarterly complaint aggregates, aligned macro panel, features.
- *Files:* `scripts/transform/align.py`, `features.py`.
- *Dependencies:* PC-05.
- *Instructions:* documented alignment rules; lag features; growth rates.
- *Tests:* unit test alignment on synthetic calendar.
- *Acceptance:* `mart_stress_panel` + `mart_complaints_weekly` built.
- *Commit:* `feat(transform): add frequency alignment and feature engineering`

**PC-07 — Forecasting & scenario models**
- *Objective:* SARIMA/Prophet/GBM forecasts + scenario regression; hold-out validation.
- *Files:* `scripts/transform/models.py`, `notebooks/forecasting.ipynb`.
- *Dependencies:* PC-06.
- *Instructions:* train, hold out quarters, compute MAPE/RMSE vs seasonal-naive; write `mart_forecast` with intervals + scenario coefficients.
- *Tests:* unit test baseline + metric computation.
- *Acceptance:* validation metrics persisted alongside forecasts.
- *Commit:* `feat(model): add delinquency/charge-off forecasts with holdout validation`

**PC-08 — Anomaly detection & lead-time backtest**
- *Objective:* STL residual z-score / S-H-ESD flags + backtest lead time.
- *Files:* `scripts/transform/anomaly.py`, `notebooks/anomaly.ipynb`.
- *Dependencies:* PC-06.
- *Instructions:* score by product/company/state; backtest flags vs later delinquency/charge-off rises; report lead time (or inconclusive); mark provisional recent weeks.
- *Tests:* unit test z-score + backtest on fixture.
- *Acceptance:* `mart_anomaly` + lead-time report written.
- *Commit:* `feat(model): add complaint anomaly detection and lead-time backtest`

**PC-09 — Data validation in CI**
- *Objective:* schema + freshness + row-count gates.
- *Files:* `scripts/validate/*.py`, `lib/schemas.ts`, `.github/workflows/ci.yml`.
- *Dependencies:* PC-06..PC-08.
- *Instructions:* pandera/Zod-parity schemas; null-rate thresholds; fail CI on drift.
- *Tests:* validation suite runs on marts.
- *Acceptance:* CI job `data-validation` gates merges.
- *Commit:* `ci: add data validation with schema, freshness, rowcount checks`

**PC-10 — Data loaders & route handlers**
- *Objective:* Zod-validated loaders + `/api/*` read-only handlers.
- *Files:* `lib/loaders.ts`, `app/api/{forecast,anomaly,stress-panel,kpi}/route.ts`.
- *Dependencies:* PC-09.
- *Instructions:* serve slim mart JSON; never expose raw rows; ISR-friendly.
- *Tests:* integration tests assert schema-valid responses.
- *Acceptance:* all handlers return validated JSON.
- *Commit:* `feat(api): add zod-validated data loaders and route handlers`

**PC-11 — Executive Overview + KPI cards**
- *Objective:* `/overview` with five headline KPIs + stress heatmap.
- *Files:* `app/overview/page.tsx`, `features/overview/*`, `components/StressHeatmap.tsx`.
- *Dependencies:* PC-02, PC-10.
- *Instructions:* KPI cards with freshness + source tooltip; heatmap product×state.
- *Tests:* RTL render + a11y; E2E cross-filter.
- *Acceptance:* real data renders; every KPI shows source + limitation.
- *Commit:* `feat(overview): add executive overview with kpi cards and stress heatmap`

**PC-12 — Forecast & Scenario page**
- *Objective:* fan chart + scenario sliders re-forecasting live.
- *Files:* `app/forecast/page.tsx`, `features/forecast/*`, `features/scenario/*`, `components/ForecastFanChart.tsx`.
- *Dependencies:* PC-10.
- *Instructions:* ECharts fan chart (50/80/95%); sliders (unemployment/DSR/revolving) drive scenario coefficients; show validation metrics.
- *Tests:* E2E slider → chart update; unit test scenario math.
- *Acceptance:* moving a slider updates the projection + interval.
- *Commit:* `feat(forecast): add fan chart and interactive scenario modeling`

**PC-13 — Complaint Anomaly Explorer**
- *Objective:* `/anomalies` timeline with event annotations + table.
- *Files:* `app/anomalies/page.tsx`, `features/anomaly/*`, `components/AnomalyTimeline.tsx`, `components/DataTable.tsx`.
- *Dependencies:* PC-10.
- *Instructions:* annotated timeline, threshold slider, TanStack table, provisional-week marking.
- *Tests:* E2E filter + threshold; RTL table.
- *Acceptance:* flags render with event context and provisional badges.
- *Commit:* `feat(anomaly): add complaint anomaly explorer with annotated timeline`

**PC-14 — Landing, Methodology/Data, About + docs & deploy**
- *Objective:* `/`, `/methodology`, `/about`, full docs, Vercel deploy.
- *Files:* `app/page.tsx`, `app/methodology/page.tsx`, `app/about/page.tsx`, `docs/*`, `README.md`.
- *Dependencies:* PC-11..PC-13.
- *Instructions:* methodology page with validation results + limitations + calculated-vs-planned boundary; data-sources page with licenses/attribution; README screenshots; wire Vercel prod.
- *Tests:* Playwright a11y smoke across all pages.
- *Acceptance:* all six pages live; docs complete; deployed to prod.
- *Commit:* `feat(pages): add landing, methodology, about and finalize docs/deploy`

---

## PART 5 — GO-TO-MARKET COPY

### Recruiter-Facing Description (2–3 sentences)
PulseCredit is a public-data early-warning dashboard for consumer-credit risk that fuses the CFPB complaint database with Federal Reserve and NY Fed delinquency, charge-off, and macro series on one clock. It forecasts credit stress with honestly hold-out-validated models, detects anomalous complaint surges by product/company/state, and backtests whether those anomalies actually lead confirmed losses — reporting the measured lead time rather than asserting it. Built end-to-end: Python/DuckDB pipeline to a Next.js 15 TypeScript dashboard, fully sourced and accessible.

### Resume Bullets (capability-framed, no fabricated impact)
- Built an end-to-end consumer-credit early-warning platform integrating five authoritative public feeds (CFPB complaints, FRED delinquency/charge-off, Fed G.19, NY Fed HHDC, macro drivers) via a reproducible Python 3.12 / Polars / DuckDB pipeline exporting validated Parquet/JSON marts.
- Implemented delinquency and charge-off forecasting (SARIMA/Prophet/gradient-boosted lag models) with scenario simulation and honest hold-out validation (MAPE/RMSE vs a seasonal-naive baseline), plus STL/z-score complaint anomaly detection backtested for lead time against confirmed deterioration.
- Delivered a production-grade Next.js 15 / TypeScript-strict dashboard (ECharts fan charts & heatmaps, scenario sliders, WCAG 2.1 AA, CI with lint/typecheck/unit/data-validation/Playwright, Vercel deploys) with a full KPI dictionary sourcing every on-screen metric.

### LinkedIn Launch Post (~150 words)
Consumer credit stress shows up in public data months before it hits the P&L — but the signals live in separate silos, on mismatched clocks, in incompatible taxonomies. So I built **PulseCredit**: *see the strain before it breaks.*

It brings five authoritative public feeds onto one clock — the CFPB Consumer Complaint Database alongside Federal Reserve and NY Fed delinquency, charge-off, and macro series — and turns them into an early-warning cockpit for credit risk, collections, and compliance teams.

Under the hood: a reproducible Python/DuckDB pipeline, delinquency and charge-off forecasts with scenario modeling ("what if unemployment rises 2 points?"), and complaint anomaly detection I *backtested* to see whether flags actually lead confirmed losses — then reported the real lead time instead of claiming one.

Every number on screen traces to a source and carries its limitations. Built with Next.js 15, TypeScript, ECharts, and an honest-validation-first mindset.

Public data, taken seriously. Feedback welcome.

---

*All figures and findings in this package are derived from the verified public datasets listed above; proposed future capabilities are labeled as such. No users, metrics, or business impact are fabricated.*
