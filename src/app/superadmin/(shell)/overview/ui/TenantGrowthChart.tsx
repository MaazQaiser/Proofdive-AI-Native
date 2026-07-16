import { Card, CardBody } from "@/components/Card";
import type { TenantGrowthPoint } from "@/lib/superAdminMockData";

import { LineChartPrimitive } from "./charts/LineChartPrimitive";

type Props = { data: TenantGrowthPoint[] };

const COLORS = {
  universities: "#111827",
  trainingCenters: "#2563eb",
  employers: "#f59e0b",
};

export function TenantGrowthChart({ data }: Props) {
  return (
    <Card>
      <CardBody>
        <h2 className="text-h6 text-black">Tenant Growth Analytics</h2>
        <p className="mt-0.5 text-caption text-[var(--app-muted)]">Onboarding trends across the platform</p>
        <div className="mt-4">
          {data.length === 0 ? (
            <p className="py-10 text-center text-caption text-[var(--app-muted)]">
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
        </div>
      </CardBody>
    </Card>
  );
}
