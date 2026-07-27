"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, BookOpen, Info, Map, Plus, X } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { CoachFloatingNav } from "@/components/CoachFloatingNav";
import { cn } from "@/components/cn";
import { CoachConversationalDock } from "@/components/coach/CoachConversationalDock";
import type { ChatComposerQuickChip } from "@/components/chat/ChatComposer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CardButton } from "@/components/ui/card-button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Separator } from "@/components/ui/separator";
import { SuccessDriverIcon } from "@/components/ui/success-driver-icon";
import {
  createStoryboardDraft,
  normalizeStoryboardDocument,
  overallCompetencyStrength,
  type StoryboardDraftDocument,
  type StoryboardDraftStore,
} from "@/lib/storyboardDraft";
import {
  SUCCESS_DRIVER_COLORS,
  SUCCESS_DRIVER_ORDER,
  SUCCESS_DRIVERS,
  type SuccessDriverId,
} from "@/lib/successDrivers";
import { getReportById, latestReportOverallForRole, useLatestInterviewReport } from "@/lib/interviewReports";
import { reportCountForRole } from "@/lib/proofdiveLogic";
import { deriveJourneySignals } from "@/lib/recommendedNextStep";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import { readJson } from "@/lib/storage";
import { pickMostRecentForRole } from "@/lib/trainingJourneyProgress";
import type {
  Experience,
  InterviewReport,
  ReadinessLabel,
  RoleProfile,
  StoryboardFromCraft,
  TrainingJourneyProgress,
} from "@/lib/proofdiveTypes";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

export type CoachJourneyView = "welcome" | "roadmap" | "journey" | "final";

/** `welcome` = 2 CTAs + empty readiness; `roadmap` = 3 step cards + same empty readiness; `journey` = 3 steps + full readiness from latest mock; `final` = same layout, readiness pinned to the report opened from `/report/[id]` → Coach. */
/** Default when opening Coach without `?welcome=1` / `?roadmap=1` (those come only from onboarding + interview skip CTAs). */
const DEFAULT_COACH_JOURNEY_VIEW: CoachJourneyView = "journey";

const COACH_AI_QUICK_CHIPS: ChatComposerQuickChip[] = [
  {
    id: "plan_role",
    label: "Plan new Role",
    value: "Help me plan a new target role for my interview preparation.",
  },
  { label: "Add Another Experience", value: "I want to add another professional experience to my story." },
];

/** Session-only: this tab used `?welcome=1` (onboarding / interview skip). Used so stale localStorage `welcome` does not show on plain `/coach`. */
const COACH_WELCOME_ENTRY_SESSION_KEY = "proofdive.session.coachWelcomeEntry.v1";
/** Session-only: this tab used `?roadmap=1` after welcome (prep roadmap). */
const COACH_ROADMAP_ENTRY_SESSION_KEY = "proofdive.session.coachRoadmapEntry.v1";
/** Session-only dismiss for the readiness empty-state banner. */
const COACH_READINESS_BANNER_DISMISS_KEY = "proofdive.session.coachReadinessBannerDismissed.v1";

const READINESS_MAX = 5;

const DRIVER_ORDER = SUCCESS_DRIVER_ORDER;

function pillarTitle(id: SuccessDriverId): string {
  return SUCCESS_DRIVERS[id].label;
}

function pillarTooltip(id: SuccessDriverId): string {
  return SUCCESS_DRIVERS[id].description;
}

function readinessSnapshotFromReport(r: InterviewReport) {
  const pillars = [...r.drivers]
    .sort(
      (a, b) =>
        DRIVER_ORDER.indexOf(a.id as (typeof DRIVER_ORDER)[number]) -
        DRIVER_ORDER.indexOf(b.id as (typeof DRIVER_ORDER)[number]),
    )
    .map((d) => ({ id: d.id, label: d.fullTitle, score: d.score }));
  return {
    overall: r.overallScore,
    band: r.overallStatus,
    pillars,
  };
}

function coachReadinessBadgeClasses(label: ReadinessLabel) {
  if (label === "Ready") return "border-scoring-green/20 bg-scoring-green/15 text-scoring-green";
  if (label === "Borderline") return "border-scoring-yellow/20 bg-scoring-yellow/15 text-scoring-yellow";
  return "border-scoring-red/20 bg-scoring-red/15 text-scoring-red";
}

const ROLE_SUGGESTIONS = [
  "Product Manager",
  "Software Engineer",
  "Data Analyst",
  "UX Designer",
  "Project Manager",
] as const;


function pillarBarFill(id: SuccessDriverId): string {
  const map: Record<SuccessDriverId, string> = {
    thinking:
      "bg-[linear-gradient(90deg,var(--driver-thinking-symbol),var(--driver-thinking-accent))]",
    action:
      "bg-[linear-gradient(90deg,var(--driver-action-symbol),var(--driver-action-accent))]",
    people:
      "bg-[linear-gradient(90deg,var(--driver-people-symbol),var(--driver-people-accent))]",
    mastery:
      "bg-[linear-gradient(90deg,var(--driver-mastery-symbol),var(--driver-mastery-accent))]",
  };
  return map[id];
}

function PillarInfoIcon({ tooltip }: { tooltip: string }) {
  return (
    <button
      type="button"
      className={cn(
        "group relative inline-flex items-center justify-center rounded-md",
        "text-text-secondary hover:text-text-primary",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
      )}
      aria-label={tooltip}
    >
      <Info className="h-4 w-4 shrink-0" />
      <span
        className={cn(
          "pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2",
          "w-max max-w-[240px] whitespace-normal rounded-xl bg-foreground px-3 py-2 text-caption leading-4 text-background",
          "opacity-0 translate-y-1 transition",
          "group-hover:opacity-100 group-hover:translate-y-0",
          "group-focus-visible:opacity-100 group-focus-visible:translate-y-0",
        )}
        role="tooltip"
      >
        {tooltip}
      </span>
    </button>
  );
}

export function CoachHome() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [roleProfile, setRoleProfile] = useLocalStorageState<RoleProfile | null>(
    StorageKeys.roleProfile,
    null,
  );
  const [experiences] = useLocalStorageState<Experience[]>(StorageKeys.experiences, []);
  const [trainingJourneyProgressMap] = useLocalStorageState<Record<string, TrainingJourneyProgress>>(
    StorageKeys.trainingProgress,
    {},
  );
  const [draftStore] = useLocalStorageState<StoryboardDraftStore>(StorageKeys.storyboardDraft, {
    version: 1,
    byRole: {},
  });
  const [fromCraft] = useLocalStorageState<StoryboardFromCraft | null>(
    StorageKeys.storyboardFromCraft,
    null,
  );
  const [coachJourneyView, setCoachJourneyView] = useLocalStorageState<CoachJourneyView>(
    StorageKeys.coachJourneyView,
    DEFAULT_COACH_JOURNEY_VIEW,
  );
  const [coachFinalReportId, setCoachFinalReportId] = useLocalStorageState<string | null>(
    StorageKeys.coachFinalReadinessReportId,
    null,
  );
  const [readinessBannerDismissed, setReadinessBannerDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setReadinessBannerDismissed(
      sessionStorage.getItem(COACH_READINESS_BANNER_DISMISS_KEY) === "1",
    );
  }, []);

  function dismissReadinessBanner() {
    setReadinessBannerDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(COACH_READINESS_BANNER_DISMISS_KEY, "1");
    }
  }

  const latestInterviewReport = useLatestInterviewReport();
  const readinessSourceReport = useMemo(() => {
    if (coachJourneyView === "final") {
      if (!coachFinalReportId || typeof window === "undefined") return null;
      return getReportById(coachFinalReportId);
    }
    return latestInterviewReport;
  }, [coachJourneyView, coachFinalReportId, latestInterviewReport, pathname]);

  const journeyReadinessSnapshot = useMemo(() => {
    if (!readinessSourceReport) return null;
    return readinessSnapshotFromReport(readinessSourceReport);
  }, [readinessSourceReport]);

  const showWelcomeLanding = coachJourneyView === "welcome";
  const isRoadmapCoach = coachJourneyView === "roadmap";
  const isFinalCoach = coachJourneyView === "final";
  const showJourneyColumn =
    coachJourneyView === "roadmap" || coachJourneyView === "journey" || coachJourneyView === "final";
  /**
   * Readiness sidebar: empty placeholders on `welcome`, scored on `journey` / `final`.
   * Hidden on `roadmap` (planned journey — same hero area pattern without the card).
   */
  const showInterviewReadinessCard =
    coachJourneyView === "welcome" || coachJourneyView === "journey" || coachJourneyView === "final";
  const interviewReadinessEmpty = coachJourneyView === "welcome";

  const readinessCardModel = useMemo(() => {
    type PillarRow = {
      id: (typeof DRIVER_ORDER)[number];
      label: string;
      score: number | null;
    };

    const pillars: PillarRow[] = interviewReadinessEmpty
      ? DRIVER_ORDER.map((id) => ({ id, label: pillarTitle(id), score: null }))
      : journeyReadinessSnapshot?.pillars
        ? journeyReadinessSnapshot.pillars.map((p) => ({
            id: p.id as (typeof DRIVER_ORDER)[number],
            label: p.label,
            score: p.score,
          }))
        : DRIVER_ORDER.map((id) => ({ id, label: pillarTitle(id), score: null }));

    const overall = interviewReadinessEmpty ? null : (journeyReadinessSnapshot?.overall ?? null);
    const overallText = overall == null ? "--" : overall.toFixed(1);
    const band = interviewReadinessEmpty ? null : (journeyReadinessSnapshot?.band ?? null);
    const bandText = band ?? "--";
    const bandClass =
      band == null
        ? "bg-muted text-muted-foreground border-transparent"
        : coachReadinessBadgeClasses(journeyReadinessSnapshot?.band ?? "Not ready");

    const noteText = interviewReadinessEmpty
      ? "Take your first mock interview to get your interview readiness score."
      : journeyReadinessSnapshot
        ? null
        : "Complete a mock interview to see your readiness snapshot here (same scores as your report page).";

    return { pillars, overall, overallText, bandText, bandClass, noteText };
  }, [interviewReadinessEmpty, journeyReadinessSnapshot]);

  const readinessCardEl = useMemo(() => {
    if (!showInterviewReadinessCard) return null;
    return (
      <Card className="mt-6 w-full overflow-hidden">
        <CardHeader className="pb-2">
          <div className="min-w-0">
            <h3 className="text-h4 text-extended-dark-cyan">Interview readiness</h3>
            <p className="mt-1.5 text-caption text-text-secondary">
              Mocks, trainings, and pillar balance at a glance.
            </p>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-border pb-8">
            <div className="flex items-end gap-1.5">
              <span
                className={cn(
                  "font-gilroy text-[clamp(3.5rem,8vw,5.5rem)] font-normal leading-none tracking-[-0.06em] tabular-nums",
                  readinessCardModel.overall == null
                    ? "text-extended-dark-cyan/35"
                    : "text-extended-dark-cyan",
                )}
              >
                {readinessCardModel.overallText}
              </span>
              <span className="mb-2 text-[clamp(1.25rem,2.5vw,1.75rem)] font-normal tabular-nums text-text-secondary">
                /{READINESS_MAX.toFixed(1)}
              </span>
            </div>
            <p className="mb-2 flex flex-wrap items-center gap-2.5 text-body text-text-secondary">
              You’re currently
              <Badge
                variant="outline"
                className={cn("rounded-full text-caption", readinessCardModel.bandClass)}
              >
                {readinessCardModel.bandText}
              </Badge>
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {readinessCardModel.pillars.map(({ id, score }) => {
              const meta = SUCCESS_DRIVERS[id];
              const colors = SUCCESS_DRIVER_COLORS[id];
              const pct =
                score == null ? 0 : Math.min(100, Math.max(0, (score / READINESS_MAX) * 100));
              const display =
                score == null ? "--" : score.toFixed(1).replace(/\.0$/, "");

              return (
                <div key={id} className="min-w-0">
                  <div
                    className="mb-4 inline-flex size-11 items-center justify-center rounded-md border border-extended-cyan-green/35 bg-[color-mix(in_srgb,var(--extended-cyan-green)_9%,white)] backdrop-blur-sm"
                    aria-hidden
                  >
                    <SuccessDriverIcon
                      driver={id}
                      className="size-6 text-extended-cyan-green"
                    />
                  </div>

                  <div className="mb-2 flex items-center justify-between text-overline tabular-nums text-text-secondary">
                    <span>0</span>
                    <span>{READINESS_MAX.toFixed(0)}</span>
                  </div>
                  <div
                    className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={READINESS_MAX}
                    aria-valuenow={score ?? 0}
                    aria-label={meta.label}
                  >
                    <div
                      className={cn(
                        "h-full rounded-full transition-[width] duration-500 ease-out",
                        score == null ? "bg-border" : pillarBarFill(id),
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="mt-4 flex items-end gap-0.5">
                    <span
                      className={cn(
                        "font-gilroy text-[clamp(2.25rem,4vw,3rem)] font-normal leading-none tracking-[-0.04em] tabular-nums",
                        score == null ? "text-extended-dark-cyan/35" : colors.fg,
                      )}
                    >
                      {display}
                    </span>
                  </div>

                  <div className="mt-3 flex min-w-0 items-center gap-1.5">
                    <span className={cn("truncate text-body-sm font-semibold", colors.fg)}>
                      {meta.label}
                    </span>
                    <PillarInfoIcon tooltip={pillarTooltip(id)} />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }, [readinessCardModel, showInterviewReadinessCard]);

  const readinessNoteBanner =
    showInterviewReadinessCard &&
    readinessCardModel.noteText &&
    !readinessBannerDismissed ? (
      <div
        role="status"
        className="mt-6 flex w-full items-start gap-3 rounded-lg border border-extended-light-cyan bg-extended-light-cyan/50 px-4 py-3"
      >
        <p className="min-w-0 flex-1 text-body-sm leading-6 text-extended-green-blue">
          {readinessCardModel.noteText}
        </p>
        <button
          type="button"
          onClick={dismissReadinessBanner}
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-extended-green-blue transition hover:bg-extended-light-cyan hover:text-extended-dark-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          aria-label="Dismiss readiness tip"
        >
          <X className="size-4" />
        </button>
      </div>
    ) : null;
  useEffect(() => {
    const is = (k: string) => {
      const v = searchParams.get(k);
      return v === "1" || v?.toLowerCase() === "true";
    };
    if (is("welcome")) {
      // Read directly from localStorage instead of the (async-hydrated) `roleProfile`
      // state — this effect can run before that hook's own hydration effect has
      // committed, which would otherwise always see `roleProfile` as null here.
      const storedRoleProfile = readJson<RoleProfile>(StorageKeys.roleProfile);
      const roleTitle = storedRoleProfile?.targetRole?.trim() ?? "";
      if (reportCountForRole(roleTitle) > 0) {
        // Returning user (already completed ≥1 mock interview for this role) — skip the
        // first-time intro and land directly on the module hub.
        sessionStorage.removeItem(COACH_WELCOME_ENTRY_SESSION_KEY);
        sessionStorage.removeItem(COACH_ROADMAP_ENTRY_SESSION_KEY);
        setCoachFinalReportId(null);
        setCoachJourneyView("journey");
        router.replace("/coach", { scroll: false });
        return;
      }
      sessionStorage.setItem(COACH_WELCOME_ENTRY_SESSION_KEY, "1");
      setCoachFinalReportId(null);
      setCoachJourneyView("welcome");
      router.replace("/coach", { scroll: false });
      return;
    }
    if (is("journey")) {
      sessionStorage.removeItem(COACH_WELCOME_ENTRY_SESSION_KEY);
      sessionStorage.removeItem(COACH_ROADMAP_ENTRY_SESSION_KEY);
      setCoachFinalReportId(null);
      setCoachJourneyView("journey");
      router.replace("/coach", { scroll: false });
      return;
    }
    if (is("roadmap")) {
      if (sessionStorage.getItem(COACH_WELCOME_ENTRY_SESSION_KEY) !== "1") {
        setCoachFinalReportId(null);
        setCoachJourneyView("journey");
        router.replace("/coach", { scroll: false });
        return;
      }
      sessionStorage.setItem(COACH_ROADMAP_ENTRY_SESSION_KEY, "1");
      setCoachFinalReportId(null);
      setCoachJourneyView("roadmap");
      router.replace("/coach", { scroll: false });
      return;
    }
    if (is("final")) {
      const rid = searchParams.get("report")?.trim();
      if (rid && typeof window !== "undefined") {
        if (getReportById(rid)) {
          sessionStorage.removeItem(COACH_WELCOME_ENTRY_SESSION_KEY);
          sessionStorage.removeItem(COACH_ROADMAP_ENTRY_SESSION_KEY);
          setCoachFinalReportId(rid);
          setCoachJourneyView("final");
          router.replace("/coach", { scroll: false });
          return;
        }
      }
      setCoachFinalReportId(null);
      setCoachJourneyView("journey");
      router.replace("/coach", { scroll: false });
      return;
    }

    const hasWelcomeEntry = sessionStorage.getItem(COACH_WELCOME_ENTRY_SESSION_KEY) === "1";
    const hasRoadmapEntry = sessionStorage.getItem(COACH_ROADMAP_ENTRY_SESSION_KEY) === "1";
    if (coachJourneyView === "welcome" && !hasWelcomeEntry) {
      setCoachJourneyView("journey");
      return;
    }
    if (coachJourneyView === "roadmap" && !hasRoadmapEntry) {
      setCoachJourneyView("journey");
    }
  }, [
    searchParams,
    router,
    setCoachJourneyView,
    setCoachFinalReportId,
    coachJourneyView,
    roleProfile,
  ]);

  useEffect(() => {
    if (coachJourneyView !== "final") return;
    if (!coachFinalReportId || typeof window === "undefined") {
      setCoachJourneyView("journey");
      return;
    }
    if (!getReportById(coachFinalReportId)) {
      setCoachFinalReportId(null);
      setCoachJourneyView("journey");
    }
  }, [coachJourneyView, coachFinalReportId, pathname, setCoachJourneyView, setCoachFinalReportId]);

  const role = roleProfile?.targetRole?.trim() ?? "";
  const roleExperiences = useMemo(
    () => experiences.filter((e) => (e.role ?? "").trim() === role.trim()),
    [experiences, role],
  );

  const trainingProgressForRole = useMemo(
    () => pickMostRecentForRole(trainingJourneyProgressMap, role),
    [trainingJourneyProgressMap, role],
  );

  const trainingContinue =
    typeof trainingProgressForRole?.percentComplete === "number" &&
    trainingProgressForRole.percentComplete > 0;
  const trainingPct =
    trainingContinue && trainingProgressForRole
      ? Math.min(100, Math.max(0, trainingProgressForRole.percentComplete))
      : 0;

  const roleOptions = useMemo(() => {
    const set = new Set<string>(ROLE_SUGGESTIONS as unknown as string[]);
    if (role) set.add(role);
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [role]);

  const storyDraftDocument = useMemo<StoryboardDraftDocument>(() => {
    if (!role) return createStoryboardDraft("");
    const raw = draftStore.byRole[role] ?? createStoryboardDraft(role);
    return normalizeStoryboardDocument(raw);
  }, [draftStore, role]);

  const storyOverallScore = useMemo(
    () => overallCompetencyStrength(storyDraftDocument),
    [storyDraftDocument],
  );

  /** Draft mean of competencies; if 0, use latest mock report overall for this role (matches Storyboard). */
  const storyScoreForCard = useMemo(() => {
    if (storyOverallScore > 0) return storyOverallScore;
    const fromReport = latestReportOverallForRole(role);
    if (fromReport != null && Number.isFinite(fromReport)) return fromReport;
    return storyOverallScore;
  }, [storyOverallScore, role, latestInterviewReport]);

  const { hasCraftedStoryboard, hasCreatedStoryboard } = useMemo(
    () =>
      deriveJourneySignals({
        role,
        fromCraft,
        roleExperienceCount: roleExperiences.length,
        storyOverallScore,
      }),
    [role, fromCraft, storyOverallScore, roleExperiences.length],
  );

  function handleRoleChange(nextTargetRole: string) {
    const trimmed = nextTargetRole.trim();
    setRoleProfile((prev) => {
      if (!trimmed && !prev) return null;
      if (!prev) {
        return { targetRole: trimmed, createdAt: new Date().toISOString() };
      }
      return { ...prev, targetRole: trimmed };
    });
  }

  return (
    <AppShell>
      <CoachFloatingNav />
      <div className="flex min-h-[70vh] flex-col items-start justify-start pb-44">
        <div className="mx-auto mt-0 flex w-full max-w-[840px] flex-row items-center justify-center gap-6 px-6">
          <div
            className={cn(
              "flex min-h-0 min-w-0 h-full w-full flex-col items-start justify-center gap-0 text-left lg:flex-none lg:self-start",
              "lg:w-full",
            )}
          >
            {showWelcomeLanding ? (
              <>
                <h2 className="text-agent-heading text-heading-teal">Welcome to Proofdive</h2>
                <h4 className="mt-1 mb-[14px] text-agent-question text-text-primary">
                  Let&apos;s get interview ready
                </h4>
                <p className="mt-2 max-w-xl text-left text-body leading-7 text-text-secondary">
                  Choose a path to get started.
                </p>
                <div className="mt-8 grid w-full max-w-xl grid-cols-1 gap-4 sm:grid-cols-2">
                  <CardButton
                    href="/storyboard"
                    variant="primary"
                    icon={<BookOpen />}
                    title="Storyboard"
                    subtitle="Turn your experience into proof"
                    illustrationSrc="/brand/illustration-1.svg"
                  />
                  <CardButton
                    href="/coach?roadmap=1"
                    variant="gray"
                    icon={<Map />}
                    title="Roadmap"
                    subtitle="Get a personalized prep plan"
                    illustrationSrc="/brand/illustration-2.svg"
                  />
                </div>
                {readinessNoteBanner}
                {readinessCardEl}
              </>
            ) : showJourneyColumn ? (
              <>
                <h2 className="text-agent-heading text-heading-teal">
                  {(() => {
                    const isFirstStart = readinessSourceReport?.meta.heroVariant === "first_start";
                    if (isRoadmapCoach) return "Here is your guided journey";
                    if (isFinalCoach) return isFirstStart ? "You're off to a strong start." : "Good news, you're improving.";
                    return "You're off to a strong start.";
                  })()}
                </h2>
                <h4 className="mt-1 mb-[14px] text-agent-question text-text-primary">
                  {(() => {
                    const isFirstStart = readinessSourceReport?.meta.heroVariant === "first_start";
                    if (isRoadmapCoach) return "Follow the path, then go for your mock interview.";
                    if (isFinalCoach) return isFirstStart
                      ? "Let's start building a story that'll help you improve."
                      : "Focus on your weaker areas to get it done.";
                    return "Let's start building a story that'll help you improve.";
                  })()}
                </h4>
                {readinessNoteBanner}
                {readinessCardEl}
                <div className="mt-4 w-full pt-0">
                  {!isRoadmapCoach ? (
                    <p className="w-full text-left text-body-lg leading-7 text-text-secondary">
                      {(() => {
                        const isFirstStart = readinessSourceReport?.meta.heroVariant === "first_start";
                        if (isFinalCoach) {
                          return isFirstStart
                            ? "Complete the guided journey to help you improve."
                            : "Based on your last session, let’s focus on strengthening your execution and depth.";
                        }
                        return "Based on your last session, AI coach identified the areas to work on.";
                      })()}
                    </p>
                  ) : null}

                  <Card className={cn("w-full", isRoadmapCoach ? "mt-0" : "mt-6")}>
                    <CardContent className="flex w-full flex-col">
                      <div className="w-full py-4 first:pt-0 last:pb-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex min-w-0 flex-1 items-start gap-4">
                            <span
                              aria-hidden
                              className="flex shrink-0 self-stretch items-center text-[length:var(--text-h1-size)] font-normal leading-none tracking-[var(--text-h1-tracking)] tabular-nums text-brand-800"
                            >
                              1
                            </span>
                            <div className="min-w-0 flex-1">
                              {(() => {
                                const isFirstStart = readinessSourceReport?.meta.heroVariant === "first_start";
                                const isSecondInterview = isFinalCoach && !isFirstStart;
                                const showFirstStartProgress = Boolean(
                                  coachJourneyView === "journey" && isFirstStart && trainingContinue,
                                );

                                const title = isSecondInterview
                                  ? "Strengthen how you take action"
                                  : "Train with essential interview guides";

                                const subtitle = isSecondInterview
                                  ? "Work on turning ideas into clear, outcome-driven execution."
                                  : "Learn the fundamentals with guided practice.";

                                const showActionBadge = isSecondInterview;

                                if (trainingContinue) {
                                  return (
                                    <>
                                      <h3 className="text-h5">
                                        {showActionBadge ? (
                                          <span className="inline-flex items-center gap-2">
                                            <span>{title}</span>
                                            <Badge variant="secondary">Action</Badge>
                                          </span>
                                        ) : (
                                          title
                                        )}
                                      </h3>
                                      <p className="mt-1.5 text-body-sm leading-6 text-text-secondary">{subtitle}</p>
                                      {showFirstStartProgress ? (
                                        <>
                                          <ProgressBar
                                            className="mt-4 h-2.5 max-w-md"
                                            value={trainingPct}
                                            aria-label="Training progress"
                                          />
                                          <p className="mt-2 text-overline tabular-nums text-text-secondary">
                                            {Math.round(trainingPct)}% done
                                          </p>
                                        </>
                                      ) : null}
                                    </>
                                  );
                                }
                                return (
                                  <>
                                    <h3 className="text-h5">
                                      {showActionBadge ? (
                                        <span className="inline-flex items-center gap-2">
                                          <span>{title}</span>
                                          <Badge variant="secondary">Action</Badge>
                                        </span>
                                      ) : (
                                        title
                                      )}
                                    </h3>
                                    <p className="mt-1.5 text-body-sm leading-6 text-text-secondary">{subtitle}</p>
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                          <Button asChild variant="link" className="h-auto shrink-0 px-0">
                            <Link href="/training">
                              {(() => {
                                const isFirstStart = readinessSourceReport?.meta.heroVariant === "first_start";
                                const isSecondInterview = isFinalCoach && !isFirstStart;
                                if (isSecondInterview) return "Start learning";
                                if (coachJourneyView === "journey" && isFirstStart && trainingContinue) {
                                  return "Continue learning";
                                }
                                return "Start learning";
                              })()}
                              <ArrowUpRight />
                            </Link>
                          </Button>
                        </div>
                      </div>

                      <Separator />

                      <div className="w-full py-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex min-w-0 flex-1 items-start gap-4">
                            <span
                              aria-hidden
                              className="flex shrink-0 self-stretch items-center text-[length:var(--text-h1-size)] font-normal leading-none tracking-[var(--text-h1-tracking)] tabular-nums text-brand-800"
                            >
                              2
                            </span>
                            <div className="min-w-0 flex-1">
                              {hasCraftedStoryboard ? (
                                <>
                                  <h3 className="text-h5">
                                    {(() => {
                                      const isFirstStart = readinessSourceReport?.meta.heroVariant === "first_start";
                                      const isSecondInterview = isFinalCoach && !isFirstStart;
                                      return isSecondInterview ? "Improve your story" : "Craft your story";
                                    })()}
                                  </h3>
                                  <p className="mt-1.5 text-body-sm leading-6 text-text-secondary">
                                    {(() => {
                                      const isFirstStart = readinessSourceReport?.meta.heroVariant === "first_start";
                                      const isSecondInterview = isFinalCoach && !isFirstStart;
                                      if (!isSecondInterview) {
                                        return (
                                          <>
                                            Turn your experience into clear, structured answers.
                                          </>
                                        );
                                      }
                                      return (
                                        <>
                                          Add more depth around your{" "}
                                          <span className="font-semibold text-text-primary">decisions</span>,{" "}
                                          <span className="font-semibold text-text-primary">actions</span>, and{" "}
                                          <span className="font-semibold text-text-primary">impact</span>.
                                        </>
                                      );
                                    })()}
                                  </p>
                                  <div className="mt-3 flex flex-wrap items-baseline gap-2">
                                    <span className="text-caption text-text-secondary">
                                      Here is your story score
                                    </span>
                                    <span className="text-h5 leading-none tabular-nums text-text-primary">
                                      {storyScoreForCard > 0 ? storyScoreForCard.toFixed(1) : "—"}
                                    </span>
                                    <span className="text-caption tabular-nums text-text-secondary">/ 5</span>
                                  </div>
                                </>
                              ) : hasCreatedStoryboard ? (
                                <>
                                  <h3 className="text-h5">
                                    {(() => {
                                      const isFirstStart = readinessSourceReport?.meta.heroVariant === "first_start";
                                      const isSecondInterview = isFinalCoach && !isFirstStart;
                                      return isSecondInterview ? "Improve your story" : "Craft your story";
                                    })()}
                                  </h3>
                                  <p className="mt-1.5 text-body-sm leading-6 text-text-secondary">
                                    Turn your experience into clear, structured answers. Add more detail to raise your story
                                    score.
                                  </p>
                                  <div className="mt-3 flex flex-wrap items-baseline gap-2">
                                    <span className="text-caption text-text-secondary">
                                      Overall story score
                                    </span>
                                    <span className="text-h5 leading-none tabular-nums text-text-primary">
                                      {storyScoreForCard > 0 ? storyScoreForCard.toFixed(1) : "—"}
                                    </span>
                                    <span className="text-caption tabular-nums text-text-secondary">/ 5</span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <h3 className="text-h5">
                                    {(() => {
                                      const isFirstStart = readinessSourceReport?.meta.heroVariant === "first_start";
                                      const isSecondInterview = isFinalCoach && !isFirstStart;
                                      return isSecondInterview ? "Improve your story" : "Craft your story";
                                    })()}
                                  </h3>
                                  <p className="mt-1.5 text-body-sm leading-6 text-text-secondary">
                                    Turn your experience into clear, structured answers.
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-4">
                            <Button asChild variant="link" className="h-auto px-0">
                              <Link href="/storyboard">
                                {(() => {
                                  const isFirstStart = readinessSourceReport?.meta.heroVariant === "first_start";
                                  const isSecondInterview = isFinalCoach && !isFirstStart;
                                  return isSecondInterview ? "Add more" : "Start crafting";
                                })()}
                                <ArrowUpRight />
                              </Link>
                            </Button>
                            <Button asChild variant="link" className="h-auto px-0 text-text-secondary">
                              <Link href="/storyboard?new=1">
                                <Plus />
                                Add experience
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="w-full py-4 last:pb-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex min-w-0 flex-1 items-start gap-4">
                            <span
                              aria-hidden
                              className="flex shrink-0 self-stretch items-center text-[length:var(--text-h1-size)] font-normal leading-none tracking-[var(--text-h1-tracking)] tabular-nums text-brand-800"
                            >
                              3
                            </span>
                            <div className="min-w-0">
                              <h3 className="text-h5">
                                {(() => {
                                  const isFirstStart = readinessSourceReport?.meta.heroVariant === "first_start";
                                  const isSecondInterview = isFinalCoach && !isFirstStart;
                                  return isSecondInterview ? "Practice with a focused mock" : "Take a mock interview";
                                })()}
                              </h3>
                              <p className="mt-1.5 text-body-sm leading-6 text-text-secondary">
                                {(() => {
                                  const isFirstStart = readinessSourceReport?.meta.heroVariant === "first_start";
                                  const isSecondInterview = isFinalCoach && !isFirstStart;
                                  if (!isSecondInterview) {
                                    return <>Practice with a 30-minute, real-world interview.</>;
                                  }
                                  return (
                                    <>
                                      Try a short interview focused on{" "}
                                      <span className="font-semibold text-text-primary">Action</span> and{" "}
                                      <span className="font-semibold text-text-primary">Mastery</span> pillars.
                                    </>
                                  );
                                })()}
                              </p>
                            </div>
                          </div>
                          <Button asChild variant="link" className="h-auto shrink-0 px-0">
                            <Link href="/interview?welcomeBack=1">
                              Start interview
                              <ArrowUpRight />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <CoachConversationalDock
        quickChips={COACH_AI_QUICK_CHIPS}
        onAdoptPlannedRole={(r) => handleRoleChange(r)}
      />
    </AppShell>
  );
}
