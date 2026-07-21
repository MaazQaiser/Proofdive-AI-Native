import { LineChartPrimitive } from "@/components/dashboard/charts/LineChartPrimitive";
import { formatCompactCurrencyFromCents } from "@/components/dashboard/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RevenuePoint } from "@/lib/superAdminMockData";

type Props = { data: RevenuePoint[] };

export function RevenueAnalyticsChart({ data }: Props) {
  const latestGrowthPct = data.length > 0 ? data[data.length - 1].growthPct : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle>Revenue Analytics</CardTitle>
            <CardDescription>Subscription revenue trends</CardDescription>
          </div>
          {latestGrowthPct !== null ? (
            <Badge
              variant="outline"
              className={
                latestGrowthPct >= 0
                  ? "border-scoring-green/20 bg-scoring-green/10 text-scoring-green"
                  : "border-scoring-red/20 bg-scoring-red/10 text-scoring-red"
              }
            >
              {latestGrowthPct >= 0 ? "+" : ""}
              {latestGrowthPct.toFixed(1)}% growth
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-10 text-center text-caption text-muted-foreground">Revenue data unavailable.</p>
        ) : (
          <LineChartPrimitive
            labels={data.map((d) => d.label)}
            yFormatter={formatCompactCurrencyFromCents}
            series={[
              {
                key: "mrr",
                label: "MRR",
                color: "var(--primary)",
                values: data.map((d) => d.mrrCents),
              },
            ]}
          />
        )}
      </CardContent>
    </Card>
  );
}
