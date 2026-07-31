import { Ban, CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  PARTNER_STATUS_LABEL,
  type PartnerStatus,
} from "@/lib/superAdminPartners";

export function PartnerStatusPill({ status }: { status: PartnerStatus }) {
  const active = status === "active";
  return (
    <span
      className={cn(
        "text-overline inline-flex h-6 w-fit items-center gap-1 rounded-full border pl-1 pr-2 whitespace-nowrap",
        active
          ? "border-scoring-green/25 bg-scoring-green/15 text-scoring-green-fg"
          : "border-border bg-muted text-muted-foreground",
      )}
    >
      {active ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
      {PARTNER_STATUS_LABEL[status]}
    </span>
  );
}
