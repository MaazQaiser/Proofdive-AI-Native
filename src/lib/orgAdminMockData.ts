import { BASE_SUBSCRIPTION_MODULES, type SubscriptionModuleUsage } from "@/lib/orgAdminBillingData";

export type { SubscriptionModuleUsage };

export type DateRangeGranularity = "daily" | "weekly" | "monthly";

export type InvitedUsersPoint = { label: string; total: number; active: number; inactive: number };
export type MockInterviewPerformancePoint = { label: string; interviewsConducted: number; avgScore: number };
export type OrganizationReadinessPoint = { label: string; ready: number; gettingThere: number; needsWork: number };
export type CompetencyGapItem = { key: string; label: string; score: number };

export type OrgAdminKpis = {
  totalInvitedUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalMockInterviews: number;
  avgInterviewScore: number;
};

export type OrgAdminDashboardDataset = {
  kpis: OrgAdminKpis;
  invitedUsersTrend: InvitedUsersPoint[];
  mockInterviewPerformance: MockInterviewPerformancePoint[];
  subscriptionModules: SubscriptionModuleUsage[];
  organizationReadiness: OrganizationReadinessPoint[];
  competencyGap: CompetencyGapItem[];
};

export const DATE_RANGE_OPTIONS: { value: DateRangeGranularity; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

/** Real-time snapshot, not filtered by date range — same across all granularities. Source of truth lives in orgAdminBillingData.ts. */
const SUBSCRIPTION_MODULES: SubscriptionModuleUsage[] = BASE_SUBSCRIPTION_MODULES;

/** Aggregated competency scoring, not filtered by date range — same across all granularities. */
const COMPETENCY_GAP: CompetencyGapItem[] = [
  { key: "problem-solving", label: "Problem Solving", score: 2.4 },
  { key: "communication", label: "Communication", score: 2.8 },
  { key: "leadership", label: "Leadership", score: 3.1 },
  { key: "collaboration", label: "Collaboration", score: 3.6 },
  { key: "technical-depth", label: "Technical Depth", score: 4.0 },
  { key: "adaptability", label: "Adaptability", score: 4.4 },
];

export const ORG_ADMIN_MOCK_DATA: Record<DateRangeGranularity, OrgAdminDashboardDataset> = {
  daily: {
    kpis: {
      totalInvitedUsers: 42,
      activeUsers: 31,
      inactiveUsers: 11,
      totalMockInterviews: 96,
      avgInterviewScore: 3.4,
    },
    invitedUsersTrend: [
      { label: "Apr 01", total: 28, active: 20, inactive: 8 },
      { label: "Apr 02", total: 29, active: 21, inactive: 8 },
      { label: "Apr 03", total: 30, active: 22, inactive: 8 },
      { label: "Apr 04", total: 31, active: 22, inactive: 9 },
      { label: "Apr 05", total: 33, active: 24, inactive: 9 },
      { label: "Apr 06", total: 34, active: 25, inactive: 9 },
      { label: "Apr 07", total: 35, active: 25, inactive: 10 },
      { label: "Apr 08", total: 36, active: 26, inactive: 10 },
      { label: "Apr 09", total: 37, active: 27, inactive: 10 },
      { label: "Apr 10", total: 38, active: 28, inactive: 10 },
      { label: "Apr 11", total: 39, active: 28, inactive: 11 },
      { label: "Apr 12", total: 40, active: 29, inactive: 11 },
      { label: "Apr 13", total: 41, active: 30, inactive: 11 },
      { label: "Apr 14", total: 42, active: 31, inactive: 11 },
    ],
    mockInterviewPerformance: [
      { label: "Apr 01", interviewsConducted: 4, avgScore: 3.0 },
      { label: "Apr 02", interviewsConducted: 5, avgScore: 3.0 },
      { label: "Apr 03", interviewsConducted: 5, avgScore: 3.1 },
      { label: "Apr 04", interviewsConducted: 6, avgScore: 3.1 },
      { label: "Apr 05", interviewsConducted: 6, avgScore: 3.2 },
      { label: "Apr 06", interviewsConducted: 7, avgScore: 3.2 },
      { label: "Apr 07", interviewsConducted: 7, avgScore: 3.3 },
      { label: "Apr 08", interviewsConducted: 7, avgScore: 3.3 },
      { label: "Apr 09", interviewsConducted: 8, avgScore: 3.4 },
      { label: "Apr 10", interviewsConducted: 8, avgScore: 3.4 },
      { label: "Apr 11", interviewsConducted: 8, avgScore: 3.4 },
      { label: "Apr 12", interviewsConducted: 9, avgScore: 3.5 },
      { label: "Apr 13", interviewsConducted: 9, avgScore: 3.4 },
      { label: "Apr 14", interviewsConducted: 9, avgScore: 3.4 },
    ],
    subscriptionModules: SUBSCRIPTION_MODULES,
    organizationReadiness: [
      { label: "Apr 01", ready: 18, gettingThere: 46, needsWork: 36 },
      { label: "Apr 04", ready: 20, gettingThere: 47, needsWork: 33 },
      { label: "Apr 07", ready: 23, gettingThere: 47, needsWork: 30 },
      { label: "Apr 10", ready: 26, gettingThere: 46, needsWork: 28 },
      { label: "Apr 14", ready: 29, gettingThere: 46, needsWork: 25 },
    ],
    competencyGap: COMPETENCY_GAP,
  },
  weekly: {
    kpis: {
      totalInvitedUsers: 42,
      activeUsers: 31,
      inactiveUsers: 11,
      totalMockInterviews: 340,
      avgInterviewScore: 3.4,
    },
    invitedUsersTrend: [
      { label: "Wk 1", total: 20, active: 13, inactive: 7 },
      { label: "Wk 2", total: 25, active: 17, inactive: 8 },
      { label: "Wk 3", total: 29, active: 20, inactive: 9 },
      { label: "Wk 4", total: 33, active: 23, inactive: 10 },
      { label: "Wk 5", total: 36, active: 26, inactive: 10 },
      { label: "Wk 6", total: 38, active: 28, inactive: 10 },
      { label: "Wk 7", total: 40, active: 29, inactive: 11 },
      { label: "Wk 8", total: 42, active: 31, inactive: 11 },
    ],
    mockInterviewPerformance: [
      { label: "Wk 1", interviewsConducted: 22, avgScore: 2.8 },
      { label: "Wk 2", interviewsConducted: 30, avgScore: 2.9 },
      { label: "Wk 3", interviewsConducted: 36, avgScore: 3.0 },
      { label: "Wk 4", interviewsConducted: 41, avgScore: 3.1 },
      { label: "Wk 5", interviewsConducted: 46, avgScore: 3.2 },
      { label: "Wk 6", interviewsConducted: 51, avgScore: 3.3 },
      { label: "Wk 7", interviewsConducted: 55, avgScore: 3.4 },
      { label: "Wk 8", interviewsConducted: 59, avgScore: 3.4 },
    ],
    subscriptionModules: SUBSCRIPTION_MODULES,
    organizationReadiness: [
      { label: "Wk 1", ready: 12, gettingThere: 42, needsWork: 46 },
      { label: "Wk 2", ready: 15, gettingThere: 44, needsWork: 41 },
      { label: "Wk 3", ready: 18, gettingThere: 45, needsWork: 37 },
      { label: "Wk 4", ready: 21, gettingThere: 46, needsWork: 33 },
      { label: "Wk 5", ready: 23, gettingThere: 46, needsWork: 31 },
      { label: "Wk 6", ready: 25, gettingThere: 46, needsWork: 29 },
      { label: "Wk 7", ready: 27, gettingThere: 46, needsWork: 27 },
      { label: "Wk 8", ready: 29, gettingThere: 46, needsWork: 25 },
    ],
    competencyGap: COMPETENCY_GAP,
  },
  monthly: {
    kpis: {
      totalInvitedUsers: 42,
      activeUsers: 31,
      inactiveUsers: 11,
      totalMockInterviews: 980,
      avgInterviewScore: 3.4,
    },
    invitedUsersTrend: [
      { label: "Jan", total: 8, active: 4, inactive: 4 },
      { label: "Feb", total: 16, active: 10, inactive: 6 },
      { label: "Mar", total: 25, active: 17, inactive: 8 },
      { label: "Apr", total: 42, active: 31, inactive: 11 },
    ],
    mockInterviewPerformance: [
      { label: "Jan", interviewsConducted: 60, avgScore: 2.6 },
      { label: "Feb", interviewsConducted: 140, avgScore: 2.9 },
      { label: "Mar", interviewsConducted: 260, avgScore: 3.1 },
      { label: "Apr", interviewsConducted: 520, avgScore: 3.4 },
    ],
    subscriptionModules: SUBSCRIPTION_MODULES,
    organizationReadiness: [
      { label: "Jan", ready: 8, gettingThere: 34, needsWork: 58 },
      { label: "Feb", ready: 14, gettingThere: 40, needsWork: 46 },
      { label: "Mar", ready: 21, gettingThere: 44, needsWork: 35 },
      { label: "Apr", ready: 29, gettingThere: 46, needsWork: 25 },
    ],
    competencyGap: COMPETENCY_GAP,
  },
};
