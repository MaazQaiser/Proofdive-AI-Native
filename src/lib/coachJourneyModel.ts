"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";

import { safeParseReportsMap } from "@/lib/interviewReports";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import type {
  InterviewReport,
  RoleProfile,
  TrainingJourneyProgress,
} from "@/lib/proofdiveTypes";
import {
  deriveJourneySignals,
  pickRecommendedNextStep,
  type RecommendedNextStep,
} from "@/lib/recommendedNextStep";
import { scoringLabelForScore } from "@/lib/scoringPalette";
import { readJson } from "@/lib/storage";
import {
  editingDiveForRole,
  isDiveStore,
  savedDivesForRole,
  type StoryboardDive,
  type StoryboardDiveStore,
} from "@/lib/storyboardDraft";
import { hasCompletedAnyTrainingForRole, pickMostRecentForRole } from "@/lib/trainingJourneyProgress";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

export type JourneyStepId = "training" | "storyboard" | "interview";
export type JourneyStepStatus = "done" | "in_progress" | "todo";

export type JourneyStep = {
  id: JourneyStepId;
  index: number;
  title: string;
  /** What the step is, for a user who has not started it. */
  subtitle: string;
  /** What the user has actually done, once they have started. */
  detail: string | null;
  status: JourneyStepStatus;
  /** In-progress percentage when the module reports one (training). */
  percent: number | null;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
};

export type CoachJourneyModel = {
  steps: JourneyStep[];
  recommended: RecommendedNextStep;
  report: InterviewReport | null;
  doneCount: number;
  dives: StoryboardDive[];
  role: string;
  firstName: string;
};

function latestReportForRole(role: string): InterviewReport | null {
  if (typeof window === "undefined" || !role) return null;
  const list = Object.values(
    safeParseReportsMap(window.localStorage.getItem(StorageKeys.reports)),
  ).filter((r) => (r.meta?.roleTitle ?? "").trim() === role);
  if (!list.length) return null;
  return (
    [...list].sort(
      (a, b) => new Date(b.meta.createdAt).getTime() - new Date(a.meta.createdAt).getTime(),
    )[0] ?? null
  );
}

function reportsForRoleCount(role: string): number {
  if (typeof window === "undefined" || !role) return 0;
  return Object.values(
    safeParseReportsMap(window.localStorage.getItem(StorageKeys.reports)),
  ).filter((r) => (r.meta?.roleTitle ?? "").trim() === role).length;
}

/**
 * The three steps, with the state each module actually reports.
 *
 * Lifted out of the redesigned Home so both Homes read one model rather than
 * two that drift: the client approved this reading of the journey — done
 * count, which step is next, and the detail that proves each claim — and it
 * is now the only place that decides it. Everything is derived from storage
 * on the client; `pathname` is in the deps because Dives and reports live in
 * localStorage rather than React state, so a return from any module has to
 * invalidate the memo.
 *
 * Returns `null` until storage has hydrated, so a caller renders a held frame
 * instead of a wrong one.
 */
export function useCoachJourneyModel(): CoachJourneyModel | null {
  const pathname = usePathname();
  const [roleProfile, , profileHydrated] = useLocalStorageState<RoleProfile | null>(
    StorageKeys.roleProfile,
    null,
  );
  const [trainingMap, , trainingHydrated] = useLocalStorageState<
    Record<string, TrainingJourneyProgress>
  >(StorageKeys.trainingProgress, {});

  const hydrated = profileHydrated && trainingHydrated;
  const role = roleProfile?.targetRole?.trim() ?? "";
  const firstName = (roleProfile?.name ?? "").trim().split(/\s+/)[0] ?? "";

  return useMemo(() => {
    if (!hydrated || typeof window === "undefined") return null;

    const diveStore = readJson<StoryboardDiveStore>(StorageKeys.storyboardDives);
    const dives = role && isDiveStore(diveStore) ? savedDivesForRole(diveStore, role) : [];
    const editing = role && isDiveStore(diveStore) ? editingDiveForRole(diveStore, role) : null;
    const training = pickMostRecentForRole(trainingMap, role);
    const trainingDone = hasCompletedAnyTrainingForRole(trainingMap, role);
    const report = latestReportForRole(role);
    const reportCount = reportsForRoleCount(role);

    const signals = deriveJourneySignals({
      role,
      hasSavedDives: dives.length > 0,
      roleExperienceCount: editing ? 1 : 0,
      storyOverallScore: dives[0]?.overallScore ?? 0,
    });
    const recommended = pickRecommendedNextStep({
      role,
      trainingJourneyProgressMap: trainingMap,
      hasCraftedStoryboard: signals.hasCraftedStoryboard,
      hasCreatedStoryboard: signals.hasCreatedStoryboard,
    });

    const trainingPct = training?.percentComplete ?? 0;
    const steps: JourneyStep[] = [
      {
        id: "training",
        index: 1,
        title: "Train with essential interview guides",
        subtitle: "Learn the fundamentals with guided practice.",
        detail: trainingDone
          ? `${training?.courseTitle ?? "Course"} complete.`
          : training && trainingPct > 0
            ? `${training.courseTitle} · ${trainingPct}% done.`
            : null,
        status: trainingDone ? "done" : trainingPct > 0 ? "in_progress" : "todo",
        percent: !trainingDone && trainingPct > 0 ? trainingPct : null,
        primary: {
          label: trainingDone ? "Review guides" : trainingPct > 0 ? "Continue learning" : "Start learning",
          href: "/training",
        },
      },
      {
        id: "storyboard",
        index: 2,
        title: "Craft your story",
        subtitle: "Turn your experience into structured answers.",
        detail:
          dives.length > 0
            ? `${dives.length} ${dives.length === 1 ? "Dive" : "Dives"} saved${editing ? " · one in progress" : ""}.`
            : editing
              ? "A Dive is in progress — pick up where you left off."
              : null,
        status: dives.length > 0 ? "done" : editing ? "in_progress" : "todo",
        percent: null,
        primary: {
          label: dives.length > 0 ? "Open Storyboard" : editing ? "Continue crafting" : "Start crafting",
          href: "/storyboard",
        },
        secondary: dives.length > 0 ? { label: "Add competency", href: "/storyboard?new=1" } : undefined,
      },
      {
        id: "interview",
        index: 3,
        title: "Take a mock interview",
        subtitle: "Practice with a 30-minute, real-world interview.",
        detail: report
          ? `${reportCount} ${reportCount === 1 ? "session" : "sessions"} · latest ${report.overallScore.toFixed(1)}/5, ${scoringLabelForScore(report.overallScore)}.`
          : null,
        status: report ? "done" : "todo",
        percent: null,
        primary: {
          label: report ? "Take another" : "Start interview",
          href: report ? "/interview" : "/interview?welcomeBack=1",
        },
        secondary: report
          ? { label: "View report", href: `/report/${encodeURIComponent(report.meta.id)}` }
          : undefined,
      },
    ];

    const doneCount = steps.filter((s) => s.status === "done").length;
    return { steps, recommended, report, doneCount, dives, role, firstName };
    // `pathname` is not read inside, but it is the re-read trigger — see the
    // note above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, role, firstName, trainingMap, roleProfile, pathname]);
}
