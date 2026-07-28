export interface SeriesPoint {
  date: string;
  value: number;
}

export interface ForecastPoint {
  date: string;
  value: number;
  lower: number;
  upper: number;
}

export interface Series {
  generated_at: string;
  frequency: string;
  historical: Record<string, SeriesPoint[]>;
  forecast: {
    target: string;
    label: string;
    status: string;
    method: string;
    points: ForecastPoint[];
  };
  complaints_monthly: {
    status: string;
    total: SeriesPoint[];
    by_product: Record<string, SeriesPoint[]>;
  };
  macro_drivers: MacroDrivers;
  breakdowns: Breakdowns;
}

export interface ScenarioRow {
  label: string;
  unrate: number;
  tdsp: number;
  predicted_delinquency: number;
  delta_vs_base: number;
}

export interface AnomalyRow {
  series: string;
  date: string;
  value: number;
  rolling_mean: number;
  score: number;
}

export interface MacroDriver {
  series_id: string;
  label: string;
  latest: number;
  yoy_change: number | null;
  corr_with_card_delinquency: number | null;
}

export interface MacroDrivers {
  as_of: string;
  drivers: MacroDriver[];
}

export interface ProductBreakdownRow {
  product: string;
  latest_month: string;
  latest_month_complaints: number;
  trailing_12m_complaints: number;
  trailing_12m_yoy_pct: number | null;
}

export interface RegionBreakdown {
  status: "computed" | "proposed" | "unavailable";
  note: string;
  rows: Array<Record<string, string | number | null>>;
}

export interface Breakdowns {
  product: ProductBreakdownRow[];
  region: RegionBreakdown;
}

export interface Summary {
  generated_at: string;
  headline: {
    metric: string;
    latest_value_pct: number;
    as_of: string;
    yoy_change_pp: number;
    status: string;
  };
  forecast: {
    status: string;
    method: string;
    trajectory_pct: number[];
    horizon_end: string;
    backtest: {
      holdout_quarters: number;
      model_mape_pct: number;
      model_rmse: number;
      naive_mape_pct: number;
      naive_rmse: number;
      beats_naive_rmse: boolean;
      beats_naive_mape: boolean;
    };
    beats_naive_baseline: boolean;
  };
  scenario: {
    status: string;
    unrate_beta_pp_per_pp: number;
    r_squared: number;
    plus_2pp_unemployment_delta_pp: number;
    detail: {
      method: string;
      n_obs: number;
      r_squared: number;
      coefficients: Record<string, number>;
      unrate_beta_pp_per_pp: number;
      base: {
        unrate: number;
        tdsp: number;
        predicted_delinquency: number;
        as_of: string;
      };
      scenarios: ScenarioRow[];
    };
  };
  complaint_anomalies: {
    status: string;
    note: string | null;
    top: AnomalyRow[];
  };
  macro_drivers: MacroDrivers;
  breakdowns: Breakdowns;
  coverage: {
    fred_series: string[];
    delinquency_history: { start: string; end: string; n_quarters: number };
    complaints_months: number;
    freshness_days_fred: number;
  };
}

export interface SourceEntry {
  name: string;
  series_id: string;
  description: string;
  url: string;
  license: string;
  access: string;
  role: string;
}

export interface SourcesMeta {
  generated_at: string;
  sources: SourceEntry[];
  labels: { computed: string; proposed: string };
}
