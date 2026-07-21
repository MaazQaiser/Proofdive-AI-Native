import { GroupedBarChartPrimitive } from "@/components/dashboard/charts/GroupedBarChartPrimitive";
import { formatCompactNumber } from "@/components/dashboard/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { InvitedUsersPoint } from "@/lib/orgAdminMockData";

type Props = { data: InvitedUsersPoint[] };

export function InvitedUsersTrendChart({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Total Invited Users</CardTitle>
        <CardDescription>Organization-wide user invitation and engagement trends</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-10 text-center text-caption text-muted-foreground">No analytics data available.</p>
        ) : (
          <GroupedBarChartPrimitive
            labels={data.map((d) => d.label)}
            yFormatter={formatCompactNumber}
            series={[
              { key: "total", label: "Total Invited", color: "var(--primary)", values: data.map((d) => d.total) },
              { key: "active", label: "Active Users", color: "var(--scoring-green)", values: data.map((d) => d.active) },
              { key: "inactive", label: "Inactive Users", color: "var(--border)", values: data.map((d) => d.inactive) },
            ]}
          />
        )}
      </CardContent>
    </Card>
  );
}
