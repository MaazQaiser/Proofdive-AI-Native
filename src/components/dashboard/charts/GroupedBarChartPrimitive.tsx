"use client";

import { useState } from "react";

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
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

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
  const barWidth = Math.max((groupWidth - groupPadding * 2 - barGap * (series.length - 1)) / series.length, 1);

  return (
    <div className="relative w-full">
      <div className="mb-3 flex flex-wrap gap-4">
        {series.map((s) => (
          <div key={s.key} className="flex items-center gap-1.5 text-overline text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label}
          </div>
        ))}
      </div>
      <svg viewBox={`0 0 ${WIDTH} ${height}`} className="h-auto w-full overflow-visible" role="img" aria-label="Bar chart">
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={PADDING.left} x2={WIDTH - PADDING.right} y1={yFor(t)} y2={yFor(t)} stroke="var(--border)" strokeDasharray="4 4" />
            <text x={PADDING.left - 8} y={yFor(t)} textAnchor="end" dominantBaseline="middle" className="fill-muted-foreground text-[10px]">
              {format(t)}
            </text>
          </g>
        ))}
        {labels.map((label, groupIndex) => {
          const groupX = PADDING.left + groupIndex * groupWidth + groupPadding;
          const hovered = hoverIndex === groupIndex;
          return (
            <g key={groupIndex}>
              {hovered ? (
                <rect
                  x={PADDING.left + groupIndex * groupWidth}
                  y={PADDING.top}
                  width={groupWidth}
                  height={plotHeight}
                  fill="var(--muted)"
                  opacity={0.5}
                  rx={4}
                />
              ) : null}
              {series.map((s, seriesIndex) => {
                const value = s.values[groupIndex] ?? 0;
                const barY = yFor(value);
                const barHeight = Math.max(plotHeight - (barY - PADDING.top), 0);
                const x = groupX + seriesIndex * (barWidth + barGap);
                return <rect key={s.key} x={x} y={barY} width={barWidth} height={barHeight} rx={2} fill={s.color} />;
              })}
              {shouldShowLabel(groupIndex, labels.length) ? (
                <text
                  x={groupX + (groupWidth - groupPadding * 2) / 2}
                  y={height - 6}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[10px]"
                >
                  {label}
                </text>
              ) : null}
              <rect
                x={PADDING.left + groupIndex * groupWidth}
                y={PADDING.top}
                width={groupWidth}
                height={plotHeight}
                fill="transparent"
                onMouseEnter={() => setHoverIndex(groupIndex)}
                onMouseLeave={() => setHoverIndex((current) => (current === groupIndex ? null : current))}
              />
            </g>
          );
        })}
      </svg>
      {hoverIndex !== null ? (
        <div
          className="pointer-events-none absolute z-10 min-w-max -translate-x-1/2 -translate-y-[calc(100%+8px)] rounded-md border border-border bg-popover px-2.5 py-1.5 text-overline"
          style={{
            left: `${((PADDING.left + hoverIndex * groupWidth + groupWidth / 2) / WIDTH) * 100}%`,
            top: `${(yFor(Math.max(...series.map((s) => s.values[hoverIndex] ?? 0))) / height) * 100}%`,
          }}
        >
          <p className="font-medium text-foreground">{labels[hoverIndex]}</p>
          {series.map((s) => (
            <p key={s.key} className="flex items-center gap-1.5 text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.color }} />
              {s.label}: <span className="font-medium text-foreground">{format(s.values[hoverIndex] ?? 0)}</span>
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
