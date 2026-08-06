import { StatusPill, type StatusTone } from "@/components/ui/status-pill";
import type { CompetencyFrameworkVersion } from "@/lib/superAdminCompetencyFrameworks";

export function FrameworkStatusPill({
  status,
}: {
  status: CompetencyFrameworkVersion["status"];
}) {
  const tone: StatusTone = status === "published" ? "success" : "warning";
  return <StatusPill tone={tone}>{status === "published" ? "Published" : "Draft"}</StatusPill>;
}
