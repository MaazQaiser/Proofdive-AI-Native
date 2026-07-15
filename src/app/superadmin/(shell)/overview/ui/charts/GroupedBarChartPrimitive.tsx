import { niceCeiling, shouldShowLabel } from "./chartMath";

export type BarSeries = {
  key: string;
  label: string;
  color: string;
  values: number[];
};

type Props = {
  series: BarSeries[];
  labels: string[];
  height?: number;
  yFormatter?: (value: number) => string;
};

const WIDTH = 640;
const PADDING = { left: 44, right: 12, top: 12, bottom: 28 };
const TICK_COUNT = 4;

export function GroupedBarChartPrimitive({ series, labels, height = 220, yFormatter }: Props) {
  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const plotHeight = height - PADDING.top - PADDING.bottom;

  const allValues = series.flatMap((s) => s.values);
  const niceMax = niceCeiling(Math.max(1, ...allValues));
  const ticks = Array.from({ length: TICK_COUNT + 1 }, (_, i) => (niceMax / TICK_COUNT) * i);
  const yFor = (v: number) => PADDING.top + plotHeight - (v / niceMax) * plotHeight;
  const format = yFormatter ?? ((v: number) => `${Math.round(v)}`);

  const groupCount = Math.max(labels.length, 1);
  const groupWidth = plotWidth / groupCount;
  const groupPadding = groupWidth * 0.2;
  const barGap = 3;
  const barWidth = Math.max(
    (groupWidth - groupPadding * 2 - barGap * (series.length - 1)) / series.length,
    1,
  );

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
      <svg viewBox={`0 0 ${WIDTH} ${height}`} className="h-auto w-full" role="img" aria-label="Bar chart">
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
        {labels.map((label, groupIndex) => {
          const groupX = PADDING.left + groupIndex * groupWidth + groupPadding;
          return (
            <g key={groupIndex}>
              {series.map((s, seriesIndex) => {
                const value = s.values[groupIndex] ?? 0;
                const barY = yFor(value);
                const barHeight = Math.max(plotHeight - (barY - PADDING.top), 0);
                const x = groupX + seriesIndex * (barWidth + barGap);
                return (
                  <rect key={s.key} x={x} y={barY} width={barWidth} height={barHeight} rx={2} fill={s.color} />
                );
              })}
              {shouldShowLabel(groupIndex, labels.length) ? (
                <text
                  x={groupX + (groupWidth - groupPadding * 2) / 2}
                  y={height - 6}
                  textAnchor="middle"
                  className="fill-black/40 text-[10px]"
                >
                  {label}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
