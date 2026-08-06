import { ChartLegend } from "@/components/dashboard/charts/ChartLegend";
import { GroupedBarChartPrimitive } from "@/components/dashboard/charts/GroupedBarChartPrimitive";
import { formatCompactNumber } from "@/components/dashboard/format";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ActiveUserPoint } from "@/lib/superAdminMockData";

type Props = { data: ActiveUserPoint[] };

const SERIES = [
  { key: "active", label: "Active Users", color: "var(--primary)" },
  { key: "inactive", label: "Inactive Users", color: "var(--border)" },
] as const;

export function ActiveUserTrendChart({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active User Trend</CardTitle>
        <CardDescription>Platform engagement trends</CardDescription>
        <CardAction>
          <ChartLegend items={[...SERIES]} />
        </CardAction>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-10 text-center text-caption text-muted-foreground">
            No activity found for selected date range.
          </p>
        ) : (
          <GroupedBarChartPrimitive
            labels={data.map((d) => d.label)}
            yFormatter={formatCompactNumber}
            series={[
              { ...SERIES[0], values: data.map((d) => d.active) },
              { ...SERIES[1], values: data.map((d) => d.inactive) },
            ]}
          />
        )}
      </CardContent>
    </Card>
  );
}
