"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowUpRight, BookOpen, Info, Map } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { CoachFloatingNav } from "@/components/CoachFloatingNav";
import { cn } from "@/components/cn";
import { CoachConversationalDock } from "@/components/coach/CoachConversationalDock";
import type { ChatComposerQuickChip } from "@/components/chat/ChatComposer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CardButton } from "@/components/ui/card-button";
import { IconButton } from "@/components/ui/icon-button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Separator } from "@/components/ui/separator";
import {
  createStoryboardDraft,
  normalizeStoryboardDocument,
  overallCompetencyStrength,
  type StoryboardDraftDocument,
  type StoryboardDraftStore,
} from "@/lib/storyboardDraft";
import { reportCountForRole } from "@/lib/proofdiveLogic";
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
  { label: "Ask for Guidance", value: "What guidance do you have for my interview prep journey?" },
];

/** Session-only: this tab used `?welcome=1` (onboarding / interview skip). Used so stale localStorage `welcome` does not show on plain `/coach`. */
const COACH_WELCOME_ENTRY_SESSION_KEY = "proofdive.session.coachWelcomeEntry.v1";
/** Session-only: this tab used `?roadmap=1` after welcome (prep roadmap). */
const COACH_ROADMAP_ENTRY_SESSION_KEY = "proofdive.session.coachRoadmapEntry.v1";

const READINESS_MAX = 5;

const DRIVER_ORDER = ["thinking", "action", "people", "mastery"] as const;

function pillarTitle(id: (typeof DRIVER_ORDER)[number]): string {
  if (id === "thinking") return "Power of Thinking";
  if (id === "action") return "Power of Action";
  if (id === "people") return "Power of People";
  return "Power of Mastery";
}

function pillarTooltip(id: (typeof DRIVER_ORDER)[number]): string {
  if (id === "thinking") return "Clarity of thinking: structure, prioritization, and sound judgment under pressure.";
  if (id === "action") return "Execution: ownership, speed, and delivering outcomes with constraints.";
  if (id === "people") return "Collaboration: communication, influence, and working effectively with others.";
  return "Craft mastery: role fundamentals, depth, and consistent high-quality work.";
}

function safeParseReportsMap(raw: string | null): Record<string, InterviewReport> {
  try {
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, InterviewReport>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function pickLatestReport(map: Record<string, InterviewReport>): InterviewReport | null {
  const list = Object.values(map);
  if (list.length === 0) return null;
  return [...list].sort(
    (a, b) => new Date(b.meta.createdAt).getTime() - new Date(a.meta.createdAt).getTime(),
  )[0] ?? null;
}

function latestReportOverallForRole(roleTitle: string): number | null {
  if (typeof window === "undefined" || !roleTitle.trim()) return null;
  const map = safeParseReportsMap(window.localStorage.getItem(StorageKeys.reports));
  const list = Object.values(map).filter(
    (r) => (r.meta?.roleTitle ?? "").trim() === roleTitle.trim(),
  );
  if (!list.length) return null;
  return (
    [...list].sort(
      (a, b) => new Date(b.meta.createdAt).getTime() - new Date(a.meta.createdAt).getTime(),
    )[0]?.overallScore ?? null
  );
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

function useLatestInterviewReport(): InterviewReport | null {
  const pathname = usePathname();
  const [latest, setLatest] = useState<InterviewReport | null>(null);

  const refresh = useCallback(() => {
    if (typeof window === "undefined") return;
    const map = safeParseReportsMap(window.localStorage.getItem(StorageKeys.reports));
    setLatest(pickLatestReport(map));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh, pathname]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === StorageKeys.reports || e.key === null) refresh();
    };
    const onVis = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [refresh]);

  return latest;
}

function coachScoreBand(score: number): "red" | "amber" | "green" {
  if (score >= 3.5) return "green";
  if (score >= 2.5) return "amber";
  return "red";
}

function coachReadinessBadgeClasses(label: ReadinessLabel) {
  if (label === "Ready") return "border-scoring-green/20 bg-scoring-green/15 text-scoring-green";
  if (label === "Borderline") return "border-scoring-yellow/20 bg-scoring-yellow/15 text-scoring-yellow";
  return "border-scoring-red/20 bg-scoring-red/15 text-scoring-red";
}

function coachScoreTextClasses(score: number) {
  const b = coachScoreBand(score);
  if (b === "green") return "text-scoring-green";
  if (b === "amber") return "text-scoring-yellow";
  return "text-scoring-red";
}

function coachScoreBarClasses(score: number) {
  const b = coachScoreBand(score);
  if (b === "green") return "bg-scoring-green border-scoring-green";
  if (b === "amber") return "bg-scoring-yellow border-scoring-yellow";
  return "bg-scoring-red border-scoring-red";
}

const ROLE_SUGGESTIONS = [
  "Product Manager",
  "Software Engineer",
  "Data Analyst",
  "UX Designer",
  "Project Manager",
] as const;


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
          "w-max max-w-[240px] whitespace-normal rounded-xl bg-black px-3 py-2 text-caption leading-4 text-white shadow-lg",
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

  const latestInterviewReport = useLatestInterviewReport();
  const readinessSourceReport = useMemo(() => {
    if (coachJourneyView === "final") {
      if (!coachFinalReportId || typeof window === "undefined") return null;
      const map = safeParseReportsMap(window.localStorage.getItem(StorageKeys.reports));
      return map[coachFinalReportId] ?? null;
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
    const overallTextClass =
      overall == null ? "text-text-secondary" : coachScoreTextClasses(journeyReadinessSnapshot?.overall ?? 0);

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

    return { pillars, overall, overallText, overallTextClass, bandText, bandClass, noteText };
  }, [interviewReadinessEmpty, journeyReadinessSnapshot]);

  const readinessCardEl = useMemo(() => {
    if (!showInterviewReadinessCard) return null;
    return (
      <Card className="mt-6 w-full">
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-h6">Interview readiness</h3>
            <p className="mt-1 text-caption text-text-secondary">
              Mocks, trainings, and pillar balance at a glance.
            </p>
          </div>
          <IconButton asChild variant="ghost" aria-label="Open report">
            <Link href={readinessSourceReport?.meta?.id ? `/report/${readinessSourceReport.meta.id}` : "/report"}>
              <ArrowUpRight />
            </Link>
          </IconButton>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 lg:flex-1">
              <div className="flex shrink-0 flex-wrap items-end justify-start gap-1">
                <span
                  className={cn(
                    "text-h2 font-extrabold leading-none tabular-nums",
                    readinessCardModel.overallTextClass,
                  )}
                >
                  {readinessCardModel.overallText}
                </span>
                <span className="pb-1.5 text-body-lg text-text-secondary tabular-nums">
                  /{READINESS_MAX.toFixed(1)}
                </span>
              </div>

              <p className="mt-4 flex flex-wrap items-center gap-3 text-body leading-6 text-text-secondary">
                You’re currently on{" "}
                <Badge variant="outline" className={cn("text-body", readinessCardModel.bandClass)}>
                  {readinessCardModel.bandText}
                </Badge>
              </p>

              {readinessCardModel.noteText ? (
                <p className="mt-5 text-body leading-7 text-text-secondary">{readinessCardModel.noteText}</p>
              ) : null}
            </div>

            <div className="lg:w-[360px] lg:shrink-0">
              <div className="mt-2 space-y-4 lg:mt-0">
                {readinessCardModel.pillars.map(({ id, label, score }) => (
                  <div key={id}>
                    <div className="flex items-baseline justify-between gap-3">
                      <div className="min-w-0 text-caption flex items-center gap-1">
                        <span className="min-w-0 truncate">{label}</span>
                        <PillarInfoIcon tooltip={pillarTooltip(id)} />
                      </div>
                      <div
                        className={cn(
                          "shrink-0 text-caption tabular-nums",
                          score == null ? "text-text-secondary" : coachScoreTextClasses(score),
                        )}
                      >
                        {score == null ? "--" : score.toFixed(1)}
                      </div>
                    </div>
                    <ProgressBar
                      className="mt-2 h-1.5"
                      value={score == null ? 0 : (score / READINESS_MAX) * 100}
                      indicatorClassName={score == null ? "bg-border" : coachScoreBarClasses(score)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }, [readinessCardModel, readinessSourceReport?.meta?.id, showInterviewReadinessCard]);

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
        const map = safeParseReportsMap(window.localStorage.getItem(StorageKeys.reports));
        if (map[rid]) {
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
    const map = safeParseReportsMap(window.localStorage.getItem(StorageKeys.reports));
    if (!map[coachFinalReportId]) {
      setCoachFinalReportId(null);
      setCoachJourneyView("journey");
    }
  }, [coachJourneyView, coachFinalReportId, pathname, setCoachJourneyView, setCoachFinalReportId]);

  const role = roleProfile?.targetRole?.trim() ?? "";
  const roleExperiences = useMemo(
    () => experiences.filter((e) => (e.role ?? "").trim() === role.trim()),
    [experiences, role],
  );
  const experienceBankPreviewTitles = useMemo(
    () =>
      roleExperiences
        .slice(0, 2)
        .map((e) => e.title?.trim())
        .filter((t): t is string => Boolean(t)),
    [roleExperiences],
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

  const hasCreatedStoryboard = useMemo(() => {
    if (!role) return false;
    if (fromCraft && fromCraft.v === 1 && fromCraft.role === role) return true;
    if (roleExperiences.length > 0) return true;
    return storyOverallScore > 0;
  }, [role, fromCraft, storyOverallScore, roleExperiences.length]);

  const hasCraftedStoryboard = useMemo(() => {
    return Boolean(fromCraft && fromCraft.v === 1 && fromCraft.role === role);
  }, [fromCraft, role]);

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
                <h2 className="text-h3 leading-[52px]">Welcome to Proofdive</h2>
                <h4 className="mt-1 mb-[14px] text-h4 leading-[52px]">
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
                    title="Build your Storyboard"
                    subtitle="Turn your experience into proof"
                  />
                  <CardButton
                    href="/coach?roadmap=1"
                    variant="gray"
                    icon={<Map />}
                    title="Plan my roadmap"
                    subtitle="Get a personalized prep plan"
                  />
                </div>
                {readinessCardEl}
              </>
            ) : showJourneyColumn ? (
              <>
                <h2 className="text-h3 leading-[52px]">
                  {(() => {
                    const isFirstStart = readinessSourceReport?.meta.heroVariant === "first_start";
                    if (isRoadmapCoach) return "Here is your guided journey";
                    if (isFinalCoach) return isFirstStart ? "You're off to a strong start." : "Good news, you're improving.";
                    return "You're off to a strong start.";
                  })()}
                </h2>
                <h4 className="mt-1 mb-[14px] text-h4 leading-[52px]">
                  {(() => {
                    const isFirstStart = readinessSourceReport?.meta.heroVariant === "first_start";
                    if (isRoadmapCoach) return "Follow the path, then go for your mock interview.";
                    if (isFinalCoach) return isFirstStart
                      ? "Let's start building a story that'll help you improve."
                      : "Focus on your weaker areas to get it done.";
                    return "Let's start building a story that'll help you improve.";
                  })()}
                </h4>
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
                          <div className="min-w-0 flex-1">
                            {(() => {
                              const isFirstStart = readinessSourceReport?.meta.heroVariant === "first_start";
                              const isSecondInterview = isFinalCoach && !isFirstStart;
                              const showFirstStartProgress = Boolean(
                                coachJourneyView === "journey" && isFirstStart && trainingContinue,
                              );

                              const title = isSecondInterview
                                ? "1. Strengthen how you take action"
                                : "1. Train with essential interview guides";

                              const subtitle = isSecondInterview
                                ? "Work on turning ideas into clear, outcome-driven execution."
                                : "Learn the fundamentals with guided practice.";

                              const showActionBadge = isSecondInterview;

                              if (trainingContinue) {
                                return (
                                  <>
                                    <h3 className="text-h6">
                                      {showActionBadge ? (
                                        <span className="inline-flex items-center gap-2">
                                          <span>{title}</span>
                                          <Badge variant="secondary">Action</Badge>
                                        </span>
                                      ) : (
                                        title
                                      )}
                                    </h3>
                                    <p className="mt-2 text-body-sm leading-6 text-text-secondary">{subtitle}</p>
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
                                  <h3 className="text-h6">
                                    {showActionBadge ? (
                                      <span className="inline-flex items-center gap-2">
                                        <span>{title}</span>
                                        <Badge variant="secondary">Action</Badge>
                                      </span>
                                    ) : (
                                      title
                                    )}
                                  </h3>
                                  <p className="mt-2 text-body-sm leading-6 text-text-secondary">{subtitle}</p>
                                </>
                              );
                            })()}
                          </div>
                          <Button asChild variant="outline">
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
                          <div className="min-w-0 flex-1">
                            {hasCraftedStoryboard ? (
                              <>
                                <h3 className="text-h6">
                                  {(() => {
                                    const isFirstStart = readinessSourceReport?.meta.heroVariant === "first_start";
                                    const isSecondInterview = isFinalCoach && !isFirstStart;
                                    return isSecondInterview ? "2. Improve your story" : "2. Craft your story";
                                  })()}
                                </h3>
                                <p className="mt-2 text-body-sm leading-6 text-text-secondary">
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
                                <h3 className="text-h6">
                                  {(() => {
                                    const isFirstStart = readinessSourceReport?.meta.heroVariant === "first_start";
                                    const isSecondInterview = isFinalCoach && !isFirstStart;
                                    return isSecondInterview ? "2. Improve your story" : "2. Craft your story";
                                  })()}
                                </h3>
                                <p className="mt-2 text-body-sm leading-6 text-text-secondary">
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
                                <h3 className="text-h6">
                                  {(() => {
                                    const isFirstStart = readinessSourceReport?.meta.heroVariant === "first_start";
                                    const isSecondInterview = isFinalCoach && !isFirstStart;
                                    return isSecondInterview ? "2. Improve your story" : "2. Craft your story";
                                  })()}
                                </h3>
                                <p className="mt-2 text-body-sm leading-6 text-text-secondary">
                                  Turn your experience into clear, structured answers.
                                </p>
                              </>
                            )}
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            {hasCraftedStoryboard ? (
                              <Button asChild variant="outline">
                                <Link href="/storyboard?new=1">
                                  Add another experience
                                  <ArrowUpRight />
                                </Link>
                              </Button>
                            ) : (
                              <>
                                <Button asChild variant="outline">
                                  <Link href="/storyboard">
                                    {(() => {
                                      const isFirstStart = readinessSourceReport?.meta.heroVariant === "first_start";
                                      const isSecondInterview = isFinalCoach && !isFirstStart;
                                      return isSecondInterview ? "Add more" : "Start crafting";
                                    })()}
                                    <ArrowUpRight />
                                  </Link>
                                </Button>
                                {hasCreatedStoryboard ? (
                                  <Button asChild variant="outline">
                                    <Link href="/storyboard?new=1">
                                      {(() => {
                                        const isFirstStart = readinessSourceReport?.meta.heroVariant === "first_start";
                                        const isSecondInterview = isFinalCoach && !isFirstStart;
                                        return isSecondInterview ? "Add more" : "Add another experience";
                                      })()}
                                      <ArrowUpRight />
                                    </Link>
                                  </Button>
                                ) : null}
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="w-full py-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <h3 className="text-h6">Experience bank</h3>
                            <p className="mt-2 text-body-sm leading-6 text-text-secondary">
                              {roleExperiences.length ? (
                                <>
                                  {roleExperiences.length} experience{roleExperiences.length === 1 ? "" : "s"}{" "}
                                  captured for {role || "this role"}
                                  {experienceBankPreviewTitles.length ? (
                                    <>, including “{experienceBankPreviewTitles.join("”, “")}”.</>
                                  ) : (
                                    "."
                                  )}
                                </>
                              ) : (
                                "Nothing captured yet. Add your first experience to start building proof."
                              )}
                            </p>
                          </div>
                          <Button asChild variant="outline">
                            <Link href="/storyboard">
                              {roleExperiences.length ? "Open Storyboard" : "Add an experience"}
                              <ArrowUpRight />
                            </Link>
                          </Button>
                        </div>
                      </div>

                      <Separator />

                      <div className="w-full py-4 last:pb-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className="text-h6">
                              {(() => {
                                const isFirstStart = readinessSourceReport?.meta.heroVariant === "first_start";
                                const isSecondInterview = isFinalCoach && !isFirstStart;
                                return isSecondInterview ? "3. Practice with a focused mock" : "3. Take a mock interview";
                              })()}
                            </h3>
                            <p className="mt-2 text-body-sm leading-6 text-text-secondary">
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
                          <Button asChild>
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
