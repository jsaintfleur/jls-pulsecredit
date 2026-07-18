import type { SeriesPoint } from "@/lib/types";

/**
 * Dependency-free SVG bar timeline of monthly complaint volume. Months that
 * contain a flagged anomaly (any product spiking beyond the z-score threshold)
 * are highlighted in amber; the rest are calm slate. Pure server component.
 * Accessible via role=img + aria-label; the flagged spikes are also enumerated
 * in the adjacent top-anomalies table.
 */
export function AnomalyTimeline({
  points,
  flagged,
  height = 220,
  ariaLabel,
}: {
  points: SeriesPoint[];
  flagged: Set<string>;
  height?: number;
  ariaLabel: string;
}) {
  const W = 760;
  const H = height;
  const m = { top: 14, right: 16, bottom: 30, left: 44 };
  const iw = W - m.left - m.right;
  const ih = H - m.top - m.bottom;

  const vals = points.map((p) => p.value);
  const yMax = Math.max(...vals) * 1.08;
  const yAt = (v: number) => m.top + ih - (v / yMax) * ih;

  const slot = iw / points.length;
  const bw = Math.max(1.5, slot * 0.7);

  const ticks = 3;
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => (yMax * i) / ticks);

  const labelEvery = Math.max(1, Math.round(points.length / 6));

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height={H}
      role="img"
      aria-label={ariaLabel}
      className="overflow-visible"
    >
      {yTicks.map((v, i) => (
        <g key={i}>
          <line x1={m.left} x2={W - m.right} y1={yAt(v)} y2={yAt(v)} stroke="#e2e8f0" strokeWidth={1} />
          <text x={m.left - 8} y={yAt(v) + 3} textAnchor="end" fontSize={10} fill="#94a3b8">
            {v >= 1000 ? `${Math.round(v / 1000)}k` : Math.round(v)}
          </text>
        </g>
      ))}

      {points.map((p, i) => {
        const x = m.left + i * slot + (slot - bw) / 2;
        const y = yAt(p.value);
        const isFlagged = flagged.has(p.date);
        return (
          <rect
            key={p.date}
            x={x}
            y={y}
            width={bw}
            height={m.top + ih - y}
            rx={1}
            fill={isFlagged ? "#d97706" : "#cbd5e1"}
          >
            <title>{`${p.date}: ${p.value.toLocaleString()} complaints${isFlagged ? " (flagged spike)" : ""}`}</title>
          </rect>
        );
      })}

      {points.map((p, i) =>
        i % labelEvery === 0 || i === points.length - 1 ? (
          <text
            key={`l${p.date}`}
            x={m.left + i * slot + slot / 2}
            y={H - 10}
            textAnchor="middle"
            fontSize={10}
            fill="#94a3b8"
          >
            {p.date.slice(0, 7)}
          </text>
        ) : null,
      )}
    </svg>
  );
}
