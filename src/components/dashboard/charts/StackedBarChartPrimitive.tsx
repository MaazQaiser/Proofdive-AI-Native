"use client";

import { useState } from "react";

import { shouldShowLabel } from "./chartMath";

export type StackedBarSeries = {
  key: string;
  label: string;
  color: string;
  /** Values for this series per label, expected to sum to ~100 across series at each index. */
  values: number[];
};

type Props = {
  series: StackedBarSeries[];
  labels: string[];
  height?: number;
  yFormatter?: (value: number) => string;
};

const WIDTH = 640;
const PADDING = { left: 40, right: 12, top: 12, bottom: 28 };
const TICK_COUNT = 4;
const MAX = 100;

export function StackedBarChartPrimitive({ series, labels, height = 220, yFormatter }: Props) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const plotHeight = height - PADDING.top - PADDING.bottom;
  const format = yFormatter ?? ((v: number) => `${Math.round(v)}%`);

  const ticks = Array.from({ length: TICK_COUNT + 1 }, (_, i) => (MAX / TICK_COUNT) * i);
  const yFor = (v: number) => PADDING.top + plotHeight - (v / MAX) * plotHeight;

  const groupCount = Math.max(labels.length, 1);
  const groupWidth = plotWidth / groupCount;
  const barWidth = groupWidth * 0.56;

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
      <svg viewBox={`0 0 ${WIDTH} ${height}`} className="h-auto w-full overflow-visible" role="img" aria-label="Stacked bar chart">
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={PADDING.left} x2={WIDTH - PADDING.right} y1={yFor(t)} y2={yFor(t)} stroke="var(--border)" strokeDasharray="4 4" />
            <text x={PADDING.left - 8} y={yFor(t)} textAnchor="end" dominantBaseline="middle" className="fill-muted-foreground text-[10px]">
              {format(t)}
            </text>
          </g>
        ))}
        {labels.map((label, groupIndex) => {
          const groupX = PADDING.left + groupIndex * groupWidth + (groupWidth - barWidth) / 2;
          let stackTop = MAX;
          return (
            <g key={groupIndex}>
              {series.map((s) => {
                const value = s.values[groupIndex] ?? 0;
                const yTop = yFor(stackTop);
                const yBottom = yFor(stackTop - value);
                stackTop -= value;
                return (
                  <rect
                    key={s.key}
                    x={groupX}
                    y={yTop}
                    width={barWidth}
                    height={Math.max(yBottom - yTop, 0)}
                    fill={s.color}
                    opacity={hoverIndex !== null && hoverIndex !== groupIndex ? 0.45 : 1}
                  />
                );
              })}
              {shouldShowLabel(groupIndex, labels.length) ? (
                <text x={groupX + barWidth / 2} y={height - 6} textAnchor="middle" className="fill-muted-foreground text-[10px]">
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
            top: `${(PADDING.top / height) * 100}%`,
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
