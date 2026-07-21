import { GroupedBarChartPrimitive } from "@/components/dashboard/charts/GroupedBarChartPrimitive";
import { formatCompactNumber } from "@/components/dashboard/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { PlatformUsagePoint } from "@/lib/superAdminMockData";

type Props = { data: PlatformUsagePoint[] };

export function PlatformUsageChart({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Usage Trends</CardTitle>
        <CardDescription>Usage trends for core platform activities</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-10 text-center text-caption text-muted-foreground">
            No analytics data available.
          </p>
        ) : (
          <GroupedBarChartPrimitive
            labels={data.map((d) => d.label)}
            yFormatter={formatCompactNumber}
            series={[
              {
                key: "mockInterviews",
                label: "Mock Interviews",
                color: "var(--primary)",
                values: data.map((d) => d.mockInterviews),
              },
              {
                key: "storyboards",
                label: "Storyboards",
                color: "var(--extended-blue)",
                values: data.map((d) => d.storyboards),
              },
            ]}
          />
        )}
      </CardContent>
    </Card>
  );
}
