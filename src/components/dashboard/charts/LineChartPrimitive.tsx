"use client";

import { useState } from "react";

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
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const plotHeight = height - PADDING.top - PADDING.bottom;

  const allValues = series.flatMap((s) => s.values);
  const niceMax = niceCeiling(Math.max(1, ...allValues));
  const ticks = Array.from({ length: TICK_COUNT + 1 }, (_, i) => (niceMax / TICK_COUNT) * i);

  const xStep = labels.length > 1 ? plotWidth / (labels.length - 1) : 0;
  const xFor = (i: number) => PADDING.left + i * xStep;
  const yFor = (v: number) => PADDING.top + plotHeight - (v / niceMax) * plotHeight;
  const hitWidth = Math.max(xStep, plotWidth / Math.max(labels.length, 1));

  const format = yFormatter ?? ((v: number) => `${Math.round(v)}`);

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
      <svg viewBox={`0 0 ${WIDTH} ${height}`} className="h-auto w-full overflow-visible" role="img" aria-label="Line chart">
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={PADDING.left} x2={WIDTH - PADDING.right} y1={yFor(t)} y2={yFor(t)} stroke="var(--border)" strokeDasharray="4 4" />
            <text x={PADDING.left - 8} y={yFor(t)} textAnchor="end" dominantBaseline="middle" className="fill-muted-foreground text-[10px]">
              {format(t)}
            </text>
          </g>
        ))}
        {series.map((s) => {
          const d = s.values.map((v, i) => `${i === 0 ? "M" : "L"} ${xFor(i)} ${yFor(v)}`).join(" ");
          return (
            <path key={s.key} d={d} fill="none" stroke={s.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          );
        })}
        {labels.map((label, i) =>
          shouldShowLabel(i, labels.length) ? (
            <text key={i} x={xFor(i)} y={height - 6} textAnchor="middle" className="fill-muted-foreground text-[10px]">
              {label}
            </text>
          ) : null,
        )}
        {hoverIndex !== null ? (
          <>
            <line
              x1={xFor(hoverIndex)}
              x2={xFor(hoverIndex)}
              y1={PADDING.top}
              y2={height - PADDING.bottom}
              stroke="var(--border)"
            />
            {series.map((s) => (
              <circle
                key={`${s.key}-dot`}
                cx={xFor(hoverIndex)}
                cy={yFor(s.values[hoverIndex] ?? 0)}
                r={3.5}
                fill={s.color}
                stroke="var(--card)"
                strokeWidth={1.5}
              />
            ))}
          </>
        ) : null}
        {labels.map((_, i) => (
          <rect
            key={`hit-${i}`}
            x={xFor(i) - hitWidth / 2}
            y={PADDING.top}
            width={hitWidth}
            height={plotHeight}
            fill="transparent"
            onMouseEnter={() => setHoverIndex(i)}
            onMouseLeave={() => setHoverIndex((current) => (current === i ? null : current))}
          />
        ))}
      </svg>
      {hoverIndex !== null ? (
        <div
          className="pointer-events-none absolute z-10 min-w-max -translate-x-1/2 -translate-y-[calc(100%+8px)] rounded-md border border-border bg-popover px-2.5 py-1.5 text-overline"
          style={{ left: `${(xFor(hoverIndex) / WIDTH) * 100}%`, top: `${(yFor(Math.max(...series.map((s) => s.values[hoverIndex] ?? 0))) / height) * 100}%` }}
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
