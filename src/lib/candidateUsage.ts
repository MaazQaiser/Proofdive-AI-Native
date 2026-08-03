import {
  defaultCandidateEntitlements,
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

/** Show storyboard upgrade banner at or above this usage percentage. */
export const STORYBOARD_NEAR_LIMIT_PCT = 80;

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

/** Storyboard used count: preferential generation counter; falls back to saved dives. */
export function resolveStoryboardUsed(
  generationCount: number | null | undefined,
  diveStore: StoryboardDiveStore | null | undefined,
): number {
  if (typeof generationCount === "number" && Number.isFinite(generationCount)) {
    return Math.max(0, Math.floor(generationCount));
  }
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

export function computeMockInterviewLimit(
  entitlements: CandidateEntitlements,
  activeBundle: PaymentBundle | null,
): number {
  const bundleQty =
    activeBundle?.mockInterview.included ? activeBundle.mockInterview.quantity : 0;
  return FREE_MOCK_INTERVIEW_ALLOCATION + entitlements.addOnMockInterviews + bundleQty;
}

export function computeStoryboardLimit(
  entitlements: CandidateEntitlements,
  activeBundle: PaymentBundle | null,
): number {
  const bundleQty = activeBundle?.storyboard.included ? activeBundle.storyboard.quantity : 0;
  return FREE_STORYBOARD_ALLOCATION + entitlements.addOnStoryboards + bundleQty;
}

export function computeOtherBenefitsLimit(
  entitlements: CandidateEntitlements,
  activeBundle: PaymentBundle | null,
): number {
  const freeIds = new Set(entitlements.freeMasterclassModuleIds);
  for (const id of entitlements.addOnMasterclassModuleIds) freeIds.add(id);
  if (activeBundle?.masterclass.included) {
    for (const sel of activeBundle.masterclass.selections) {
      for (const id of sel.selectedModuleIds) freeIds.add(id);
    }
  }
  // Fallback so empty entitlements still show a meaningful masterclass slot on Free.
  if (freeIds.size === 0) {
    return defaultCandidateEntitlements().freeMasterclassModuleIds.length || 1;
  }
  return freeIds.size;
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

  const mockLimit = computeMockInterviewLimit(input.entitlements, input.activeBundle);
  const storyLimit = computeStoryboardLimit(input.entitlements, input.activeBundle);
  const otherLimit = computeOtherBenefitsLimit(input.entitlements, input.activeBundle);

  const mockUsed = countInterviewReports(input.reports);
  const storyUsed = resolveStoryboardUsed(input.storyboardGenerationCount, input.diveStore);
  const otherUsed = countCompletedMasterclassModules(input.trainingProgress);

  const mockInterviews = meter("Mock interviews", mockUsed, mockLimit);
  const storyboards = meter("Storyboards", storyUsed, storyLimit);
  const otherBenefits = meter("Other benefits", otherUsed, otherLimit);

  const storyboardUsagePct = storyboards.pct;
  const isNearStoryboardLimit =
    storyLimit > 0 && storyboardUsagePct >= STORYBOARD_NEAR_LIMIT_PCT;
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
