import {
  type CandidateEntitlements,
  type CandidateSubscriptionState,
  type PaymentBundle,
} from "@/lib/superAdminPaymentsData";
import type { InterviewReport, TrainingJourneyProgress } from "@/lib/proofdiveTypes";
import {
  createEmptyDiveStore,
  type StoryboardDiveStore,
} from "@/lib/storyboardDraft";

/** Free-plan one-time allocations (matches defaultCandidateEntitlements baselines / story 3.2). */
export const FREE_MOCK_INTERVIEW_ALLOCATION = 1;
export const FREE_STORYBOARD_ALLOCATION = 3;
export const FREE_REPORT_ALLOCATION = 1;

/** Soft near-limit threshold as a fraction of the subscriber’s plan storyboard limit. */
const STORYBOARD_NEAR_LIMIT_PCT = 80;

export type UsageMeter = {
  label: string;
  used: number;
  limit: number;
  pct: number;
};

export type CandidateUsageSnapshot = {
  planLabel: string;
  mockInterviews: UsageMeter;
  storyboards: UsageMeter;
  otherBenefits: UsageMeter;
  storyboardUsagePct: number;
  isNearStoryboardLimit: boolean;
  storyboardLimit: number;
  storyboardUsed: number;
  isStoryboardAtLimit: boolean;
};

function clampPct(used: number, limit: number): number {
  if (limit <= 0) return used > 0 ? 100 : 0;
  return Math.min(100, Math.round((used / limit) * 100));
}

function meter(label: string, used: number, limit: number): UsageMeter {
  const safeLimit = Math.max(0, limit);
  const safeUsed = Math.max(0, used);
  return {
    label,
    used: safeUsed,
    limit: safeLimit,
    pct: clampPct(safeUsed, safeLimit),
  };
}

export function countSavedStoryboardDives(store: StoryboardDiveStore | null | undefined): number {
  const s = store ?? createEmptyDiveStore();
  let count = 0;
  for (const bank of Object.values(s.byRole)) {
    count += bank.dives.filter((d) => d.status === "saved").length;
  }
  return count;
}

export function countInterviewReports(
  reports: Record<string, InterviewReport> | null | undefined,
): number {
  return Object.keys(reports ?? {}).length;
}

export function countCompletedMasterclassModules(
  journeyMap: Record<string, TrainingJourneyProgress> | null | undefined,
): number {
  if (!journeyMap) return 0;
  return Object.values(journeyMap).filter(
    (entry) => entry.phase === "complete" || entry.percentComplete >= 100,
  ).length;
}

/** Storyboard used count = saved Dive versions (not generation attempts). */
export function resolveStoryboardUsed(
  _generationCount: number | null | undefined,
  diveStore: StoryboardDiveStore | null | undefined,
): number {
  return countSavedStoryboardDives(diveStore);
}

export function resolvePlanLabel(
  subscription: CandidateSubscriptionState,
  activeBundle: PaymentBundle | null,
): string {
  if (subscription.status === "free" || !activeBundle) return "Free";
  if (subscription.status === "pending_cancel") {
    return `${activeBundle.name} (cancelling)`;
  }
  return activeBundle.name;
}

export function isFreePlan(subscription: CandidateSubscriptionState): boolean {
  return subscription.status === "free";
}

/** Paid active / pending_cancel with a resolved bundle (limits = bundle qty + add-ons only). */
export function hasPaidBundleAccess(
  subscription: CandidateSubscriptionState,
  activeBundle: PaymentBundle | null,
): boolean {
  return (
    (subscription.status === "active" || subscription.status === "pending_cancel") &&
    activeBundle != null
  );
}

/** Masterclass access: paid bundle inclusion or whole Masterclass add-on. */
export function hasMasterclassAccess(
  subscription: CandidateSubscriptionState,
  entitlements: CandidateEntitlements,
  activeBundle: PaymentBundle | null,
): boolean {
  if (
    hasPaidBundleAccess(subscription, activeBundle) &&
    activeBundle !== null &&
    activeBundle.masterclass.included
  ) {
    return true;
  }
  if (entitlements.addOnMasterclassIncluded) return true;
  // Legacy add-on path (module IDs) still grants access.
  return entitlements.addOnMasterclassModuleIds.length > 0;
}

export function computeMockInterviewLimit(
  subscription: CandidateSubscriptionState,
  entitlements: CandidateEntitlements,
  activeBundle: PaymentBundle | null,
): number {
  const addOns = entitlements.addOnMockInterviews;
  if (hasPaidBundleAccess(subscription, activeBundle) && activeBundle) {
    const bundleQty = activeBundle.mockInterview.included
      ? activeBundle.mockInterview.quantity
      : 0;
    return bundleQty + addOns;
  }
  return FREE_MOCK_INTERVIEW_ALLOCATION + addOns;
}

export function computeStoryboardLimit(
  subscription: CandidateSubscriptionState,
  entitlements: CandidateEntitlements,
  activeBundle: PaymentBundle | null,
): number {
  const addOns = entitlements.addOnStoryboards;
  if (hasPaidBundleAccess(subscription, activeBundle) && activeBundle) {
    const bundleQty = activeBundle.storyboard.included ? activeBundle.storyboard.quantity : 0;
    return bundleQty + addOns;
  }
  return FREE_STORYBOARD_ALLOCATION + addOns;
}

/**
 * Other-benefits meter: 1 when Masterclass is included (plan or add-on), else 0 on Free.
 * Candidates do not configure modules — this is an inclusion slot, not a per-module count.
 */
export function computeOtherBenefitsLimit(
  subscription: CandidateSubscriptionState,
  entitlements: CandidateEntitlements,
  activeBundle: PaymentBundle | null,
): number {
  return hasMasterclassAccess(subscription, entitlements, activeBundle) ? 1 : 0;
}

export function computeCandidateUsage(input: {
  subscription: CandidateSubscriptionState;
  entitlements: CandidateEntitlements;
  activeBundle: PaymentBundle | null;
  reports: Record<string, InterviewReport> | null | undefined;
  diveStore: StoryboardDiveStore | null | undefined;
  trainingProgress: Record<string, TrainingJourneyProgress> | null | undefined;
  storyboardGenerationCount?: number | null;
}): CandidateUsageSnapshot {
  const planLabel = resolvePlanLabel(input.subscription, input.activeBundle);

  const mockLimit = computeMockInterviewLimit(
    input.subscription,
    input.entitlements,
    input.activeBundle,
  );
  const storyLimit = computeStoryboardLimit(
    input.subscription,
    input.entitlements,
    input.activeBundle,
  );
  const otherLimit = computeOtherBenefitsLimit(
    input.subscription,
    input.entitlements,
    input.activeBundle,
  );

  const mockUsed = countInterviewReports(input.reports);
  const savedStoryboards = countSavedStoryboardDives(input.diveStore);
  const storyUsed = savedStoryboards;
  const otherUsed = Math.min(
    otherLimit,
    countCompletedMasterclassModules(input.trainingProgress) > 0 ? 1 : 0,
  );

  const mockInterviews = meter("Mock interviews", mockUsed, mockLimit);
  const storyboards = meter("Storyboards", storyUsed, storyLimit);
  const otherBenefits = meter("Other benefits", otherUsed, otherLimit);

  const storyboardUsagePct = storyboards.pct;
  // Soft banner after the first saved storyboard, when at/near the subscriber’s plan limit.
  const isNearStoryboardLimit =
    savedStoryboards >= 1 &&
    storyLimit > 0 &&
    (storyUsed >= storyLimit || storyboardUsagePct >= STORYBOARD_NEAR_LIMIT_PCT);
  const isStoryboardAtLimit = storyLimit > 0 && storyUsed >= storyLimit;

  return {
    planLabel,
    mockInterviews,
    storyboards,
    otherBenefits,
    storyboardUsagePct,
    isNearStoryboardLimit,
    storyboardLimit: storyLimit,
    storyboardUsed: storyUsed,
    isStoryboardAtLimit,
  };
}

/** Free plan: only the first accessed report may be viewed/downloaded. */
export function canAccessReport(
  reportId: string,
  accessedReportIds: string[] | null | undefined,
  freePlan: boolean,
): boolean {
  if (!freePlan) return true;
  const accessed = accessedReportIds ?? [];
  if (accessed.includes(reportId)) return true;
  return accessed.length < FREE_REPORT_ALLOCATION;
}

export function withReportAccessRecorded(
  reportId: string,
  accessedReportIds: string[] | null | undefined,
): string[] {
  const accessed = accessedReportIds ?? [];
  if (accessed.includes(reportId)) return accessed;
  return [...accessed, reportId];
}
