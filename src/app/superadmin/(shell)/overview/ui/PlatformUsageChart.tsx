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
import type { PlatformUsagePoint } from "@/lib/superAdminMockData";

type Props = { data: PlatformUsagePoint[] };

const SERIES = [
  { key: "mockInterviews", label: "Mock Interviews", color: "var(--primary)" },
  { key: "storyboards", label: "Storyboards", color: "var(--extended-blue)" },
] as const;

export function PlatformUsageChart({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Usage Trends</CardTitle>
        <CardDescription>Usage trends for core platform activities</CardDescription>
        <CardAction>
          <ChartLegend items={[...SERIES]} />
        </CardAction>
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
              { ...SERIES[0], values: data.map((d) => d.mockInterviews) },
              { ...SERIES[1], values: data.map((d) => d.storyboards) },
            ]}
          />
        )}
      </CardContent>
    </Card>
  );
}
