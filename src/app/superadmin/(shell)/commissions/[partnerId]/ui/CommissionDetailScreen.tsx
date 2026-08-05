"use client";

import { ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DetailField, DetailGrid, DetailSection } from "@/components/ui/detail-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  SUPER_ADMIN_COMMISSION_DATE_RANGE_OPTIONS,
  SUPER_ADMIN_COMMISSION_INVOICES,
  formatCents,
  invoicesForPartner,
  type SuperAdminCommissionDateRange,
} from "@/lib/superAdminCommissions";
import {
  AUDIENCE_TYPE_LABEL,
  COMMISSION_TYPE_LABEL,
  ENTITY_TYPE_LABEL,
  PARTNER_TYPE_LABEL,
  formatCommissionSummary,
  type Partner,
} from "@/lib/superAdminPartners";
import { usePartners } from "@/lib/usePartners";

import { PartnerStatusPill } from "../../../partners/ui/PartnerStatusPills";

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-md border border-border p-4">
      <span className="text-caption text-muted-foreground">{label}</span>
      <span className="text-h6 font-semibold text-foreground">{value}</span>
    </div>
  );
}

type Props = {
  partnerId: string;
};

export function CommissionDetailScreen({ partnerId }: Props) {
  const { partners, hydrated } = usePartners();
  const [dateRange, setDateRange] = useState<SuperAdminCommissionDateRange>("all_time");

  const partner = partners.find((p) => p.id === partnerId) ?? null;

  const invoices = useMemo(
    () => invoicesForPartner(SUPER_ADMIN_COMMISSION_INVOICES, partnerId, dateRange),
    [partnerId, dateRange],
  );

  function simulateDownload(label: string) {
    toast.success(`${label} download started.`);
  }

  if (!hydrated) {
    return (
      <Card>
        <CardContent className="py-16 text-center text-caption text-muted-foreground">
          Loading partner commission details…
        </CardContent>
      </Card>
    );
  }

  if (!partner) {
    return (
      <div className="flex flex-col gap-4 pt-6">
        <Button variant="ghost" className="w-fit" asChild>
          <Link href="/superadmin/commissions">
            <ArrowLeft className="h-4 w-4" />
            Back to Commissions
          </Link>
        </Button>
        <Card>
          <CardContent className="py-16 text-center text-caption text-muted-foreground">
            Unable to load partner commission details at the moment.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pt-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <Button variant="ghost" className="w-fit px-0" asChild>
            <Link href="/superadmin/commissions">
              <ArrowLeft className="h-4 w-4" />
              Back to Commissions
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-h5 text-foreground">{partner.fullName}</h1>
            <PartnerStatusPill status={partner.status} />
          </div>
          <p className="text-caption text-muted-foreground">
            Commission detail is read-only. Edit commission structure from Partners.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/superadmin/partners">Open in Partner Management</Link>
        </Button>
      </div>

      <PartnerProfileRecap partner={partner} />

      <div className="-mx-6 border-t border-border">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-3">
          <div>
            <h2 className="text-body-sm font-medium text-foreground">Monthly Invoices</h2>
            <p className="text-caption text-muted-foreground">
              Commission invoices for this partner by billing period.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={dateRange}
              onValueChange={(v) => setDateRange(v as SuperAdminCommissionDateRange)}
            >
              <SelectTrigger size="sm" variant="filter" active={dateRange !== "all_time"}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPER_ADMIN_COMMISSION_DATE_RANGE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="outline"
              disabled={invoices.length === 0}
              onClick={() => simulateDownload("Bulk invoices")}
            >
              <Download className="h-4 w-4" />
              Bulk Download
            </Button>
          </div>
        </div>
        {invoices.length === 0 ? (
          <p className="px-6 py-10 text-center text-caption text-muted-foreground">
            {SUPER_ADMIN_COMMISSION_INVOICES.some((i) => i.partnerId === partnerId)
              ? "No matching periods found for the selected date range."
              : "No commission or invoice history found for this partner."}
          </p>
        ) : (
          <table className="w-full caption-bottom text-sm">
            <TableHeader className="sticky top-0 z-10 border-b border-border">
              <TableRow>
                <TableHead className="text-overline pl-6 text-muted-foreground">Invoice #</TableHead>
                <TableHead className="text-overline text-muted-foreground">Date</TableHead>
                <TableHead className="text-overline text-muted-foreground">Amount</TableHead>
                <TableHead className="text-overline text-muted-foreground">Month/Period</TableHead>
                <TableHead className="text-overline pr-6 text-right text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="pl-6 font-medium text-foreground">{inv.invoiceNumber}</TableCell>
                  <TableCell className="text-caption text-muted-foreground">{inv.date}</TableCell>
                  <TableCell className="text-body-sm text-foreground">
                    {formatCents(inv.amountCents)}
                  </TableCell>
                  <TableCell className="text-caption text-muted-foreground">{inv.period}</TableCell>
                  <TableCell className="pr-6 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => simulateDownload(inv.invoiceNumber)}
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </table>
        )}
      </div>
    </div>
  );
}

function PartnerProfileRecap({ partner }: { partner: Partner }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Partner Profile Recap</CardTitle>
        <CardDescription>Same profile information as Partner Management detail.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-8">
        <DetailSection title="Basic Details">
          <DetailGrid className="lg:grid-cols-4">
            <DetailField label="Full Name" value={partner.fullName} />
            <DetailField label="Email Address" value={partner.email} />
            <DetailField label="Phone Number" value={`${partner.phoneCountryCode} ${partner.phone}`} />
            <DetailField label="Country / Region" value={partner.country} />
          </DetailGrid>
        </DetailSection>
        <Separator />
        <DetailSection title="Entity Details">
          <DetailGrid className="lg:grid-cols-4">
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
          <DetailGrid className="lg:grid-cols-4">
            <DetailField label="Partner Type" value={PARTNER_TYPE_LABEL[partner.partnerType]} />
            <DetailField
              label="Referral Code"
              value={<span className="font-mono">{partner.referralCode}</span>}
            />
            <DetailField
              label="Commission Type"
              value={COMMISSION_TYPE_LABEL[partner.commissionType]}
            />
            <DetailField label="Commission Settings" value={formatCommissionSummary(partner)} />
          </DetailGrid>
        </DetailSection>
        <Separator />
        <DetailSection title="Performance">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile label="Total Referrals" value={String(partner.performance.totalReferrals)} />
            <StatTile label="Total Signups" value={String(partner.performance.totalSignups)} />
            <StatTile label="Total Conversions" value={String(partner.performance.totalConversions)} />
            <StatTile
              label="Total Earnings"
              value={formatCents(partner.performance.totalEarningsCents)}
            />
          </div>
        </DetailSection>
      </CardContent>
    </Card>
  );
}
