import { niceCeiling, shouldShowLabel } from "./chartMath";

export type LineSeries = {
  key: string;
  label: string;
  color: string;
  values: number[];
};

type Props = {
  series: LineSeries[];
  labels: string[];
  height?: number;
  yFormatter?: (value: number) => string;
};

const WIDTH = 640;
const PADDING = { left: 44, right: 12, top: 12, bottom: 28 };
const TICK_COUNT = 4;

export function LineChartPrimitive({ series, labels, height = 220, yFormatter }: Props) {
  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const plotHeight = height - PADDING.top - PADDING.bottom;

  const allValues = series.flatMap((s) => s.values);
  const niceMax = niceCeiling(Math.max(1, ...allValues));
  const ticks = Array.from({ length: TICK_COUNT + 1 }, (_, i) => (niceMax / TICK_COUNT) * i);

  const xStep = labels.length > 1 ? plotWidth / (labels.length - 1) : 0;
  const xFor = (i: number) => PADDING.left + i * xStep;
  const yFor = (v: number) => PADDING.top + plotHeight - (v / niceMax) * plotHeight;

  const format = yFormatter ?? ((v: number) => `${Math.round(v)}`);

  return (
    <div className="w-full">
      <div className="mb-3 flex flex-wrap gap-4">
        {series.map((s) => (
          <div
            key={s.key}
            className="flex items-center gap-1.5 text-xs font-semibold text-[var(--app-muted)]"
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label}
          </div>
        ))}
      </div>
      <svg viewBox={`0 0 ${WIDTH} ${height}`} className="h-auto w-full" role="img" aria-label="Line chart">
        {ticks.map((t, i) => (
          <g key={i}>
            <line
              x1={PADDING.left}
              x2={WIDTH - PADDING.right}
              y1={yFor(t)}
              y2={yFor(t)}
              stroke="var(--app-hairline)"
              strokeDasharray="4 4"
            />
            <text x={PADDING.left - 8} y={yFor(t)} textAnchor="end" dominantBaseline="middle" className="fill-black/40 text-[10px]">
              {format(t)}
            </text>
          </g>
        ))}
        {series.map((s) => {
          const d = s.values
            .map((v, i) => `${i === 0 ? "M" : "L"} ${xFor(i)} ${yFor(v)}`)
            .join(" ");
          return (
            <path key={s.key} d={d} fill="none" stroke={s.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          );
        })}
        {labels.map((label, i) =>
          shouldShowLabel(i, labels.length) ? (
            <text key={i} x={xFor(i)} y={height - 6} textAnchor="middle" className="fill-black/40 text-[10px]">
              {label}
            </text>
          ) : null,
        )}
      </svg>
    </div>
  );
}
