"use client";

import { Link2 } from "lucide-react";
import { useMemo, useState } from "react";

import { formatNumber } from "@/components/dashboard/format";
import { KpiCard, KpiRow } from "@/components/dashboard/KpiCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyableReferralCode } from "@/components/ui/copyable-referral-code";
import { PageHeader } from "@/components/ui/page-header";
import { PageTitle } from "@/components/ui/page-title";
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
import { useLocalStorageState } from "@/lib/useLocalStorageState";
import { usePartners } from "@/lib/usePartners";
import { cn } from "@/lib/utils";

export function PartnerDashboardScreen() {
  const { partners } = usePartners();
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
    <div className="-mx-6 flex h-full min-w-0 flex-col overflow-hidden">
      <div className="shrink-0">
        <PageHeader>
          <PageTitle>Dashboard &amp; Analytics</PageTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={granularity}
              onValueChange={(v) => setGranularity(v as PartnerDateRangeGranularity)}
            >
              <SelectTrigger
                size="sm"
                variant="filter"
                aria-label="Date range"
                className="border border-extended-green-blue/25 px-2.5 py-1.5 text-caption [&_svg]:!size-4"
              >
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
                <SelectItem value="all">Conversions</SelectItem>
                <SelectItem value="converted">Converted only</SelectItem>
                <SelectItem value="not_converted">Not converted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </PageHeader>
        <KpiRow banded className="mx-0 border-t-0">
          <KpiCard label="Total Signups" value={formatNumber(dataset.totalSignups)} />
          <KpiCard label="Total Earnings" value={formatCents(dataset.totalEarningsCents)} />
          <KpiCard label="Total Referrals" value={formatNumber(dataset.totalReferrals)} />
        </KpiRow>
      </div>

      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6">
        <Card className="gap-0 py-0">
          <CardContent className="flex items-center gap-2 p-4">
            <Link2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-caption text-muted-foreground">Referral Code</span>
            <CopyableReferralCode
              code={referralCode}
              codeClassName="text-h6 font-semibold text-foreground"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="gap-1">
            <CardTitle className="text-h5 font-semibold">Conversion Funnel</CardTitle>
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
    </div>
  );
}
