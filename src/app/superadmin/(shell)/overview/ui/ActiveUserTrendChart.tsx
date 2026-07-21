import { GroupedBarChartPrimitive } from "@/components/dashboard/charts/GroupedBarChartPrimitive";
import { formatCompactNumber } from "@/components/dashboard/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActiveUserPoint } from "@/lib/superAdminMockData";

type Props = { data: ActiveUserPoint[] };

export function ActiveUserTrendChart({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active User Trend</CardTitle>
        <CardDescription>Platform engagement trends</CardDescription>
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
              {
                key: "active",
                label: "Active Users",
                color: "var(--primary)",
                values: data.map((d) => d.active),
              },
              {
                key: "inactive",
                label: "Inactive Users",
                color: "var(--border)",
                values: data.map((d) => d.inactive),
              },
            ]}
          />
        )}
      </CardContent>
    </Card>
  );
}
