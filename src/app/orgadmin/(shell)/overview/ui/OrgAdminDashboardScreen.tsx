"use client";

import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";
import { formatNumber } from "@/components/dashboard/format";
import { KpiCard, KpiRow } from "@/components/dashboard/KpiCard";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { PageTitle } from "@/components/ui/page-title";
import { applyAddOnDeltas, type BillingAddOnDeltas } from "@/lib/orgAdminBillingData";
import { DATE_RANGE_OPTIONS, ORG_ADMIN_MOCK_DATA } from "@/lib/orgAdminMockData";
import type { DateRangeGranularity } from "@/lib/orgAdminMockData";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

import { CompetencyGapChart } from "./CompetencyGapChart";
import { InvitedUsersTrendChart } from "./InvitedUsersTrendChart";
import { MockInterviewPerformanceChart } from "./MockInterviewPerformanceChart";
import { OrganizationReadinessChart } from "./OrganizationReadinessChart";
import { SubscriptionPlanChart } from "./SubscriptionPlanChart";

export function OrgAdminDashboardScreen() {
  const [granularity, setGranularity] = useLocalStorageState<DateRangeGranularity>(
    StorageKeys.orgAdminDashboardDateRange,
    "monthly",
  );
  const [billingOverrides] = useLocalStorageState<BillingAddOnDeltas>(StorageKeys.orgAdminBillingOverrides, {});

  const dataset = ORG_ADMIN_MOCK_DATA[granularity];

  if (!dataset) {
    return (
      <Card>
        <CardContent className="py-16 text-center text-caption text-muted-foreground">
          Unable to load dashboard analytics at the moment.
        </CardContent>
      </Card>
    );
  }

  const { kpis } = dataset;

  return (
    <div className="-mx-6 flex h-full min-w-0 flex-col overflow-hidden">
      <div className="shrink-0">
        <PageHeader>
          <PageTitle>Dashboard &amp; Analytics</PageTitle>
          <DateRangeFilter
            value={granularity}
            onChange={setGranularity}
            options={DATE_RANGE_OPTIONS}
          />
        </PageHeader>
        <KpiRow banded className="mx-0 border-t-0">
          <KpiCard
            label="Total Invited Users"
            value={formatNumber(kpis.totalInvitedUsers)}
            trend={kpis.trends.totalInvitedUsers}
          />
          <KpiCard label="Active Users" value={formatNumber(kpis.activeUsers)} trend={kpis.trends.activeUsers} />
          <KpiCard
            label="Mock Interviews Conducted"
            value={formatNumber(kpis.totalMockInterviews)}
            trend={kpis.trends.totalMockInterviews}
          />
          <KpiCard
            label="Average Interview Score"
            value={`${kpis.avgInterviewScore.toFixed(1)} / 5`}
            trend={kpis.trends.avgInterviewScore}
          />
        </KpiRow>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <InvitedUsersTrendChart data={dataset.invitedUsersTrend} />
          <MockInterviewPerformanceChart data={dataset.mockInterviewPerformance} />
          <SubscriptionPlanChart data={applyAddOnDeltas(dataset.subscriptionModules, billingOverrides)} />
          <OrganizationReadinessChart data={dataset.organizationReadiness} />
          <CompetencyGapChart data={dataset.competencyGap} />
        </div>
      </div>
    </div>
  );
}
