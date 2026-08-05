"use client";

import { Copy, Link2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { formatNumber } from "@/components/dashboard/format";
import { KpiCard, KpiRow } from "@/components/dashboard/KpiCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PARTNER_DEMO } from "@/lib/partnerDemo";
import {
  PARTNER_DASHBOARD_DATA,
  PARTNER_DATE_RANGE_OPTIONS,
  formatCents,
  type ConversionStatusFilter,
  type PartnerDateRangeGranularity,
} from "@/lib/partnerMockData";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import type { Partner } from "@/lib/superAdminPartners";
import { useLocalStorageState } from "@/lib/useLocalStorageState";
import { usePartners } from "@/lib/usePartners";
import { cn } from "@/lib/utils";

export function PartnerDashboardScreen() {
  const { partners } = usePartners();
  const [overrides] = useLocalStorageState<Partial<Partner>>(StorageKeys.partnerProfileOverrides, {});
  const [granularity, setGranularity] = useLocalStorageState<PartnerDateRangeGranularity>(
    StorageKeys.partnerDashboardDateRange,
    "monthly",
  );
  const [conversionFilter, setConversionFilter] = useState<ConversionStatusFilter>("all");

  const livePartner = partners.find((p) => p.id === PARTNER_DEMO.id) ?? PARTNER_DEMO;
  const referralCode = livePartner.referralCode;
  const dataset = PARTNER_DASHBOARD_DATA[granularity];

  const funnel = useMemo(() => {
    if (!dataset) return [];
    if (conversionFilter === "all") return dataset.funnel;
    if (conversionFilter === "converted") {
      return dataset.funnel.map((stage) =>
        stage.key === "paid" ? stage : { ...stage, count: Math.round(stage.count * 0.35) },
      );
    }
    return dataset.funnel.map((stage) =>
      stage.key === "paid" ? { ...stage, count: 0 } : { ...stage, count: Math.round(stage.count * 0.65) },
    );
  }, [dataset, conversionFilter]);

  const maxFunnel = Math.max(...funnel.map((s) => s.count), 1);

  async function handleCopyReferralCode() {
    try {
      await navigator.clipboard.writeText(referralCode);
      toast.success("Referral code copied.");
    } catch {
      toast.error("Referral code could not be copied. Please try again.");
    }
  }

  if (!dataset) {
    return (
      <Card>
        <CardContent className="py-16 text-center text-caption text-muted-foreground">
          Unable to load dashboard analytics at the moment.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-h5 text-foreground">Dashboard &amp; Analytics</h1>
          <p className="mt-0.5 text-caption text-muted-foreground">
            Referral performance, conversions, and earnings for {overrides.fullName ?? livePartner.fullName}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={granularity}
            onValueChange={(v) => setGranularity(v as PartnerDateRangeGranularity)}
          >
            <SelectTrigger size="sm" variant="filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PARTNER_DATE_RANGE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={conversionFilter}
            onValueChange={(v) => setConversionFilter(v as ConversionStatusFilter)}
          >
            <SelectTrigger size="sm" variant="filter" active={conversionFilter !== "all"}>
              <SelectValue placeholder="Conversion status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All conversions</SelectItem>
              <SelectItem value="converted">Converted only</SelectItem>
              <SelectItem value="not_converted">Not converted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <KpiRow>
        <KpiCard label="Total Signups" value={formatNumber(dataset.totalSignups)} />
        <KpiCard label="Total Earnings" value={formatCents(dataset.totalEarningsCents)} />
        <KpiCard label="Total Referrals" value={formatNumber(dataset.totalReferrals)} />
      </KpiRow>

      <Card className="gap-0 py-0">
        <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-caption text-muted-foreground">Referral Code</span>
            <span className="font-mono text-h6 font-semibold text-foreground">{referralCode}</span>
          </div>
          <Button size="sm" variant="outline" onClick={handleCopyReferralCode}>
            <Copy className="h-3.5 w-3.5" />
            Copy
          </Button>
        </CardContent>
      </Card>

      <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>
              User journey from referral code usage through paid conversion.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {funnel.every((s) => s.count === 0) ? (
              <p className="py-10 text-center text-caption text-muted-foreground">
                No analytics data available for selected filters.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {funnel.map((stage, index) => {
                  const widthPct = Math.max(8, Math.round((stage.count / maxFunnel) * 100));
                  return (
                    <div key={stage.key} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-body-sm text-foreground">
                          <span className="mr-2 text-caption text-muted-foreground">{index + 1}.</span>
                          {stage.label}
                        </span>
                        <span className="text-body-sm font-medium text-foreground">
                          {formatNumber(stage.count)}
                        </span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-3 rounded-full transition-all",
                            index === funnel.length - 1 ? "bg-scoring-green" : "bg-primary",
                          )}
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
}
