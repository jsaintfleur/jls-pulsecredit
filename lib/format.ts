export const nf = new Intl.NumberFormat("en-US");

/** Whole-number formatter with thousands separators. */
export const fmtInt = (n: number) => nf.format(Math.round(n));

/** Percent value already expressed in percent units (e.g. 2.92 -> "2.92%"). */
export const fmtPct = (n: number | null, digits = 2) =>
  n == null ? "—" : `${Number(n).toFixed(digits)}%`;

/** Signed percentage-point delta (e.g. -0.14 -> "−0.14 pp", 0.28 -> "+0.28 pp"). */
export const fmtPp = (n: number | null, digits = 2) => {
  if (n == null) return "—";
  const v = Number(n);
  const sign = v > 0 ? "+" : v < 0 ? "−" : "";
  return `${sign}${Math.abs(v).toFixed(digits)} pp`;
};

/** Signed plain number (used for coefficients / betas). */
export const fmtSigned = (n: number | null, digits = 3) => {
  if (n == null) return "—";
  const v = Number(n);
  const sign = v > 0 ? "+" : v < 0 ? "−" : "";
  return `${sign}${Math.abs(v).toFixed(digits)}`;
};

/** ISO date "2026-01-01" -> "Jan 2026". */
export const fmtMonth = (iso: string) => {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
};

/** ISO date -> quarter label "Q1 2026". */
export const fmtQuarter = (iso: string) => {
  const d = new Date(iso + "T00:00:00Z");
  const q = Math.floor(d.getUTCMonth() / 3) + 1;
  return `Q${q} ${d.getUTCFullYear()}`;
};

/**
 * Anomaly-severity ramp keyed on z-score (rolling std-dev units). Amber-forward:
 * calm slate -> amber -> deep amber -> coral as the spike grows. Anchored so ~2σ
 * reads as "elevated" and ~3.5σ+ reads as "critical". Colorblind-safe warm ramp.
 */
export const STRESS_STOPS: [number, string][] = [
  [0, "#94a3b8"],
  [2, "#fcd34d"],
  [2.75, "#f59e0b"],
  [3.25, "#d97706"],
  [4, "#b91c1c"],
];

function hexToRgb(h: string) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex(r: number, g: number, b: number) {
  return "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
}

/** Map an anomaly z-score to a hex color on the stress ramp (clamped to stops). */
export function stressColor(z: number): string {
  const lo = STRESS_STOPS[0][0];
  const hi = STRESS_STOPS[STRESS_STOPS.length - 1][0];
  const s = Math.max(lo, Math.min(hi, z));
  for (let i = 1; i < STRESS_STOPS.length; i++) {
    const [s0, c0] = STRESS_STOPS[i - 1];
    const [s1, c1] = STRESS_STOPS[i];
    if (s <= s1) {
      const t = (s - s0) / (s1 - s0);
      const a = hexToRgb(c0);
      const b = hexToRgb(c1);
      return rgbToHex(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t);
    }
  }
  return STRESS_STOPS[STRESS_STOPS.length - 1][1];
}

/** Human severity label for an anomaly z-score. */
export function severityLabel(z: number): "Critical" | "Elevated" | "Watch" {
  if (z >= 3.25) return "Critical";
  if (z >= 2.75) return "Elevated";
  return "Watch";
}
