import { StackedBarChartPrimitive } from "@/components/dashboard/charts/StackedBarChartPrimitive";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { OrganizationReadinessPoint } from "@/lib/orgAdminMockData";

type Props = { data: OrganizationReadinessPoint[] };

export function OrganizationReadinessChart({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Readiness Overview</CardTitle>
        <CardDescription>Overall readiness distribution across the organization</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-10 text-center text-caption text-muted-foreground">No data found for selected date range.</p>
        ) : (
          <StackedBarChartPrimitive
            labels={data.map((d) => d.label)}
            series={[
              { key: "ready", label: "Ready (4.5–5.0)", color: "var(--scoring-green)", values: data.map((d) => d.ready) },
              {
                key: "gettingThere",
                label: "Getting There (3.0–4.4)",
                color: "var(--scoring-yellow)",
                values: data.map((d) => d.gettingThere),
              },
              {
                key: "needsWork",
                label: "Needs Work (1.0–2.9)",
                color: "var(--scoring-red)",
                values: data.map((d) => d.needsWork),
              },
            ]}
          />
        )}
      </CardContent>
    </Card>
  );
}
