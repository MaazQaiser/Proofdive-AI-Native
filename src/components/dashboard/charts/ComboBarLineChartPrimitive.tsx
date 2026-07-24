"use client";

import { useState } from "react";

import { niceCeiling, shouldShowLabel } from "./chartMath";

type BarSeries = { key: string; label: string; color: string; values: number[] };
type LineSeries = { key: string; label: string; color: string; values: number[] };

type Props = {
  labels: string[];
  bar: BarSeries;
  line: LineSeries;
  lineMax?: number;
  height?: number;
  barYFormatter?: (value: number) => string;
  lineYFormatter?: (value: number) => string;
};

const WIDTH = 640;
const PADDING = { left: 44, right: 44, top: 12, bottom: 28 };
const TICK_COUNT = 4;

export function ComboBarLineChartPrimitive({
  labels,
  bar,
  line,
  lineMax = 5,
  height = 240,
  barYFormatter,
  lineYFormatter,
}: Props) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const plotHeight = height - PADDING.top - PADDING.bottom;

  const barMax = niceCeiling(Math.max(1, ...bar.values));
  const barTicks = Array.from({ length: TICK_COUNT + 1 }, (_, i) => (barMax / TICK_COUNT) * i);
  const lineTicks = Array.from({ length: TICK_COUNT + 1 }, (_, i) => (lineMax / TICK_COUNT) * i);

  const formatBar = barYFormatter ?? ((v: number) => `${Math.round(v)}`);
  const formatLine = lineYFormatter ?? ((v: number) => v.toFixed(1));

  const yForBar = (v: number) => PADDING.top + plotHeight - (v / barMax) * plotHeight;
  const yForLine = (v: number) => PADDING.top + plotHeight - (v / lineMax) * plotHeight;

  const groupCount = Math.max(labels.length, 1);
  const groupWidth = plotWidth / groupCount;
  const barWidth = groupWidth * 0.4;

  const xStep = labels.length > 1 ? plotWidth / (labels.length - 1) : 0;
  const xForLine = (i: number) => PADDING.left + i * xStep;

  return (
    <div className="relative w-full">
      <div className="mb-3 flex flex-wrap gap-4">
        {[bar, line].map((s) => (
          <div key={s.key} className="flex items-center gap-1.5 text-overline text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label}
          </div>
        ))}
      </div>
      <svg viewBox={`0 0 ${WIDTH} ${height}`} className="h-auto w-full overflow-visible" role="img" aria-label="Combo bar and line chart">
        {barTicks.map((t, i) => (
          <g key={`grid-${i}`}>
            <line x1={PADDING.left} x2={WIDTH - PADDING.right} y1={yForBar(t)} y2={yForBar(t)} stroke="var(--border)" strokeDasharray="4 4" />
            <text x={PADDING.left - 8} y={yForBar(t)} textAnchor="end" dominantBaseline="middle" className="fill-muted-foreground text-[10px]">
              {formatBar(t)}
            </text>
          </g>
        ))}
        {lineTicks.map((t, i) => (
          <text
            key={`right-tick-${i}`}
            x={WIDTH - PADDING.right + 8}
            y={yForLine(t)}
            textAnchor="start"
            dominantBaseline="middle"
            className="fill-muted-foreground text-[10px]"
          >
            {formatLine(t)}
          </text>
        ))}
        {labels.map((label, i) => {
          const value = bar.values[i] ?? 0;
          const barY = yForBar(value);
          const barX = PADDING.left + i * groupWidth + (groupWidth - barWidth) / 2;
          return (
            <g key={i}>
              {hoverIndex === i ? (
                <rect x={PADDING.left + i * groupWidth} y={PADDING.top} width={groupWidth} height={plotHeight} fill="var(--muted)" opacity={0.5} />
              ) : null}
              <rect x={barX} y={barY} width={barWidth} height={Math.max(plotHeight - (barY - PADDING.top), 0)} rx={2} fill={bar.color} />
              {shouldShowLabel(i, labels.length) ? (
                <text x={PADDING.left + i * groupWidth + groupWidth / 2} y={height - 6} textAnchor="middle" className="fill-muted-foreground text-[10px]">
                  {label}
                </text>
              ) : null}
            </g>
          );
        })}
        <path
          d={line.values.map((v, i) => `${i === 0 ? "M" : "L"} ${xForLine(i)} ${yForLine(v)}`).join(" ")}
          fill="none"
          stroke={line.color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {line.values.map((v, i) => (
          <circle key={`dot-${i}`} cx={xForLine(i)} cy={yForLine(v)} r={hoverIndex === i ? 4 : 2.5} fill={line.color} stroke="var(--card)" strokeWidth={1.5} />
        ))}
        {labels.map((_, i) => (
          <rect
            key={`hit-${i}`}
            x={PADDING.left + i * groupWidth}
            y={PADDING.top}
            width={groupWidth}
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
          style={{
            left: `${((PADDING.left + hoverIndex * groupWidth + groupWidth / 2) / WIDTH) * 100}%`,
            top: `${(Math.min(yForBar(bar.values[hoverIndex] ?? 0), yForLine(line.values[hoverIndex] ?? 0)) / height) * 100}%`,
          }}
        >
          <p className="font-medium text-foreground">{labels[hoverIndex]}</p>
          <p className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: bar.color }} />
            {bar.label}: <span className="font-medium text-foreground">{formatBar(bar.values[hoverIndex] ?? 0)}</span>
          </p>
          <p className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: line.color }} />
            {line.label}: <span className="font-medium text-foreground">{formatLine(line.values[hoverIndex] ?? 0)}</span>
          </p>
        </div>
      ) : null}
    </div>
  );
}
