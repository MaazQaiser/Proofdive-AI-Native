"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { CardBody, GlassCard } from "@/components/Card";
import { CoachFloatingNav } from "@/components/CoachFloatingNav";
import { cn } from "@/components/cn";
import { CoachConversationalDock } from "@/components/coach/CoachConversationalDock";
import type { ChatComposerQuickChip } from "@/components/chat/ChatComposer";
import {
  createStoryboardDraft,
  normalizeStoryboardDocument,
  overallCompetencyStrength,
  type StoryboardDraftDocument,
  type StoryboardDraftStore,
} from "@/lib/storyboardDraft";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import type {
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
  if (label === "Ready") return "bg-emerald-500/15 text-emerald-900 border border-emerald-500/20";
  if (label === "Borderline") return "bg-amber-500/15 text-amber-900 border border-amber-500/20";
  return "bg-rose-500/15 text-rose-900 border border-rose-500/20";
}

function coachScoreTextClasses(score: number) {
  const b = coachScoreBand(score);
  if (b === "green") return "text-emerald-700";
  if (b === "amber") return "text-amber-700";
  return "text-rose-700";
}

function coachScoreBarClasses(score: number) {
  const b = coachScoreBand(score);
  if (b === "green") return "bg-emerald-500";
  if (b === "amber") return "bg-amber-500";
  return "bg-rose-500";
}

const ROLE_SUGGESTIONS = [
  "Product Manager",
  "Software Engineer",
  "Data Analyst",
  "UX Designer",
  "Project Manager",
] as const;

const ROLE_SELECT_CHEVRON =
  "data:image/svg+xml," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path d='M1.25 1.75L5 4.75L8.75 1.75' fill='none' stroke='black' stroke-opacity='0.4' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/></svg>",
  );

/** Heroicons 24 outline: arrow-up-right (Tailwind design system) */
function ArrowUpRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M4.5 19.5L19.5 4.5M19.5 4.5H9.75M19.5 4.5V9.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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
  const [trainingJourneyProgress] = useLocalStorageState<TrainingJourneyProgress | null>(
    StorageKeys.trainingProgress,
    null,
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

  useEffect(() => {
    const is = (k: string) => {
      const v = searchParams.get(k);
      return v === "1" || v?.toLowerCase() === "true";
    };
    if (is("welcome")) {
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

  const trainingProgressForRole = useMemo(() => {
    if (!trainingJourneyProgress) return null;
    if (trainingJourneyProgress.roleKey && trainingJourneyProgress.roleKey !== role) return null;
    return trainingJourneyProgress;
  }, [trainingJourneyProgress, role]);

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
    return storyOverallScore > 0;
  }, [role, fromCraft, storyOverallScore]);

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
        <div className="mx-auto mt-[64px] flex w-full max-w-[960px] flex-row items-center justify-center gap-6">
          <div
            className={cn(
              "flex min-h-0 min-w-0 h-full w-full flex-col items-start justify-center gap-0 text-left lg:flex-none lg:self-start",
              showInterviewReadinessCard ? "lg:w-3/5" : "lg:w-full",
            )}
          >
            <div className="mb-6 flex w-full flex-col justify-start items-start gap-0.5 sm:mb-8">
              <div className="flex w-full max-w-xl flex-col items-stretch gap-0 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:gap-0">
                <p className="text-base leading-7 text-[var(--app-muted)] sm:shrink-0 sm:pr-1">
                  Currently we are preparing for
                </p>
                <label className="sr-only" htmlFor="coach-target-role">
                  Target role
                </label>
                <div className="flex w-full min-w-0 items-start justify-center overflow-visible sm:w-auto sm:min-w-0 sm:justify-start">
                  <select
                    id="coach-target-role"
                    value={role}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="min-h-0 w-full min-w-0 cursor-pointer appearance-none overflow-visible border-0 bg-transparent py-0.5 pl-0 pr-5 text-left text-lg font-extrabold leading-snug tracking-tight shadow-none outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-[#3EC878]/40 focus-visible:ring-offset-0"
                    style={{
                      backgroundImage: `url("${ROLE_SELECT_CHEVRON}")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 0 center",
                      backgroundSize: "10px 6px",
                    }}
                  >
                    <option value="">Pick a role</option>
                    {roleOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {showWelcomeLanding ? (
              <>
                <h2 className="text-5xl font-extrabold leading-[52px] tracking-tight">Welcome to Proofdive</h2>
                <h4 className="mt-1 mb-[14px] text-[32px] font-semibold leading-[52px] tracking-tight">
                  Let&apos;s get interview ready
                </h4>
                <p className="mt-2 max-w-xl text-left text-lg leading-7 text-[var(--app-muted)]">
                  Choose a path to get started.
                </p>
                <div className="mt-8 flex w-full max-w-xl flex-col gap-4">
                  <Link
                    href="/interview?first=1"
                    className={cn(
                      "flex w-full items-center justify-between gap-4 rounded-2xl border border-white/60 bg-white/45 px-5 py-4 text-left shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition hover:bg-white/70",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3EC878]/40",
                    )}
                  >
                    <span className="text-base font-extrabold leading-6 tracking-tight text-gray-900">
                      Would you like to take a quick interview?
                    </span>
                    <ArrowUpRightIcon className="h-5 w-5 shrink-0 text-gray-500" />
                  </Link>
                  <Link
                    href="/coach?roadmap=1"
                    className={cn(
                      "flex w-full items-center justify-between gap-4 rounded-2xl border border-white/60 bg-white/45 px-5 py-4 text-left shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition hover:bg-white/70",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3EC878]/40",
                    )}
                  >
                    <span className="text-base font-extrabold leading-6 tracking-tight text-gray-900">
                      Plan a preparation road map for me
                    </span>
                    <ArrowUpRightIcon className="h-5 w-5 shrink-0 text-gray-500" />
                  </Link>
                </div>
              </>
            ) : showJourneyColumn ? (
              <>
                <h2 className="text-5xl font-extrabold leading-[52px] tracking-tight">
                  {isRoadmapCoach
                    ? "Here is your guided journey"
                    : isFinalCoach
                      ? readinessSourceReport?.meta.heroVariant === "first_start"
                        ? "You're off to a strong start."
                        : "Good news! You're improving"
                      : "You're off to a strong start."}
                </h2>
                <h4 className="mt-1 mb-[14px] text-[32px] font-semibold leading-[52px] tracking-tight">
                  {isRoadmapCoach
                    ? "Follow the path, then go for your mock interview."
                    : "A bit more refinement and you'll be interview-ready."}
                </h4>
                <div className="mt-4 w-full pt-0">
                  {!isRoadmapCoach ? (
                    <p className="max-w-xl text-left text-xl leading-7 text-[var(--app-muted)]">
                      {isFinalCoach
                        ? "Complete the guided journey — it will help you improve."
                        : "A guided journey by AI Coach to help you improve."}
                    </p>
                  ) : null}

                  <div
                    className={cn(
                      "flex w-full flex-col gap-y-6 gap-x-8",
                      isRoadmapCoach ? "mt-0" : "mt-6",
                    )}
                  >
                    <div className="w-full">
                      <CardBody className="p-0">
                        <div className="flex items-start justify-between gap-4 rounded-[20px] transition-colors hover:bg-white/70">
                          <div className="min-w-0 flex-1">
                            {trainingContinue ? (
                              <>
                                <h3 className="text-xl font-extrabold tracking-tight">
                                  1. Train with essential interview guides
                                </h3>
                                {trainingProgressForRole?.courseTitle ? (
                                  <p className="mt-2 text-sm font-semibold leading-5 text-[var(--app-muted)]">
                                    {trainingProgressForRole.courseTitle}
                                  </p>
                                ) : null}
                                <div
                                  className="mt-4 h-2.5 w-full max-w-md overflow-hidden rounded-full bg-black/10"
                                  role="progressbar"
                                  aria-valuenow={trainingPct}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                  aria-label="Training progress"
                                >
                                  <div
                                    className="h-full rounded-full bg-black transition-[width] duration-300 ease-out"
                                    style={{ width: `${trainingPct}%` }}
                                  />
                                </div>
                                <p className="mt-2 text-xs font-semibold tabular-nums text-[var(--app-muted)]">
                                  {trainingPct}% complete
                                </p>
                              </>
                            ) : (
                              <>
                                <h3 className="text-xl font-extrabold tracking-tight">
                                  1. Train with essential interview guides
                                </h3>
                                <p className="mt-2 text-base leading-6 text-[var(--app-muted)]">
                                  Learn the fundamentals with guided practice.
                                </p>
                              </>
                            )}
                          </div>
                          <Link
                            href="/training"
                            className={cn(
                              "inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-full px-5 text-base font-bold tracking-tight transition",
                              "bg-transparent text-gray-600 shadow-none hover:text-gray-900 hover:bg-white/70 active:bg-white",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3EC878]/40",
                            )}
                          >
                            {trainingContinue ? "Continue" : "Start learning"}
                            <ArrowUpRightIcon className="h-4 w-4 shrink-0" />
                          </Link>
                        </div>
                      </CardBody>
                    </div>
                    <div className="h-px w-full bg-slate-300" aria-hidden />

              <div className="w-full">
                <CardBody className="p-0">
                  <div className="flex items-start justify-between gap-4 rounded-[20px] transition-colors hover:bg-white/70">
                    <div className="min-w-0 flex-1">
                      {hasCreatedStoryboard ? (
                        <>
                          <h3 className="text-xl font-extrabold tracking-tight">2. Craft your story</h3>
                          <p className="mt-2 text-base leading-6 text-[var(--app-muted)]">
                            Turn your experience into clear, structured answers. Add more detail to raise your story
                            score.
                          </p>
                          <div className="mt-3 flex flex-wrap items-baseline gap-2">
                            <span className="text-sm font-bold tracking-tight text-gray-800">
                              Overall story score
                            </span>
                            <span className="text-2xl font-extrabold tabular-nums leading-none tracking-tight text-gray-900">
                              {storyScoreForCard > 0 ? storyScoreForCard.toFixed(1) : "—"}
                            </span>
                            <span className="text-sm font-extrabold tabular-nums text-gray-500">/ 5</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <h3 className="text-xl font-extrabold tracking-tight">2. Craft your story</h3>
                          <p className="mt-2 text-base leading-6 text-[var(--app-muted)]">
                            Turn your experience into clear, structured answers.
                          </p>
                        </>
                      )}
                    </div>
                    <Link
                      href={hasCreatedStoryboard ? "/storyboard" : "/storyboard/crafting"}
                      className={cn(
                        "inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-full px-5 text-base font-bold tracking-tight transition",
                        "bg-transparent text-gray-600 shadow-none hover:text-gray-900 hover:bg-white/70 active:bg-white",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3EC878]/40",
                      )}
                    >
                      {hasCreatedStoryboard ? "Continue crafting" : "Start crafting"}
                      <ArrowUpRightIcon className="h-4 w-4 shrink-0" />
                    </Link>
                  </div>
                </CardBody>
              </div>

                    <div className="h-px w-full bg-slate-300" aria-hidden />

                    <div className="w-full">
                      <CardBody className="p-0">
                        <div className="flex items-start justify-between gap-4 rounded-[20px] transition-colors hover:bg-white/70">
                          <div className="min-w-0">
                            <h3 className="text-xl font-extrabold tracking-tight">3. Take a mock interview</h3>
                            <p className="mt-2 text-base leading-6 text-[var(--app-muted)]">
                              Practice with a 30-minute, real-world interview.
                            </p>
                          </div>
                          <Link
                            href="/interview"
                            className={cn(
                              "inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-full px-5 text-base font-bold tracking-tight transition",
                              "bg-transparent text-gray-600 shadow-none hover:text-gray-900 hover:bg-white/70 active:bg-white",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3EC878]/40",
                            )}
                          >
                            Start interview
                            <ArrowUpRightIcon className="h-4 w-4 shrink-0" />
                          </Link>
                        </div>
                      </CardBody>
                    </div>
              </div>
            </div>
              </>
            ) : null}
          </div>

          {showInterviewReadinessCard ? (
            <GlassCard className="w-full lg:w-2/5 lg:flex-none">
              <div
                className="pointer-events-none absolute right-5 top-5 z-10 text-gray-400"
                aria-hidden
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7 17L17 7M17 7H10M17 7V14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <CardBody>
                <h3 className="text-2xl font-extrabold tracking-tight pr-10">Interview readiness</h3>
                {interviewReadinessEmpty ? (
                  <>
                    <p className="mt-2 text-base leading-6 text-[var(--app-muted)]">
                      Mocks, trainings, and pillar balance at a glance.
                    </p>

                    <div className="mt-8 flex flex-wrap items-end gap-1">
                      <span className="text-7xl font-extrabold leading-none tracking-tight text-gray-500 tabular-nums">
                        --
                      </span>
                      <span className="pb-1.5 text-xl font-extrabold tracking-tight text-gray-500 tabular-nums">
                        /{READINESS_MAX.toFixed(1)}
                      </span>
                    </div>

                    <p className="mt-4 flex flex-wrap items-center gap-3 text-base leading-6 text-[var(--app-muted)]">
                      You’re currently on{" "}
                      <span className="inline-flex min-w-[2.25rem] items-center justify-center rounded-full bg-rose-500/12 px-2.5 py-0.5 text-base font-extrabold tracking-tight text-[#e60000]">
                        --
                      </span>
                    </p>

                    <div className="mt-8 space-y-4">
                      {DRIVER_ORDER.map((id) => (
                        <div key={id}>
                          <div className="flex items-baseline justify-between gap-3">
                            <div className="min-w-0 text-sm font-bold tracking-tight">{pillarTitle(id)}</div>
                            <div className="shrink-0 text-sm font-extrabold tabular-nums text-gray-500">--</div>
                          </div>
                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/60">
                            <div className="h-full w-0 rounded-full bg-black/70" aria-hidden />
                          </div>
                        </div>
                      ))}
                    </div>

                    <p className="mt-5 text-base leading-7 text-[var(--app-muted)]">
                      Take your first mock interview to get your interview readiness score.
                    </p>
                  </>
                ) : journeyReadinessSnapshot ? (
                  <>
                    <p className="mt-2 text-base leading-6 text-[var(--app-muted)]">
                      Mocks, trainings, and pillar balance at a glance.
                    </p>

                    <div className="mt-8 flex flex-wrap items-end gap-1">
                      <span
                        className={cn(
                          "text-7xl font-extrabold leading-none tracking-tight tabular-nums",
                          coachScoreTextClasses(journeyReadinessSnapshot.overall),
                        )}
                      >
                        {journeyReadinessSnapshot.overall.toFixed(1)}
                      </span>
                      <span className="pb-1.5 text-xl font-extrabold tracking-tight text-gray-500 tabular-nums">
                        /{READINESS_MAX.toFixed(1)}
                      </span>
                    </div>

                    <p className="mt-4 flex flex-wrap items-center gap-3 text-base leading-6 text-[var(--app-muted)]">
                      You’re currently on{" "}
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-base font-extrabold tracking-tight",
                          coachReadinessBadgeClasses(journeyReadinessSnapshot.band),
                        )}
                      >
                        {journeyReadinessSnapshot.band}
                      </span>
                    </p>

                    <div className="mt-8 space-y-4">
                      {journeyReadinessSnapshot.pillars.map(({ id, label, score }) => (
                        <div key={id}>
                          <div className="flex items-baseline justify-between gap-3">
                            <div className="min-w-0 text-sm font-bold tracking-tight">{label}</div>
                            <div
                              className={cn(
                                "shrink-0 text-sm font-extrabold tabular-nums",
                                coachScoreTextClasses(score),
                              )}
                            >
                              {score.toFixed(1)}
                            </div>
                          </div>
                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/60">
                            <div
                              className={cn("h-full rounded-full", coachScoreBarClasses(score))}
                              style={{ width: `${Math.min(100, (score / READINESS_MAX) * 100)}%` }}
                              aria-hidden
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="mt-2 text-base leading-6 text-[var(--app-muted)]">
                      Mocks, trainings, and pillar balance at a glance.
                    </p>

                    <div className="mt-8 flex flex-wrap items-end gap-1">
                      <span className="text-7xl font-extrabold leading-none tracking-tight text-gray-500 tabular-nums">
                        --
                      </span>
                      <span className="pb-1.5 text-xl font-extrabold tracking-tight text-gray-500 tabular-nums">
                        /{READINESS_MAX.toFixed(1)}
                      </span>
                    </div>

                    <p className="mt-4 flex flex-wrap items-center gap-3 text-base leading-6 text-[var(--app-muted)]">
                      You’re currently on{" "}
                      <span className="inline-flex min-w-[2.25rem] items-center justify-center rounded-full bg-rose-500/12 px-2.5 py-0.5 text-base font-extrabold tracking-tight text-[#e60000]">
                        --
                      </span>
                    </p>

                    <div className="mt-8 space-y-4">
                      {DRIVER_ORDER.map((id) => (
                        <div key={id}>
                          <div className="flex items-baseline justify-between gap-3">
                            <div className="min-w-0 text-sm font-bold tracking-tight">{pillarTitle(id)}</div>
                            <div className="shrink-0 text-sm font-extrabold tabular-nums text-gray-500">--</div>
                          </div>
                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/60">
                            <div className="h-full w-0 rounded-full bg-black/70" aria-hidden />
                          </div>
                        </div>
                      ))}
                    </div>

                    <p className="mt-5 text-base leading-7 text-[var(--app-muted)]">
                      Complete a mock interview to see your readiness snapshot here (same scores as your report
                      page).
                    </p>
                  </>
                )}
              </CardBody>
            </GlassCard>
          ) : null}
        </div>
      </div>

      <CoachConversationalDock
        quickChips={COACH_AI_QUICK_CHIPS}
        onAdoptPlannedRole={(r) => handleRoleChange(r)}
      />
    </AppShell>
  );
}
