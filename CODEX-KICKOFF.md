# PulseCredit Kickoff

## Expected Work Package

Copy `project-2-pulsecredit.md` into this repo root as:

```text
WORKPACKAGE.md
```

## Kickoff Command

```text
Read WORKPACKAGE.md — the full package for PulseCredit, a consumer financial-stress monitor: delinquency forecasting +
macro scenario modeling + CFPB complaint anomaly detection. Execute PC-01 → PC-14 in order.

Pipeline: ingest CFPB Consumer Complaints (API, de-identified, daily), FRED delinquency/charge-off + UNRATE + TDSP
(needs a free FRED API key), Fed G.19, and NY Fed Household Debt & Credit (focus auto/card/student, NOT mortgage).
Harmonize product taxonomies and align frequencies. Build: SARIMA/Prophet/GBM forecasts with honest hold-out validation
(MAPE/RMSE vs naive baseline); scenario regression (delinquency ~ UNRATE + DSR + revolving growth); STL + rolling-z /
seasonal-hybrid-ESD anomaly detection with a lead-time backtest.

App: Landing, Executive Overview, Forecast & Scenario (fan charts + sliders), Complaint Anomaly Explorer (timeline with
event annotations, ECharts), Methodology & Data, About. PulseCredit navy/graphite + amber stress accent, colorblind-safe
diverging scale. This project is chart-forward (no map). Commit per ticket; pause for GitHub/Vercel + FRED key.
Confirm plan, then start PC-01.
```
