import { AlertTriangle } from "lucide-react";

import { StatusPill, type StatusTone } from "@/components/ui/status-pill";
import {
  ORGANIZATION_STATUS_LABEL,
  SUBSCRIPTION_STATUS_LABEL,
  type OrganizationStatus,
  type SubscriptionStatus,
} from "@/lib/superAdminOrganizations";

export function OrganizationStatusPill({ status }: { status: OrganizationStatus }) {
  const tone: StatusTone = status === "active" ? "success" : "neutral";
  return <StatusPill tone={tone}>{ORGANIZATION_STATUS_LABEL[status]}</StatusPill>;
}

export function SubscriptionStatusPill({ status }: { status: SubscriptionStatus }) {
  const tone: StatusTone =
    status === "active" ? "success" : status === "expiring_soon" ? "warning" : "danger";
  return (
    <StatusPill tone={tone} icon={status === "expiring_soon" ? AlertTriangle : undefined}>
      {SUBSCRIPTION_STATUS_LABEL[status]}
    </StatusPill>
  );
}
