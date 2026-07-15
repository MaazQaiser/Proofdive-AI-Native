"use client";

import { Card, CardBody } from "@/components/Card";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import { DATE_RANGE_OPTIONS, SUPER_ADMIN_MOCK_DATA } from "@/lib/superAdminMockData";
import type { DateRangeGranularity } from "@/lib/superAdminMockData";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

import { ActiveUserTrendChart } from "./ActiveUserTrendChart";
import { DateRangeFilter } from "./DateRangeFilter";
import { formatCompactCurrencyFromCents, formatNumber } from "./format";
import { KpiCard } from "./KpiCard";
import { PlatformUsageChart } from "./PlatformUsageChart";
import { RevenueAnalyticsChart } from "./RevenueAnalyticsChart";
import { TenantGrowthChart } from "./TenantGrowthChart";

export function SuperAdminDashboardScreen() {
  const [granularity, setGranularity] = useLocalStorageState<DateRangeGranularity>(
    StorageKeys.superAdminDashboardDateRange,
    "monthly",
  );

  const dataset = SUPER_ADMIN_MOCK_DATA[granularity];

  if (!dataset) {
    return (
      <Card>
        <CardBody className="py-16 text-center text-sm font-medium text-[var(--app-muted)]">
          Unable to load dashboard analytics at the moment.
        </CardBody>
      </Card>
    );
  }

  const { kpis } = dataset;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black">Overview</h1>
          <p className="mt-0.5 text-sm text-[var(--app-muted)]">
            Read-only platform KPIs and usage trends.
          </p>
        </div>
        <DateRangeFilter value={granularity} onChange={setGranularity} options={DATE_RANGE_OPTIONS} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard
          label="Total Organizations"
          value={formatNumber(kpis.totalOrganizations)}
          breakdown={[
            { label: "Universities", value: kpis.organizationsBreakdown.universities },
            { label: "Training Centers", value: kpis.organizationsBreakdown.trainingCenters },
            { label: "Employers", value: kpis.organizationsBreakdown.employers },
          ]}
        />
        <KpiCard label="Total Active Users" value={formatNumber(kpis.totalActiveUsers)} />
        <KpiCard label="Mock Interviews" value={formatNumber(kpis.totalMockInterviews)} />
        <KpiCard label="Storyboards Generated" value={formatNumber(kpis.totalStoryboards)} />
        <KpiCard label="Monthly Recurring Revenue" value={formatCompactCurrencyFromCents(kpis.mrrCents)} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <TenantGrowthChart data={dataset.tenantGrowth} />
        <ActiveUserTrendChart data={dataset.activeUserTrend} />
        <PlatformUsageChart data={dataset.platformUsage} />
        <RevenueAnalyticsChart data={dataset.revenueAnalytics} />
      </div>
    </div>
  );
}
