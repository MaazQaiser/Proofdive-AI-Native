import { ChartLegend } from "@/components/dashboard/charts/ChartLegend";
import { StackedBarChartPrimitive } from "@/components/dashboard/charts/StackedBarChartPrimitive";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { OrganizationReadinessPoint } from "@/lib/orgAdminMockData";

type Props = { data: OrganizationReadinessPoint[] };

const SERIES = [
  { key: "ready", label: "Star (4.5–5.0)", color: "var(--scoring-cyan)" },
  { key: "gettingThere", label: "Pass (3.5–4.4)", color: "var(--scoring-green)" },
  { key: "needsWork", label: "Not ready / Borderline (1.0–3.4)", color: "var(--scoring-red)" },
] as const;

export function OrganizationReadinessChart({ data }: Props) {
  return (
    <Card>
      <CardHeader className="gap-1">
        <CardTitle className="text-h5 font-semibold">Organization Readiness Overview</CardTitle>
        <CardDescription>Overall readiness distribution across the organization</CardDescription>
        <CardAction>
          <ChartLegend items={[...SERIES]} />
        </CardAction>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-10 text-center text-caption text-muted-foreground">No data found for selected date range.</p>
        ) : (
          <StackedBarChartPrimitive
            labels={data.map((d) => d.label)}
            series={[
              { ...SERIES[0], values: data.map((d) => d.ready) },
              { ...SERIES[1], values: data.map((d) => d.gettingThere) },
              { ...SERIES[2], values: data.map((d) => d.needsWork) },
            ]}
          />
        )}
      </CardContent>
    </Card>
  );
}
