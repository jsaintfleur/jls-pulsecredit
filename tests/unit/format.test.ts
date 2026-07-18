import { describe, it, expect } from "vitest";
import {
  fmtInt,
  fmtPct,
  fmtPp,
  fmtSigned,
  fmtMonth,
  fmtQuarter,
  stressColor,
  severityLabel,
  STRESS_STOPS,
} from "@/lib/format";

describe("number formatters", () => {
  it("formats integers with thousands separators", () => {
    expect(fmtInt(18367)).toBe("18,367");
    expect(fmtInt(5596.2)).toBe("5,596");
  });
  it("formats percents to fixed digits and handles null", () => {
    expect(fmtPct(2.92)).toBe("2.92%");
    expect(fmtPct(2.9049)).toBe("2.90%");
    expect(fmtPct(null)).toBe("—");
    expect(fmtPct(2.9, 1)).toBe("2.9%");
  });
  it("formats signed percentage-point deltas with a real minus glyph", () => {
    expect(fmtPp(0.2792)).toBe("+0.28 pp");
    expect(fmtPp(-0.14)).toBe("−0.14 pp");
    expect(fmtPp(0)).toBe("0.00 pp");
    expect(fmtPp(null)).toBe("—");
  });
  it("formats signed coefficients", () => {
    expect(fmtSigned(0.1396)).toBe("+0.140");
    expect(fmtSigned(-3.97638)).toBe("−3.976");
    expect(fmtSigned(null)).toBe("—");
  });
});

describe("date formatters", () => {
  it("formats ISO dates to month/year", () => {
    expect(fmtMonth("2026-01-01")).toBe("Jan 2026");
    expect(fmtMonth("2025-01-01")).toBe("Jan 2025");
  });
  it("formats ISO dates to quarter labels", () => {
    expect(fmtQuarter("2026-01-01")).toBe("Q1 2026");
    expect(fmtQuarter("2026-04-01")).toBe("Q2 2026");
    expect(fmtQuarter("2027-01-01")).toBe("Q1 2027");
  });
});

describe("stressColor ramp", () => {
  it("returns exact stop colors at anchors", () => {
    expect(stressColor(STRESS_STOPS[0][0]).toLowerCase()).toBe(STRESS_STOPS[0][1].toLowerCase());
    const lastZ = STRESS_STOPS[STRESS_STOPS.length - 1][0];
    expect(stressColor(lastZ).toLowerCase()).toBe(
      STRESS_STOPS[STRESS_STOPS.length - 1][1].toLowerCase(),
    );
  });
  it("clamps out-of-range input", () => {
    expect(stressColor(-5)).toBe(stressColor(STRESS_STOPS[0][0]));
    expect(stressColor(99)).toBe(stressColor(STRESS_STOPS[STRESS_STOPS.length - 1][0]));
  });
  it("produces valid hex for interpolated values", () => {
    for (const z of [1.2, 2.3, 3.0, 3.6]) expect(stressColor(z)).toMatch(/^#[0-9a-f]{6}$/i);
  });
  it("moves warmer as the spike grows (red channel non-decreasing overall)", () => {
    const red = (h: string) => parseInt(h.slice(1, 3), 16);
    expect(red(stressColor(3.9))).toBeGreaterThan(red(stressColor(0.5)));
  });
});

describe("severityLabel", () => {
  it("buckets z-scores into severity tiers", () => {
    expect(severityLabel(3.4)).toBe("Critical");
    expect(severityLabel(3.0)).toBe("Elevated");
    expect(severityLabel(2.7)).toBe("Watch");
  });
});
