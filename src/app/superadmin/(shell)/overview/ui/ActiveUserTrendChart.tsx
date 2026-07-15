import { Card, CardBody } from "@/components/Card";
import type { ActiveUserPoint } from "@/lib/superAdminMockData";

import { GroupedBarChartPrimitive } from "./charts/GroupedBarChartPrimitive";
import { formatCompactNumber } from "./format";

type Props = { data: ActiveUserPoint[] };

export function ActiveUserTrendChart({ data }: Props) {
  return (
    <Card>
      <CardBody>
        <h2 className="text-base font-bold tracking-tight text-black">Active User Trend</h2>
        <p className="mt-0.5 text-sm text-[var(--app-muted)]">Platform engagement trends</p>
        <div className="mt-4">
          {data.length === 0 ? (
            <p className="py-10 text-center text-sm font-medium text-[var(--app-muted)]">
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
                  color: "#111827",
                  values: data.map((d) => d.active),
                },
                {
                  key: "inactive",
                  label: "Inactive Users",
                  color: "#d1d5db",
                  values: data.map((d) => d.inactive),
                },
              ]}
            />
          )}
        </div>
      </CardBody>
    </Card>
  );
}
