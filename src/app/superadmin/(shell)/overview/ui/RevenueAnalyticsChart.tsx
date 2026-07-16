import { Card, CardBody } from "@/components/Card";
import { cn } from "@/components/cn";
import type { RevenuePoint } from "@/lib/superAdminMockData";

import { LineChartPrimitive } from "./charts/LineChartPrimitive";
import { formatCompactCurrencyFromCents } from "./format";

type Props = { data: RevenuePoint[] };

export function RevenueAnalyticsChart({ data }: Props) {
  const latestGrowthPct = data.length > 0 ? data[data.length - 1].growthPct : null;

  return (
    <Card>
      <CardBody>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-h6 text-black">Revenue Analytics</h2>
            <p className="mt-0.5 text-caption text-[var(--app-muted)]">Subscription revenue trends</p>
          </div>
          {latestGrowthPct !== null ? (
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-overline",
                latestGrowthPct >= 0
                  ? "border border-emerald-500/20 bg-emerald-500/15 text-emerald-900"
                  : "border border-rose-500/20 bg-rose-500/15 text-rose-900",
              )}
            >
              {latestGrowthPct >= 0 ? "+" : ""}
              {latestGrowthPct.toFixed(1)}% growth
            </span>
          ) : null}
        </div>
        <div className="mt-4">
          {data.length === 0 ? (
            <p className="py-10 text-center text-caption text-[var(--app-muted)]">
              Revenue data unavailable.
            </p>
          ) : (
            <LineChartPrimitive
              labels={data.map((d) => d.label)}
              yFormatter={formatCompactCurrencyFromCents}
              series={[
                {
                  key: "mrr",
                  label: "MRR",
                  color: "#111827",
                  values: data.map((d) => d.mrrCents),
                },
              ]}
            />
          )}
        </div>
      </CardBody>
    </Card>
  );
}
