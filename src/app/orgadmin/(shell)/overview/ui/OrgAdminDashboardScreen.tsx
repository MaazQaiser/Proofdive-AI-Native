"use client";

import { Star, UserPlus, Users, Video } from "lucide-react";

import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";
import { formatNumber } from "@/components/dashboard/format";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-h5 text-foreground">Dashboard &amp; Analytics</h1>
          <p className="mt-0.5 text-caption text-muted-foreground">
            Organization-wide readiness, engagement, training, and subscription analytics.
          </p>
        </div>
        <DateRangeFilter value={granularity} onChange={setGranularity} options={DATE_RANGE_OPTIONS} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Invited Users" value={formatNumber(kpis.totalInvitedUsers)} icon={UserPlus} />
        <KpiCard label="Active Users" value={formatNumber(kpis.activeUsers)} icon={Users} />
        <KpiCard label="Mock Interviews Conducted" value={formatNumber(kpis.totalMockInterviews)} icon={Video} />
        <KpiCard label="Average Interview Score" value={`${kpis.avgInterviewScore.toFixed(1)} / 5`} icon={Star} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <InvitedUsersTrendChart data={dataset.invitedUsersTrend} />
        <MockInterviewPerformanceChart data={dataset.mockInterviewPerformance} />
        <SubscriptionPlanChart data={applyAddOnDeltas(dataset.subscriptionModules, billingOverrides)} />
        <OrganizationReadinessChart data={dataset.organizationReadiness} />
        <CompetencyGapChart data={dataset.competencyGap} />
      </div>
    </div>
  );
}
