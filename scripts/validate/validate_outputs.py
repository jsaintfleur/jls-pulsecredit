#!/usr/bin/env python3
"""
Validate PulseCredit data artifacts. Exit 1 (fail) if any artifact is
missing or malformed. Intended to run in CI after build_index.py.
"""
import json
import sys
from pathlib import Path
import csv

ROOT = Path(__file__).resolve().parents[2]
PROC = ROOT / "data" / "processed"
META = ROOT / "data" / "metadata"
PUBLIC = ROOT / "public" / "data"

errors = []
warnings = []


def check(cond, msg):
    if not cond:
        errors.append(msg)


def load(p):
    if not p.exists():
        errors.append(f"MISSING FILE: {p}")
        return None
    try:
        return json.loads(p.read_text())
    except Exception as e:  # noqa
        errors.append(f"MALFORMED JSON in {p}: {e}")
        return None


# ---- series.json ----
series = load(PROC / "series.json")
if series is not None:
    hist = series.get("historical", {})
    check(isinstance(hist, dict) and len(hist) >= 3,
          "series.historical must contain >=3 series")
    for sid in ("DRCCLACBS", "UNRATE", "TDSP"):
        pts = hist.get(sid, [])
        check(isinstance(pts, list) and len(pts) > 10,
              f"series.historical.{sid} must have >10 points (got {len(pts)})")
        if pts:
            check(all("date" in p and "value" in p for p in pts[:5]),
                  f"series.historical.{sid} points need date+value")

    fc = series.get("forecast", {})
    fpts = fc.get("points", [])
    check(len(fpts) > 0, "forecast must have >0 points")
    check(fc.get("target") == "DRCCLACBS", "forecast.target must be DRCCLACBS")
    for p in fpts:
        check(all(k in p for k in ("date", "value", "lower", "upper")),
              "forecast points need date/value/lower/upper")
        check(p.get("lower", 1e9) <= p.get("value", -1) <= p.get("upper", -1e9),
              f"forecast band must bracket value at {p.get('date')}")
    # face validity: delinquency in sane % range
    dvals = [p["value"] for p in hist.get("DRCCLACBS", [])]
    if dvals:
        check(0.5 < max(dvals) < 12 and min(dvals) > 0,
              f"DRCCLACBS out of sane 0.5-12% range (min {min(dvals)}, max {max(dvals)})")
    drivers = series.get("macro_drivers", {})
    check(isinstance(drivers.get("drivers"), list) and len(drivers.get("drivers", [])) >= 3,
          "series.macro_drivers.drivers must contain >=3 computed drivers")
    breakdowns = series.get("breakdowns", {})
    check(isinstance(breakdowns.get("product"), list) and len(breakdowns.get("product", [])) >= 3,
          "series.breakdowns.product must contain >=3 product rows")
    region = breakdowns.get("region", {})
    check(region.get("status") in {"computed", "proposed", "unavailable"},
          "series.breakdowns.region.status must be computed/proposed/unavailable")


# ---- summary.json ----
summary = load(PROC / "summary.json")
if summary is not None:
    for key in ("headline", "forecast", "scenario", "complaint_anomalies", "coverage", "macro_drivers", "breakdowns"):
        check(key in summary, f"summary missing required key '{key}'")
    hl = summary.get("headline", {})
    check("latest_value_pct" in hl and hl["latest_value_pct"] is not None,
          "summary.headline.latest_value_pct required")
    fc = summary.get("forecast", {})
    check(isinstance(fc.get("trajectory_pct"), list) and len(fc["trajectory_pct"]) > 0,
          "summary.forecast.trajectory_pct must be non-empty")
    bt = fc.get("backtest", {})
    for k in ("model_rmse", "naive_rmse", "model_mape_pct", "naive_mape_pct"):
        check(k in bt and isinstance(bt[k], (int, float)),
              f"summary.forecast.backtest.{k} must be numeric (computed)")
    sc = summary.get("scenario", {})
    check("unrate_beta_pp_per_pp" in sc, "summary.scenario needs unrate beta")
    check("plus_2pp_unemployment_delta_pp" in sc,
          "summary.scenario needs +2pp delta")
    ca = summary.get("complaint_anomalies", {})
    if ca.get("status") != "computed":
        warnings.append(f"complaint_anomalies not computed: {ca.get('note')}")
    else:
        check(isinstance(ca.get("top"), list), "complaint_anomalies.top must be a list")
    drivers = summary.get("macro_drivers", {})
    check(isinstance(drivers.get("drivers"), list) and len(drivers.get("drivers", [])) >= 3,
          "summary.macro_drivers.drivers must contain >=3 computed drivers")
    for d in drivers.get("drivers", []):
        check(all(k in d for k in ("series_id", "label", "latest", "corr_with_card_delinquency")),
              f"macro driver missing required fields: {d}")
    breakdowns = summary.get("breakdowns", {})
    products = breakdowns.get("product", [])
    check(isinstance(products, list) and len(products) >= 3,
          "summary.breakdowns.product must contain >=3 product rows")
    for p in products:
        check(all(k in p for k in ("product", "latest_month", "latest_month_complaints",
                                   "trailing_12m_complaints", "trailing_12m_yoy_pct")),
              f"product breakdown missing required fields: {p}")
    region = breakdowns.get("region", {})
    check(region.get("status") in {"computed", "proposed", "unavailable"},
          "summary.breakdowns.region.status must be computed/proposed/unavailable")


# ---- sources.json ----
sources = load(META / "sources.json")
if sources is not None:
    lst = sources.get("sources", [])
    check(len(lst) >= 5, "sources must list >=5 entries")
    for s in lst:
        check(all(k in s for k in ("name", "url", "license", "role")),
              f"source entry missing fields: {s.get('name')}")


# ---- export + public copies ----
export_path = PROC / "pulsecredit-export.csv"
check(export_path.exists(), f"MISSING FILE: {export_path}")
if export_path.exists():
    try:
        with export_path.open(newline="") as f:
            rows = list(csv.DictReader(f))
        check(len(rows) >= 5, "pulsecredit-export.csv must contain >=5 rows")
        check({"section", "date", "label", "value", "lower", "upper",
               "unrate", "tdsp", "predicted_delinquency", "delta_vs_base",
               "series", "rolling_mean", "score"}.issubset(rows[0].keys()),
              "pulsecredit-export.csv missing required headers")
    except Exception as e:  # noqa
        errors.append(f"MALFORMED CSV in {export_path}: {e}")

for rel in ("series.json", "summary.json", "sources.json", "pulsecredit-export.csv"):
    check((PUBLIC / rel).exists(), f"MISSING PUBLIC COPY: {PUBLIC / rel}")


# ---- report ----
for w in warnings:
    print(f"WARN: {w}")
if errors:
    print(f"\nVALIDATION FAILED ({len(errors)} error(s)):")
    for e in errors:
        print(f"  - {e}")
    sys.exit(1)
print(f"VALIDATION PASSED (0 errors, {len(warnings)} warning(s)).")
sys.exit(0)
