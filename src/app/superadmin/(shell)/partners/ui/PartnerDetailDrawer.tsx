"use client";

import { Ban, CheckCircle2, SquarePen, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { KpiCard, KpiRow } from "@/components/dashboard/KpiCard";
import { Button } from "@/components/ui/button";
import { CopyableReferralCode } from "@/components/ui/copyable-referral-code";
import { DetailField, DetailGrid, DetailSection } from "@/components/ui/detail-field";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatCents } from "@/lib/partnerMockData";
import {
  AUDIENCE_TYPE_LABEL,
  COMMISSION_TYPE_LABEL,
  ENTITY_TYPE_LABEL,
  PARTNER_TYPE_LABEL,
  PAYOUT_FREQUENCY_LABEL,
  formatCommissionSummary,
  type Partner,
} from "@/lib/superAdminPartners";

import { PartnerStatusPill } from "./PartnerStatusPills";

type PartnerDetailDrawerProps = {
  partner: Partner | null;
  onOpenChange: (open: boolean) => void;
  onRequestStatusChange: (partner: Partner) => void;
};

export function PartnerDetailDrawer({
  partner,
  onOpenChange,
  onRequestStatusChange,
}: PartnerDetailDrawerProps) {
  const router = useRouter();

  if (!partner) {
    return (
      <Sheet open={false} onOpenChange={onOpenChange}>
        <SheetContent />
      </Sheet>
    );
  }

  return (
    <Sheet open={!!partner} onOpenChange={onOpenChange}>
      <SheetContent
        showCloseButton={false}
        className="flex flex-col gap-0 overflow-hidden p-0"
      >
        <SheetHeader className="flex min-h-14 shrink-0 flex-row items-center justify-between gap-3 space-y-0 border-b border-border py-4 pl-6 pr-4">
          <SheetTitle className="min-w-0 flex-1 truncate text-left">{partner.fullName}</SheetTitle>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              size="sm"
              variant={partner.status === "active" ? "destructive" : "default"}
              onClick={() => onRequestStatusChange(partner)}
            >
              {partner.status === "active" ? (
                <>
                  <Ban className="h-3.5 w-3.5" />
                  Deactivate
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Activate
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                onOpenChange(false);
                router.push(`/superadmin/partners/${partner.id}/edit`);
              }}
            >
              <SquarePen className="h-3.5 w-3.5" />
              Edit
            </Button>
            <SheetClose asChild>
              <Button size="sm" variant="ghost" className="size-8 shrink-0 p-0!" aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          <div className="mb-6 flex min-w-0 items-center gap-2">
            <p className="truncate text-h4 text-foreground">{partner.fullName}</p>
            <PartnerStatusPill status={partner.status} />
          </div>

          <KpiRow banded className="-mx-6 mb-8">
            <KpiCard label="Total Referrals" value={String(partner.performance.totalReferrals)} />
            <KpiCard label="Total Signups" value={String(partner.performance.totalSignups)} />
            <KpiCard label="Total Conversions" value={String(partner.performance.totalConversions)} />
            <KpiCard
              label="Total Earnings"
              value={formatCents(partner.performance.totalEarningsCents)}
            />
          </KpiRow>

          <div className="flex flex-col gap-8">
            <DetailSection title="Basic Details">
              <DetailGrid>
                <DetailField label="Full Name" value={partner.fullName} />
                <DetailField label="Email Address" value={partner.email} />
                <DetailField
                  label="Phone Number"
                  value={`${partner.phoneCountryCode} ${partner.phone}`}
                />
                <DetailField label="Country / Region" value={partner.country} />
              </DetailGrid>
            </DetailSection>
            <Separator />
            <DetailSection title="Entity Details">
              <DetailGrid>
                <DetailField label="Entity Type" value={ENTITY_TYPE_LABEL[partner.entityType]} />
                <DetailField label="Audience Type" value={AUDIENCE_TYPE_LABEL[partner.audienceType]} />
                {partner.entityType === "company" ? (
                  <>
                    <DetailField label="Company Name" value={partner.companyName} />
                    <DetailField label="Website" value={partner.website} />
                  </>
                ) : null}
              </DetailGrid>
            </DetailSection>
            <Separator />
            <DetailSection title="Partner Configuration">
              <DetailGrid>
                <DetailField label="Partner Type" value={PARTNER_TYPE_LABEL[partner.partnerType]} />
                <DetailField
                  label="Referral Code"
                  value={<CopyableReferralCode code={partner.referralCode} />}
                />
                <DetailField
                  label="Applied Discount"
                  value={partner.discountPercent ? `${partner.discountPercent}%` : "None"}
                  muted={!partner.discountPercent}
                />
              </DetailGrid>
            </DetailSection>
            <Separator />
            <DetailSection title="Commission Configuration">
              <DetailGrid>
                <DetailField
                  label="Commission Type"
                  value={COMMISSION_TYPE_LABEL[partner.commissionType]}
                />
                <DetailField label="Settings" value={formatCommissionSummary(partner)} />
                <DetailField
                  label="Payout Frequency"
                  value={PAYOUT_FREQUENCY_LABEL[partner.payoutFrequency]}
                />
                <DetailField label="Payment Method" value="Stripe" />
              </DetailGrid>
            </DetailSection>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
