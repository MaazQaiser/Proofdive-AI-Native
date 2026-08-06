import { StatusPill, type StatusTone } from "@/components/ui/status-pill";
import { ORG_ADMIN_USER_STATUS_LABEL, type OrgAdminUserStatus } from "@/lib/orgAdminUsers";

export function OrgAdminUserStatusPill({ status }: { status: OrgAdminUserStatus }) {
  const tone: StatusTone =
    status === "active" ? "success" : status === "invited" ? "warning" : "neutral";
  return <StatusPill tone={tone}>{ORG_ADMIN_USER_STATUS_LABEL[status]}</StatusPill>;
}
