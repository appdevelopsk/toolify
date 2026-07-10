/**
 * Dependency-free inline SVG chart for yearly financial projections.
 * Two modes:
 *  - stacked: stacked areas (e.g. contributions vs interest build-up)
 *  - lines:   up to 3 comparison lines (e.g. with fees vs without fees)
 * Colors follow the validated categorical palette (slot order fixed:
 * blue, aqua, yellow) with dark-mode steps; identity is never color-alone —
 * a legend renders whenever there are 2+ series, and every point exposes a
 * native tooltip via <title>.
 */

export interface TrendSeries {
  label: string;
  /** One value per xLabels entry. */
  values: number[];
}

interface Props {
  /** Accessible title announced for the whole chart. */
  title: string;
  xLabels: string[];
  series: TrendSeries[];
  stacked?: boolean;
  formatValue: (v: number) => string;
}

// Fixed categorical slot order (light / dark steps of the same hue).
const SLOTS = [
  { fill: "fill-[#2a78d6] dark:fill-[#3987e5]", stroke: "stroke-[#2a78d6] dark:stroke-[#3987e5]", swatch: "bg-[#2a78d6] dark:bg-[#3987e5]" },
  { fill: "fill-[#1baf7a] dark:fill-[#199e70]", stroke: "stroke-[#1baf7a] dark:stroke-[#199e70]", swatch: "bg-[#1baf7a] dark:bg-[#199e70]" },
  { fill: "fill-[#eda100] dark:fill-[#c98500]", stroke: "stroke-[#eda100] dark:stroke-[#c98500]", swatch: "bg-[#eda100] dark:bg-[#c98500]" },
];

const W = 640;
const H = 260;
const PAD = { top: 20, right: 12, bottom: 24, left: 12 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

/** Round up to a "nice" axis maximum (1/2/2.5/5 × 10^k). */
function niceMax(v: number): number {
  if (v <= 0) return 1;
  const exp = Math.floor(Math.log10(v));
  const base = Math.pow(10, exp);
  for (const m of [1, 2, 2.5, 5, 10]) {
    if (v <= m * base) return m * base;
  }
  return 10 * base;
}

export function TrendChartSvg({ title, xLabels, series, stacked = false, formatValue }: Props) {
  const n = xLabels.length;
  if (n < 2 || series.length === 0 || series.some((s) => s.values.length !== n)) return null;

  const totals = stacked
    ? xLabels.map((_, i) => series.reduce((sum, s) => sum + s.values[i]!, 0))
    : xLabels.map((_, i) => Math.max(...series.map((s) => s.values[i]!)));
  const max = niceMax(Math.max(...totals));

  const x = (i: number) => PAD.left + (i / (n - 1)) * PLOT_W;
  const y = (v: number) => PAD.top + PLOT_H - (Math.min(v, max) / max) * PLOT_H;

  // Cumulative stacks (series[0] at the bottom).
  const cums: number[][] = [];
  if (stacked) {
    let prev = new Array<number>(n).fill(0);
    for (const s of series) {
      const cum = s.values.map((v, i) => prev[i]! + v);
      cums.push(cum);
      prev = cum;
    }
  }

  const gridTicks = [0.25, 0.5, 0.75, 1].map((f) => f * max);
  // Show at most ~6 x labels: always first and last.
  const xStep = Math.max(1, Math.ceil((n - 1) / 5));

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title} className="h-auto w-full">
        <title>{title}</title>
        {/* gridlines (labels are drawn after the series so they stay legible on top of fills) */}
        {gridTicks.map((v) => (
          <line key={v} x1={PAD.left} x2={W - PAD.right} y1={y(v)} y2={y(v)} className="stroke-slate-200 dark:stroke-slate-800" strokeWidth={1} />
        ))}

        {stacked
          ? series.map((s, si) => {
              const lower = si === 0 ? new Array<number>(n).fill(0) : cums[si - 1]!;
              const upper = cums[si]!;
              const pts = [
                ...upper.map((v, i) => `${x(i)},${y(v)}`),
                ...lower.map((v, i) => `${x(n - 1 - i)},${y(lower[n - 1 - i]!)}`),
              ].join(" ");
              return (
                <g key={s.label}>
                  <polygon points={pts} className={SLOTS[si % SLOTS.length]!.fill} fillOpacity={0.9} />
                  {/* 2px surface gap between stacked fills */}
                  {si > 0 && (
                    <polyline
                      points={lower.map((v, i) => `${x(i)},${y(v)}`).join(" ")}
                      fill="none"
                      strokeWidth={2}
                      className="stroke-white dark:stroke-slate-900"
                    />
                  )}
                </g>
              );
            })
          : series.map((s, si) => (
              <g key={s.label}>
                <polyline
                  points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")}
                  fill="none"
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  className={SLOTS[si % SLOTS.length]!.stroke}
                />
                <circle cx={x(n - 1)} cy={y(s.values[n - 1]!)} r={3.5} className={SLOTS[si % SLOTS.length]!.fill} />
              </g>
            ))}

        {/* baseline */}
        <line x1={PAD.left} x2={W - PAD.right} y1={y(0)} y2={y(0)} className="stroke-slate-300 dark:stroke-slate-700" strokeWidth={1} />

        {/* y tick labels on top of the fills, with a surface-colored halo for legibility */}
        {gridTicks.map((v) => (
          <text
            key={v}
            x={PAD.left}
            y={y(v) - 3}
            className="fill-slate-500 stroke-white dark:fill-slate-400 dark:stroke-slate-900 tabular-nums"
            strokeWidth={3}
            paintOrder="stroke"
            fontSize={10}
          >
            {formatValue(v)}
          </text>
        ))}

        {/* x tick labels */}
        {xLabels.map((label, i) =>
          i % xStep === 0 || i === n - 1 ? (
            <text
              key={i}
              x={x(i)}
              y={H - 8}
              textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"}
              className="fill-slate-500 tabular-nums"
              fontSize={10}
            >
              {label}
            </text>
          ) : null,
        )}

        {/* invisible hover targets with native tooltips */}
        {xLabels.map((label, i) => (
          <rect
            key={i}
            x={i === 0 ? PAD.left : x(i) - PLOT_W / (n - 1) / 2}
            y={PAD.top}
            width={PLOT_W / (n - 1)}
            height={PLOT_H}
            fill="transparent"
          >
            <title>{`${label} — ${series.map((s) => `${s.label}: ${formatValue(s.values[i]!)}`).join(" · ")}`}</title>
          </rect>
        ))}
      </svg>

      {series.length >= 2 && (
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {series.map((s, si) => (
            <li key={s.label} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              <span aria-hidden className={`h-2.5 w-2.5 rounded-sm ${SLOTS[si % SLOTS.length]!.swatch}`} />
              {s.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
