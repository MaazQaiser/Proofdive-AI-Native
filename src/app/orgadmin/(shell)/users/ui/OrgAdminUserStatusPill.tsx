import { Ban, CheckCircle2, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { ORG_ADMIN_USER_STATUS_LABEL, type OrgAdminUserStatus } from "@/lib/orgAdminUsers";

export function OrgAdminUserStatusPill({ status }: { status: OrgAdminUserStatus }) {
  const tone =
    status === "active"
      ? "border-scoring-green/20 bg-scoring-green/10 text-scoring-green"
      : status === "invited"
        ? "border-scoring-yellow/20 bg-scoring-yellow/10 text-scoring-yellow"
        : "border-border bg-muted text-muted-foreground";
  const Icon = status === "active" ? CheckCircle2 : status === "invited" ? Clock : Ban;

  return (
    <span className={cn("text-overline inline-flex h-6 w-fit items-center gap-1 rounded-full border px-2 whitespace-nowrap", tone)}>
      <Icon className="h-3.5 w-3.5" />
      {ORG_ADMIN_USER_STATUS_LABEL[status]}
    </span>
  );
}
