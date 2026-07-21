import { ComboBarLineChartPrimitive } from "@/components/dashboard/charts/ComboBarLineChartPrimitive";
import { formatCompactNumber } from "@/components/dashboard/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MockInterviewPerformancePoint } from "@/lib/orgAdminMockData";

type Props = { data: MockInterviewPerformancePoint[] };

export function MockInterviewPerformanceChart({ data }: Props) {
  const highest = data.length > 0 ? data.reduce((a, b) => (b.avgScore > a.avgScore ? b : a)) : null;
  const lowest = data.length > 0 ? data.reduce((a, b) => (b.avgScore < a.avgScore ? b : a)) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mock Interview Performance Summary</CardTitle>
        <CardDescription>Mock interview activity and interview quality trends</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-10 text-center text-caption text-muted-foreground">No interview activity found.</p>
        ) : (
          <>
            <ComboBarLineChartPrimitive
              labels={data.map((d) => d.label)}
              bar={{
                key: "interviews",
                label: "Mock Interviews Conducted",
                color: "var(--primary)",
                values: data.map((d) => d.interviewsConducted),
              }}
              line={{
                key: "avgScore",
                label: "Average Interview Score",
                color: "var(--scoring-yellow)",
                values: data.map((d) => d.avgScore),
              }}
              lineMax={5}
              barYFormatter={formatCompactNumber}
              lineYFormatter={(v) => v.toFixed(1)}
            />
            {highest && lowest ? (
              <p className="mt-3 text-overline text-muted-foreground">
                Highest performing period: <span className="font-medium text-foreground">{highest.label}</span> ·
                Lowest performing period: <span className="font-medium text-foreground">{lowest.label}</span>
              </p>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
