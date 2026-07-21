import { LineChartPrimitive } from "@/components/dashboard/charts/LineChartPrimitive";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TenantGrowthPoint } from "@/lib/superAdminMockData";

type Props = { data: TenantGrowthPoint[] };

const COLORS = {
  universities: "var(--primary)",
  trainingCenters: "var(--extended-blue)",
  employers: "var(--scoring-yellow)",
};

export function TenantGrowthChart({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tenant Growth Analytics</CardTitle>
        <CardDescription>Onboarding trends across the platform</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-10 text-center text-caption text-muted-foreground">
            No analytics data available.
          </p>
        ) : (
          <LineChartPrimitive
            labels={data.map((d) => d.label)}
            series={[
              {
                key: "universities",
                label: "Universities",
                color: COLORS.universities,
                values: data.map((d) => d.universities),
              },
              {
                key: "trainingCenters",
                label: "Training Centers",
                color: COLORS.trainingCenters,
                values: data.map((d) => d.trainingCenters),
              },
              {
                key: "employers",
                label: "Employers",
                color: COLORS.employers,
                values: data.map((d) => d.employers),
              },
            ]}
          />
        )}
      </CardContent>
    </Card>
  );
}
