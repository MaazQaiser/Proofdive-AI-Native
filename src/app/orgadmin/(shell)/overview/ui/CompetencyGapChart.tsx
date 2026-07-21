import { HorizontalBarChartPrimitive } from "@/components/dashboard/charts/HorizontalBarChartPrimitive";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { CompetencyGapItem } from "@/lib/orgAdminMockData";

type Props = { data: CompetencyGapItem[] };

function colorForScore(score: number): string {
  if (score >= 4.5) return "var(--scoring-green)";
  if (score >= 3.0) return "var(--scoring-yellow)";
  return "var(--scoring-red)";
}

export function CompetencyGapChart({ data }: Props) {
  const sorted = [...data].sort((a, b) => a.score - b.score);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Competency Gap Overview</CardTitle>
        <CardDescription>Lowest performing competencies across the organization</CardDescription>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <p className="py-10 text-center text-caption text-muted-foreground">No competency data available.</p>
        ) : (
          <HorizontalBarChartPrimitive
            items={sorted.map((item) => ({ key: item.key, label: item.label, value: item.score, color: colorForScore(item.score) }))}
            maxValue={5}
          />
        )}
      </CardContent>
    </Card>
  );
}
