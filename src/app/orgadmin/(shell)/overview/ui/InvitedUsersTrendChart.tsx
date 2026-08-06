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
import type { InvitedUsersPoint } from "@/lib/orgAdminMockData";

type Props = { data: InvitedUsersPoint[] };

const SERIES = [
  { key: "total", label: "Total Invited", color: "var(--primary)" },
  { key: "active", label: "Active Users", color: "var(--scoring-green)" },
  { key: "inactive", label: "Inactive Users", color: "var(--border)" },
] as const;

export function InvitedUsersTrendChart({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Total Invited Users</CardTitle>
        <CardDescription>Organization-wide user invitation and engagement trends</CardDescription>
        <CardAction>
          <ChartLegend items={[...SERIES]} />
        </CardAction>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-10 text-center text-caption text-muted-foreground">No analytics data available.</p>
        ) : (
          <GroupedBarChartPrimitive
            labels={data.map((d) => d.label)}
            yFormatter={formatCompactNumber}
            series={[
              { ...SERIES[0], values: data.map((d) => d.total) },
              { ...SERIES[1], values: data.map((d) => d.active) },
              { ...SERIES[2], values: data.map((d) => d.inactive) },
            ]}
          />
        )}
      </CardContent>
    </Card>
  );
}
