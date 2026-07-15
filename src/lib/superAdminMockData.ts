export type DateRangeGranularity = "daily" | "weekly" | "monthly";

export type TenantBreakdown = {
  universities: number;
  trainingCenters: number;
  employers: number;
};

export type SuperAdminKpis = {
  totalOrganizations: number;
  organizationsBreakdown: TenantBreakdown;
  totalActiveUsers: number;
  totalMockInterviews: number;
  totalStoryboards: number;
  /** Integer cents — format at render time to avoid float drift. */
  mrrCents: number;
};

export type TenantGrowthPoint = TenantBreakdown & { label: string };
export type ActiveUserPoint = { label: string; active: number; inactive: number };
export type PlatformUsagePoint = { label: string; mockInterviews: number; storyboards: number };
export type RevenuePoint = { label: string; mrrCents: number; growthPct: number };

export type SuperAdminDashboardDataset = {
  kpis: SuperAdminKpis;
  tenantGrowth: TenantGrowthPoint[];
  activeUserTrend: ActiveUserPoint[];
  platformUsage: PlatformUsagePoint[];
  revenueAnalytics: RevenuePoint[];
};

export const DATE_RANGE_OPTIONS: { value: DateRangeGranularity; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

export const SUPER_ADMIN_MOCK_DATA: Record<DateRangeGranularity, SuperAdminDashboardDataset> = {
  daily: {
    kpis: {
      totalOrganizations: 42,
      organizationsBreakdown: { universities: 18, trainingCenters: 14, employers: 10 },
      totalActiveUsers: 1284,
      totalMockInterviews: 216,
      totalStoryboards: 158,
      mrrCents: 4820000,
    },
    tenantGrowth: [
      { label: "Apr 01", universities: 14, trainingCenters: 10, employers: 6 },
      { label: "Apr 02", universities: 14, trainingCenters: 11, employers: 6 },
      { label: "Apr 03", universities: 15, trainingCenters: 11, employers: 7 },
      { label: "Apr 04", universities: 15, trainingCenters: 11, employers: 7 },
      { label: "Apr 05", universities: 15, trainingCenters: 12, employers: 7 },
      { label: "Apr 06", universities: 16, trainingCenters: 12, employers: 8 },
      { label: "Apr 07", universities: 16, trainingCenters: 12, employers: 8 },
      { label: "Apr 08", universities: 16, trainingCenters: 13, employers: 8 },
      { label: "Apr 09", universities: 17, trainingCenters: 13, employers: 8 },
      { label: "Apr 10", universities: 17, trainingCenters: 13, employers: 9 },
      { label: "Apr 11", universities: 17, trainingCenters: 14, employers: 9 },
      { label: "Apr 12", universities: 18, trainingCenters: 14, employers: 9 },
      { label: "Apr 13", universities: 18, trainingCenters: 14, employers: 10 },
      { label: "Apr 14", universities: 18, trainingCenters: 14, employers: 10 },
    ],
    activeUserTrend: [
      { label: "Apr 01", active: 980, inactive: 210 },
      { label: "Apr 02", active: 1005, inactive: 205 },
      { label: "Apr 03", active: 1042, inactive: 200 },
      { label: "Apr 04", active: 1030, inactive: 215 },
      { label: "Apr 05", active: 1078, inactive: 198 },
      { label: "Apr 06", active: 1102, inactive: 190 },
      { label: "Apr 07", active: 1121, inactive: 188 },
      { label: "Apr 08", active: 1145, inactive: 182 },
      { label: "Apr 09", active: 1160, inactive: 179 },
      { label: "Apr 10", active: 1188, inactive: 174 },
      { label: "Apr 11", active: 1204, inactive: 171 },
      { label: "Apr 12", active: 1229, inactive: 168 },
      { label: "Apr 13", active: 1256, inactive: 163 },
      { label: "Apr 14", active: 1284, inactive: 160 },
    ],
    platformUsage: [
      { label: "Apr 01", mockInterviews: 118, storyboards: 84 },
      { label: "Apr 02", mockInterviews: 124, storyboards: 88 },
      { label: "Apr 03", mockInterviews: 131, storyboards: 92 },
      { label: "Apr 04", mockInterviews: 128, storyboards: 96 },
      { label: "Apr 05", mockInterviews: 142, storyboards: 101 },
      { label: "Apr 06", mockInterviews: 150, storyboards: 106 },
      { label: "Apr 07", mockInterviews: 155, storyboards: 110 },
      { label: "Apr 08", mockInterviews: 163, storyboards: 114 },
      { label: "Apr 09", mockInterviews: 171, storyboards: 119 },
      { label: "Apr 10", mockInterviews: 180, storyboards: 125 },
      { label: "Apr 11", mockInterviews: 188, storyboards: 131 },
      { label: "Apr 12", mockInterviews: 197, storyboards: 138 },
      { label: "Apr 13", mockInterviews: 206, storyboards: 148 },
      { label: "Apr 14", mockInterviews: 216, storyboards: 158 },
    ],
    revenueAnalytics: [
      { label: "Apr 01", mrrCents: 4210000, growthPct: 1.2 },
      { label: "Apr 02", mrrCents: 4238000, growthPct: 1.3 },
      { label: "Apr 03", mrrCents: 4265000, growthPct: 1.4 },
      { label: "Apr 04", mrrCents: 4290000, growthPct: 1.3 },
      { label: "Apr 05", mrrCents: 4340000, growthPct: 1.6 },
      { label: "Apr 06", mrrCents: 4392000, growthPct: 1.7 },
      { label: "Apr 07", mrrCents: 4430000, growthPct: 1.5 },
      { label: "Apr 08", mrrCents: 4478000, growthPct: 1.8 },
      { label: "Apr 09", mrrCents: 4530000, growthPct: 1.9 },
      { label: "Apr 10", mrrCents: 4592000, growthPct: 2.1 },
      { label: "Apr 11", mrrCents: 4650000, growthPct: 2.0 },
      { label: "Apr 12", mrrCents: 4715000, growthPct: 2.2 },
      { label: "Apr 13", mrrCents: 4768000, growthPct: 2.1 },
      { label: "Apr 14", mrrCents: 4820000, growthPct: 2.3 },
    ],
  },
  weekly: {
    kpis: {
      totalOrganizations: 42,
      organizationsBreakdown: { universities: 18, trainingCenters: 14, employers: 10 },
      totalActiveUsers: 1284,
      totalMockInterviews: 974,
      totalStoryboards: 689,
      mrrCents: 4820000,
    },
    tenantGrowth: [
      { label: "Wk 1", universities: 12, trainingCenters: 8, employers: 4 },
      { label: "Wk 2", universities: 13, trainingCenters: 9, employers: 5 },
      { label: "Wk 3", universities: 14, trainingCenters: 10, employers: 6 },
      { label: "Wk 4", universities: 15, trainingCenters: 11, employers: 7 },
      { label: "Wk 5", universities: 16, trainingCenters: 12, employers: 7 },
      { label: "Wk 6", universities: 17, trainingCenters: 12, employers: 8 },
      { label: "Wk 7", universities: 17, trainingCenters: 13, employers: 9 },
      { label: "Wk 8", universities: 18, trainingCenters: 14, employers: 10 },
    ],
    activeUserTrend: [
      { label: "Wk 1", active: 720, inactive: 260 },
      { label: "Wk 2", active: 802, inactive: 250 },
      { label: "Wk 3", active: 875, inactive: 240 },
      { label: "Wk 4", active: 946, inactive: 228 },
      { label: "Wk 5", active: 1020, inactive: 214 },
      { label: "Wk 6", active: 1105, inactive: 198 },
      { label: "Wk 7", active: 1198, inactive: 178 },
      { label: "Wk 8", active: 1284, inactive: 160 },
    ],
    platformUsage: [
      { label: "Wk 1", mockInterviews: 512, storyboards: 340 },
      { label: "Wk 2", mockInterviews: 568, storyboards: 372 },
      { label: "Wk 3", mockInterviews: 615, storyboards: 405 },
      { label: "Wk 4", mockInterviews: 668, storyboards: 442 },
      { label: "Wk 5", mockInterviews: 730, storyboards: 480 },
      { label: "Wk 6", mockInterviews: 802, storyboards: 528 },
      { label: "Wk 7", mockInterviews: 884, storyboards: 602 },
      { label: "Wk 8", mockInterviews: 974, storyboards: 689 },
    ],
    revenueAnalytics: [
      { label: "Wk 1", mrrCents: 3620000, growthPct: 4.1 },
      { label: "Wk 2", mrrCents: 3740000, growthPct: 3.3 },
      { label: "Wk 3", mrrCents: 3880000, growthPct: 3.7 },
      { label: "Wk 4", mrrCents: 4020000, growthPct: 3.6 },
      { label: "Wk 5", mrrCents: 4210000, growthPct: 4.7 },
      { label: "Wk 6", mrrCents: 4430000, growthPct: 5.2 },
      { label: "Wk 7", mrrCents: 4610000, growthPct: 4.1 },
      { label: "Wk 8", mrrCents: 4820000, growthPct: 4.6 },
    ],
  },
  monthly: {
    kpis: {
      totalOrganizations: 42,
      organizationsBreakdown: { universities: 18, trainingCenters: 14, employers: 10 },
      totalActiveUsers: 1284,
      totalMockInterviews: 5860,
      totalStoryboards: 4215,
      mrrCents: 4820000,
    },
    tenantGrowth: [
      { label: "Jan", universities: 9, trainingCenters: 5, employers: 2 },
      { label: "Feb", universities: 11, trainingCenters: 7, employers: 4 },
      { label: "Mar", universities: 13, trainingCenters: 9, employers: 6 },
      { label: "Apr", universities: 15, trainingCenters: 11, employers: 7 },
      { label: "May", universities: 17, trainingCenters: 13, employers: 9 },
      { label: "Jun", universities: 18, trainingCenters: 14, employers: 10 },
    ],
    activeUserTrend: [
      { label: "Jan", active: 420, inactive: 340 },
      { label: "Feb", active: 588, inactive: 312 },
      { label: "Mar", active: 764, inactive: 286 },
      { label: "Apr", active: 942, inactive: 240 },
      { label: "May", active: 1116, inactive: 198 },
      { label: "Jun", active: 1284, inactive: 160 },
    ],
    platformUsage: [
      { label: "Jan", mockInterviews: 640, storyboards: 410 },
      { label: "Feb", mockInterviews: 890, storyboards: 590 },
      { label: "Mar", mockInterviews: 1180, storyboards: 820 },
      { label: "Apr", mockInterviews: 1420, storyboards: 1040 },
      { label: "May", mockInterviews: 1660, storyboards: 1250 },
      { label: "Jun", mockInterviews: 1870, storyboards: 1520 },
    ],
    revenueAnalytics: [
      { label: "Jan", mrrCents: 2180000, growthPct: 6.2 },
      { label: "Feb", mrrCents: 2560000, growthPct: 17.4 },
      { label: "Mar", mrrCents: 3040000, growthPct: 18.8 },
      { label: "Apr", mrrCents: 3620000, growthPct: 19.1 },
      { label: "May", mrrCents: 4180000, growthPct: 15.5 },
      { label: "Jun", mrrCents: 4820000, growthPct: 15.3 },
    ],
  },
};
