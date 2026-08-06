import { StatusPill, type StatusTone } from "@/components/ui/status-pill";
import { PARTNER_STATUS_LABEL, type PartnerStatus } from "@/lib/superAdminPartners";

export function PartnerStatusPill({ status }: { status: PartnerStatus }) {
  const tone: StatusTone = status === "active" ? "success" : "neutral";
  return <StatusPill tone={tone}>{PARTNER_STATUS_LABEL[status]}</StatusPill>;
}
