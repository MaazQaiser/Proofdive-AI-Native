import { LineChartPrimitive } from "@/components/dashboard/charts/LineChartPrimitive";
import { formatCompactCurrencyFromCents } from "@/components/dashboard/format";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { RevenuePoint } from "@/lib/superAdminMockData";

type Props = { data: RevenuePoint[] };

export function RevenueAnalyticsChart({ data }: Props) {
  const latestGrowthPct = data.length > 0 ? data[data.length - 1].growthPct : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Analytics</CardTitle>
        <CardDescription>Subscription revenue trends</CardDescription>
        {latestGrowthPct !== null ? (
          <CardAction>
            <Badge
              variant="outline"
              className={
                latestGrowthPct >= 0
                  ? "border-scoring-green/25 bg-scoring-green/15 text-scoring-green-fg"
                  : "border-scoring-red/25 bg-scoring-red/15 text-scoring-red-fg"
              }
            >
              {latestGrowthPct >= 0 ? "+" : ""}
              {latestGrowthPct.toFixed(1)}% growth
            </Badge>
          </CardAction>
        ) : null}
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
