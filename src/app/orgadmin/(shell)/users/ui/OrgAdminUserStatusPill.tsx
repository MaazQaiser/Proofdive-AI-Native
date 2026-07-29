import { Ban, CheckCircle2, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { ORG_ADMIN_USER_STATUS_LABEL, type OrgAdminUserStatus } from "@/lib/orgAdminUsers";

export function OrgAdminUserStatusPill({ status }: { status: OrgAdminUserStatus }) {
  const tone =
    status === "active"
      ? "border-scoring-green/25 bg-scoring-green/15 text-scoring-green-fg"
      : status === "invited"
        ? "border-scoring-yellow/30 bg-scoring-yellow/20 text-scoring-yellow-fg"
        : "border-border bg-muted text-muted-foreground";
  const Icon = status === "active" ? CheckCircle2 : status === "invited" ? Clock : Ban;

  return (
    <span className={cn("text-overline inline-flex h-6 w-fit items-center gap-1 rounded-full border pl-1 pr-2 whitespace-nowrap", tone)}>
      <Icon className="h-3.5 w-3.5" />
      {ORG_ADMIN_USER_STATUS_LABEL[status]}
    </span>
  );
}
