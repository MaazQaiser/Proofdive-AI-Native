import { ChartLegend } from "@/components/dashboard/charts/ChartLegend";
import { LineChartPrimitive } from "@/components/dashboard/charts/LineChartPrimitive";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TenantGrowthPoint } from "@/lib/superAdminMockData";

type Props = { data: TenantGrowthPoint[] };

const SERIES = [
  { key: "universities", label: "Universities", color: "var(--primary)" },
  { key: "trainingCenters", label: "Training Centers", color: "var(--extended-blue)" },
  { key: "employers", label: "Employers", color: "var(--scoring-yellow)" },
] as const;

export function TenantGrowthChart({ data }: Props) {
  return (
    <Card>
      <CardHeader className="gap-1">
        <CardTitle className="text-h5 font-semibold">Tenant Growth Analytics</CardTitle>
        <CardDescription>Onboarding trends across the platform</CardDescription>
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
          <LineChartPrimitive
            labels={data.map((d) => d.label)}
            series={[
              { ...SERIES[0], values: data.map((d) => d.universities) },
              { ...SERIES[1], values: data.map((d) => d.trainingCenters) },
              { ...SERIES[2], values: data.map((d) => d.employers) },
            ]}
          />
        )}
      </CardContent>
    </Card>
  );
}
