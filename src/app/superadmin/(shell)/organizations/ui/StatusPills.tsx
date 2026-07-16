import { Ban, CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  ORGANIZATION_STATUS_LABEL,
  SUBSCRIPTION_STATUS_LABEL,
  type OrganizationStatus,
  type SubscriptionStatus,
} from "@/lib/superAdminOrganizations";

export function OrganizationStatusPill({ status }: { status: OrganizationStatus }) {
  const active = status === "active";
  return (
    <span
      className={cn(
        "text-overline inline-flex h-6 w-fit items-center gap-1 rounded-full border px-2 whitespace-nowrap",
        active
          ? "border-scoring-green/20 bg-scoring-green/10 text-scoring-green"
          : "border-border bg-muted text-muted-foreground",
      )}
    >
      {active ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
      {ORGANIZATION_STATUS_LABEL[status]}
    </span>
  );
}

export function SubscriptionStatusPill({ status }: { status: SubscriptionStatus }) {
  const tone =
    status === "active"
      ? "border-scoring-green/20 bg-scoring-green/10 text-scoring-green"
      : status === "expiring_soon"
        ? "border-scoring-yellow/20 bg-scoring-yellow/10 text-scoring-yellow"
        : "border-scoring-red/20 bg-scoring-red/10 text-scoring-red";
  return (
    <span className={cn("text-overline inline-flex h-6 w-fit items-center rounded-full border px-2 whitespace-nowrap", tone)}>
      {SUBSCRIPTION_STATUS_LABEL[status]}
    </span>
  );
}
