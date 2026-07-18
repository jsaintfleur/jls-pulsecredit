import type { SeriesPoint, ForecastPoint } from "@/lib/types";

/**
 * Dependency-free SVG line chart: historical delinquency line + a forecast
 * segment drawn with an 80% confidence band. Pure server component (no JS
 * shipped). Accessible: role=img with a summarizing aria-label; the underlying
 * numbers are provided in a nearby table by the page.
 */
export function ForecastChart({
  history,
  forecast,
  height = 300,
  ariaLabel,
}: {
  history: SeriesPoint[];
  forecast: ForecastPoint[];
  height?: number;
  ariaLabel: string;
}) {
  const W = 760;
  const H = height;
  const m = { top: 16, right: 18, bottom: 34, left: 40 };
  const iw = W - m.left - m.right;
  const ih = H - m.top - m.bottom;

  // Combined ordered timeline: history then forecast. The last history point is
  // reused as the visual anchor so the forecast line/band connect seamlessly.
  const anchor = history[history.length - 1];
  const fcAll: { date: string; value: number; lower: number; upper: number }[] = [
    { date: anchor.date, value: anchor.value, lower: anchor.value, upper: anchor.value },
    ...forecast,
  ];

  const n = history.length + forecast.length; // total x slots (anchor shared)
  const xAt = (i: number) => m.left + (n <= 1 ? 0 : (i / (n - 1)) * iw);

  const allV = [
    ...history.map((p) => p.value),
    ...forecast.flatMap((p) => [p.lower, p.upper, p.value]),
  ];
  let yMin = Math.min(...allV);
  let yMax = Math.max(...allV);
  const pad = (yMax - yMin) * 0.12 || 0.5;
  yMin = Math.max(0, yMin - pad);
  yMax = yMax + pad;
  const yAt = (v: number) => m.top + ih - ((v - yMin) / (yMax - yMin)) * ih;

  const histLine = history.map((p, i) => `${xAt(i)},${yAt(p.value)}`).join(" ");
  const fcStartIdx = history.length - 1; // shared anchor index
  const fcLine = fcAll.map((p, k) => `${xAt(fcStartIdx + k)},${yAt(p.value)}`).join(" ");
  const bandTop = fcAll.map((p, k) => `${xAt(fcStartIdx + k)},${yAt(p.upper)}`);
  const bandBot = fcAll.map((p, k) => `${xAt(fcStartIdx + k)},${yAt(p.lower)}`).reverse();
  const bandPath = [...bandTop, ...bandBot].join(" ");

  // Y gridlines / ticks
  const ticks = 4;
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => yMin + ((yMax - yMin) * i) / ticks);

  // X year labels: pick roughly 6 evenly spaced history points
  const combinedDates = [...history.map((p) => p.date), ...forecast.map((p) => p.date)];
  const labelEvery = Math.max(1, Math.round(n / 6));
  const xLabels = combinedDates
    .map((d, i) => ({ d, i }))
    .filter(({ i }) => i % labelEvery === 0 || i === n - 1);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height={H}
      role="img"
      aria-label={ariaLabel}
      className="overflow-visible"
    >
      {/* Y gridlines + labels */}
      {yTicks.map((v, i) => (
        <g key={i}>
          <line
            x1={m.left}
            x2={W - m.right}
            y1={yAt(v)}
            y2={yAt(v)}
            stroke="#e2e8f0"
            strokeWidth={1}
          />
          <text x={m.left - 8} y={yAt(v) + 3} textAnchor="end" fontSize={10} fill="#94a3b8">
            {v.toFixed(1)}
          </text>
        </g>
      ))}

      {/* Forecast band */}
      <polygon points={bandPath} fill="#f59e0b" fillOpacity={0.16} />

      {/* Divider at forecast start */}
      <line
        x1={xAt(fcStartIdx)}
        x2={xAt(fcStartIdx)}
        y1={m.top}
        y2={m.top + ih}
        stroke="#cbd5e1"
        strokeWidth={1}
        strokeDasharray="3 3"
      />
      <text x={xAt(fcStartIdx) + 4} y={m.top + 10} fontSize={9.5} fill="#b45309" fontWeight={600}>
        forecast →
      </text>

      {/* Historical line */}
      <polyline points={histLine} fill="none" stroke="#334155" strokeWidth={1.8} />
      {/* Forecast line (dashed amber) */}
      <polyline
        points={fcLine}
        fill="none"
        stroke="#d97706"
        strokeWidth={2}
        strokeDasharray="5 3"
      />
      {/* Forecast point markers */}
      {forecast.map((p, k) => (
        <circle key={k} cx={xAt(fcStartIdx + 1 + k)} cy={yAt(p.value)} r={2.6} fill="#b45309" />
      ))}

      {/* X labels */}
      {xLabels.map(({ d, i }) => (
        <text key={i} x={xAt(i)} y={H - 12} textAnchor="middle" fontSize={10} fill="#94a3b8">
          {d.slice(0, 4)}
        </text>
      ))}
    </svg>
  );
}
