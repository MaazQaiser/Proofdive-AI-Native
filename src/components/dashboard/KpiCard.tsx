import type { ReactNode } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";

type Trend = { value: number; label?: string };

type Props = {
  label: string;
  value: string;
  trend?: Trend;
  isEmpty?: boolean;
  emptyMessage?: string;
  className?: string;
};

export function KpiRow({
  children,
  className,
  banded = false,
}: {
  children: ReactNode;
  className?: string;
  /** Full-bleed top/bottom rules — use on padded overview layouts. */
  banded?: boolean;
}) {
  if (banded) {
    return (
      <div className={cn("-mx-6 border-y border-border px-6", className)}>
        <div className="flex flex-wrap items-stretch">{children}</div>
      </div>
    );
  }

  return <div className={cn("flex flex-wrap items-stretch", className)}>{children}</div>;
}

export function KpiCard({
  label,
  value,
  trend,
  isEmpty,
  emptyMessage = "No analytics data available.",
  className,
}: Props) {
  const trendDirection = !trend
    ? null
    : trend.value > 0
      ? "up"
      : trend.value < 0
        ? "down"
        : "flat";
  const trendAbs = trend ? Math.abs(trend.value).toFixed(1) : null;

  return (
    <div
      className={cn(
        "min-w-[140px] flex-1 self-stretch px-6 py-5 first:pl-0 last:pr-0 [&:not(:first-child)]:border-l [&:not(:first-child)]:border-border",
        className,
      )}
    >
      <p className="text-caption font-medium text-muted-foreground">{label}</p>
      {isEmpty ? (
        <p className="mt-1 text-caption text-muted-foreground">{emptyMessage}</p>
      ) : (
        <>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <p className="font-gilroy text-h3 tabular-nums text-extended-dark-cyan">{value}</p>
            {trend && trendDirection && trendAbs ? (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 text-overline font-medium",
                  trendDirection === "up" && "text-trend-up",
                  trendDirection === "down" && "text-trend-down",
                  trendDirection === "flat" && "text-muted-foreground",
                )}
                aria-label={`${
                  trendDirection === "up" ? "Up" : trendDirection === "down" ? "Down" : "Unchanged"
                } ${trendAbs} percent${trend.label ? ` ${trend.label}` : ""}`}
              >
                {trendDirection === "up" ? (
                  <TrendingUp className="h-3 w-3" aria-hidden />
                ) : trendDirection === "down" ? (
                  <TrendingDown className="h-3 w-3" aria-hidden />
                ) : null}
                {trendDirection === "up" ? "+" : trendDirection === "down" ? "−" : ""}
                {trendAbs}%
              </span>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
