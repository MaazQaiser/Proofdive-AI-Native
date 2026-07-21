import { DonutChartPrimitive } from "@/components/dashboard/charts/DonutChartPrimitive";
import { formatNumber } from "@/components/dashboard/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SubscriptionModuleUsage } from "@/lib/orgAdminMockData";

type Props = { data: SubscriptionModuleUsage[] };

const MODULE_COLORS = ["var(--primary)", "var(--extended-blue)", "var(--scoring-yellow)", "var(--scoring-cyan)"];

export function SubscriptionPlanChart({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Plan Overview</CardTitle>
        <CardDescription>Real-time usage consumption against your purchased plan</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-10 text-center text-caption text-muted-foreground">Subscription usage data unavailable.</p>
        ) : (
          <DonutChartPrimitive
            modules={data.map((m, i) => ({ ...m, color: MODULE_COLORS[i % MODULE_COLORS.length] }))}
            valueFormatter={formatNumber}
          />
        )}
      </CardContent>
    </Card>
  );
}
