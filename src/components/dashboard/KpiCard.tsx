import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Trend = { value: number; label?: string };

type Props = {
  label: string;
  value: string;
  icon?: LucideIcon;
  trend?: Trend;
  breakdown?: { label: string; value: number }[];
  isEmpty?: boolean;
  emptyMessage?: string;
};

export function KpiCard({
  label,
  value,
  icon: Icon,
  trend,
  breakdown,
  isEmpty,
  emptyMessage = "No analytics data available.",
}: Props) {
  return (
    <Card className="gap-0 py-5">
      <CardContent className="px-5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-overline uppercase text-muted-foreground">{label}</p>
          {Icon ? (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </span>
          ) : null}
        </div>
        {isEmpty ? (
          <p className="mt-3 text-caption text-muted-foreground">{emptyMessage}</p>
        ) : (
          <>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <p className="text-h4 tabular-nums text-foreground">{value}</p>
              {trend ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 text-overline font-medium",
                    trend.value >= 0 ? "text-scoring-green" : "text-scoring-red",
                  )}
                >
                  {trend.value >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {trend.value >= 0 ? "+" : ""}
                  {trend.value.toFixed(1)}%
                </span>
              ) : null}
            </div>
            {trend?.label ? (
              <p className="mt-0.5 text-overline text-muted-foreground">{trend.label}</p>
            ) : null}
            {breakdown && breakdown.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-overline text-muted-foreground">
                {breakdown.map((b) => (
                  <span key={b.label}>
                    {b.label}: <span className="font-medium text-foreground">{b.value}</span>
                  </span>
                ))}
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
