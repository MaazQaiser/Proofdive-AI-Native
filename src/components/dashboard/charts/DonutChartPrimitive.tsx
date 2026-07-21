"use client";

import { useState } from "react";

import { describeArc, polarToCartesian } from "./chartMath";

export type DonutModule = {
  key: string;
  label: string;
  color: string;
  allocated: number;
  used: number;
};

type Props = {
  modules: DonutModule[];
  size?: number;
  valueFormatter?: (value: number) => string;
};

const STROKE_WIDTH = 34;
const GAP_DEG = 4;

/** Segmented ring (rounded caps, gaps between segments) sized by each module's share of total usage, with value|% labels outside the ring — inspired by a reference "distribution donut" design. */
export function DonutChartPrimitive({ modules, size = 320, valueFormatter }: Props) {
  const [hoverKey, setHoverKey] = useState<string | null>(null);

  const format = valueFormatter ?? ((v: number) => `${Math.round(v)}`);
  const totalAllocated = modules.reduce((sum, m) => sum + m.allocated, 0);
  const totalUsed = modules.reduce((sum, m) => sum + m.used, 0);
  const totalRemaining = Math.max(totalAllocated - totalUsed, 0);

  const cx = size / 2;
  const cy = size / 2;
  const ringRadius = size / 2 - STROKE_WIDTH / 2 - 36;
  const labelRadius = ringRadius + STROKE_WIDTH / 2 + 30;
  const tooltipRadius = labelRadius + 46;

  const shares = modules.map((m) => (totalUsed > 0 ? m.used / totalUsed : 0));
  const arcs = modules.map((m, i) => {
    const previousEnd = shares.slice(0, i).reduce((sum, share) => sum + share * 360, 0);
    const sweep = shares[i] * 360;
    const start = previousEnd + GAP_DEG / 2;
    const end = previousEnd + Math.max(sweep - GAP_DEG / 2, GAP_DEG / 2);
    const midAngle = (start + end) / 2;
    const pct = totalUsed > 0 ? Math.round((m.used / totalUsed) * 100) : 0;
    return { module: m, start, end, midAngle, pct };
  });

  const hoveredArc = arcs.find((arc) => arc.module.key === hoverKey) ?? null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-caption">
        {modules.map((m) => (
          <span key={m.key} className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ backgroundColor: m.color }} />
            {m.label}
          </span>
        ))}
      </div>

      <div className="relative mx-auto" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label="Subscription usage donut">
          {arcs.map(({ module: m, start, end }) => (
            <path
              key={m.key}
              d={describeArc(cx, cy, ringRadius, start, end)}
              fill="none"
              stroke={m.color}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
              opacity={hoverKey && hoverKey !== m.key ? 0.4 : 1}
              onMouseEnter={() => setHoverKey(m.key)}
              onMouseLeave={() => setHoverKey((current) => (current === m.key ? null : current))}
              className="cursor-pointer transition-opacity"
            />
          ))}
        </svg>
        {arcs.map(({ module: m, midAngle, pct }) => {
          const point = polarToCartesian(cx, cy, labelRadius, midAngle);
          return (
            <div
              key={m.key}
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-nowrap text-caption"
              style={{ left: `${(point.x / size) * 100}%`, top: `${(point.y / size) * 100}%` }}
            >
              <span className="font-semibold text-foreground">{format(m.used)}</span>{" "}
              <span className="text-muted-foreground">|</span>{" "}
              <span className="font-semibold" style={{ color: m.color }}>
                {pct}%
              </span>
            </div>
          );
        })}
        {hoveredArc ? (
          (() => {
            const remaining = Math.max(hoveredArc.module.allocated - hoveredArc.module.used, 0);
            const point = polarToCartesian(cx, cy, tooltipRadius, hoveredArc.midAngle);
            return (
              <div
                className="pointer-events-none absolute z-10 min-w-max -translate-x-1/2 -translate-y-1/2 rounded-md border border-border bg-popover px-2.5 py-1.5 text-overline shadow-md"
                style={{ left: `${(point.x / size) * 100}%`, top: `${(point.y / size) * 100}%` }}
              >
                <p className="font-medium text-foreground">{hoveredArc.module.label}</p>
                <p className="text-muted-foreground">
                  Allocated: <span className="font-medium text-foreground">{format(hoveredArc.module.allocated)}</span>
                </p>
                <p className="text-muted-foreground">
                  Used: <span className="font-medium text-foreground">{format(hoveredArc.module.used)}</span>
                </p>
                <p className="text-muted-foreground">
                  Remaining: <span className="font-medium text-foreground">{format(remaining)}</span>
                </p>
              </div>
            );
          })()
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-border pt-3 text-caption text-muted-foreground">
        <span>
          Total Usage Limit: <span className="font-medium text-foreground">{format(totalAllocated)}</span>
        </span>
        <span>
          Usage Consumed: <span className="font-medium text-foreground">{format(totalUsed)}</span>
        </span>
        <span>
          Remaining Usage: <span className="font-medium text-foreground">{format(totalRemaining)}</span>
        </span>
      </div>
    </div>
  );
}
