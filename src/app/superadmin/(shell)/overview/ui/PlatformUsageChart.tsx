import { Card, CardBody } from "@/components/Card";
import type { PlatformUsagePoint } from "@/lib/superAdminMockData";

import { GroupedBarChartPrimitive } from "./charts/GroupedBarChartPrimitive";
import { formatCompactNumber } from "./format";

type Props = { data: PlatformUsagePoint[] };

export function PlatformUsageChart({ data }: Props) {
  return (
    <Card>
      <CardBody>
        <h2 className="text-h6 text-black">Platform Usage Trends</h2>
        <p className="mt-0.5 text-caption text-[var(--app-muted)]">Usage trends for core platform activities</p>
        <div className="mt-4">
          {data.length === 0 ? (
            <p className="py-10 text-center text-caption text-[var(--app-muted)]">
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
                  color: "#111827",
                  values: data.map((d) => d.mockInterviews),
                },
                {
                  key: "storyboards",
                  label: "Storyboards",
                  color: "#2563eb",
                  values: data.map((d) => d.storyboards),
                },
              ]}
            />
          )}
        </div>
      </CardBody>
    </Card>
  );
}
