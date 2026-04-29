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

/** Minimal info icon (Heroicons-like) */
function InfoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 16.25V11.25"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 8.25h.01"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PillarInfoIcon({ tooltip }: { tooltip: string }) {
  return (
    <button
      type="button"
      className={cn(
        "group relative inline-flex items-center justify-center rounded-md",
        "text-gray-500/80 hover:text-gray-700",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3EC878]/40",
      )}
      aria-label={tooltip}
    >
      <InfoIcon className="h-4 w-4 shrink-0" />
      <span
        className={cn(
          "pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2",
          "w-max max-w-[240px] whitespace-normal rounded-xl bg-black px-3 py-2 text-xs font-semibold leading-4 text-white shadow-lg",
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
      overall == null ? "text-gray-500" : coachScoreTextClasses(journeyReadinessSnapshot?.overall ?? 0);

    const band = interviewReadinessEmpty ? null : (journeyReadinessSnapshot?.band ?? null);
    const bandText = band ?? "--";
    const bandClass =
      band == null
        ? "bg-rose-500/12 text-[#e60000]"
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
      <GlassCard className="w-full mt-6">
        <Link
          href={readinessSourceReport?.meta?.id ? `/report/${readinessSourceReport.meta.id}` : "/report"}
          aria-label="Open report"
          className={cn(
            "absolute right-5 top-5 z-10 inline-flex items-center justify-center rounded-full p-1.5",
            "text-gray-400 hover:text-gray-700 hover:bg-white/50 active:bg-white/70",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3EC878]/40",
          )}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <path
              d="M7 17L17 7M17 7H10M17 7V14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
        <CardBody>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 lg:flex-1">
              <h3 className="text-2xl font-extrabold tracking-tight pr-10">Interview readiness</h3>
              <div className="mt-2 flex w-full flex-col gap-3">
                <p className="text-base leading-6 text-[var(--app-muted)]">
                  Mocks, trainings, and pillar balance at a glance.
                </p>

                <div className="flex shrink-0 flex-wrap items-end justify-start gap-1">
                  <span
                    className={cn(
                      "text-7xl font-extrabold leading-none tracking-tight tabular-nums",
                      readinessCardModel.overallTextClass,
                    )}
                  >
                    {readinessCardModel.overallText}
                  </span>
                  <span className="pb-1.5 text-xl font-extrabold tracking-tight text-gray-500 tabular-nums">
                    /{READINESS_MAX.toFixed(1)}
                  </span>
                </div>
              </div>

              <p className="mt-4 flex flex-wrap items-center gap-3 text-base leading-6 text-[var(--app-muted)]">
                You’re currently on{" "}
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-base font-extrabold tracking-tight",
                    readinessCardModel.bandClass,
                  )}
                >
                  {readinessCardModel.bandText}
                </span>
              </p>

              {readinessCardModel.noteText ? (
                <p className="mt-5 text-base leading-7 text-[var(--app-muted)]">{readinessCardModel.noteText}</p>
              ) : null}
            </div>

            <div className="lg:w-[360px] lg:shrink-0">
              <div className="mt-2 lg:mt-10 space-y-4">
                {readinessCardModel.pillars.map(({ id, label, score }) => (
                  <div key={id}>
                    <div className="flex items-baseline justify-between gap-3">
                      <div className="min-w-0 text-sm font-bold tracking-tight flex items-center gap-1">
                        <span className="min-w-0 truncate">{label}</span>
                        <PillarInfoIcon tooltip={pillarTooltip(id)} />
                      </div>
                      <div
                        className={cn(
                          "shrink-0 text-sm font-extrabold tabular-nums",
                          score == null ? "text-gray-500" : coachScoreTextClasses(score),
                        )}
                      >
                        {score == null ? "--" : score.toFixed(1)}
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/60">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          score == null ? "bg-black/70 w-0" : coachScoreBarClasses(score),
                        )}
                        style={
                          score == null ? undefined : { width: `${Math.min(100, (score / READINESS_MAX) * 100)}%` }
                        }
                        aria-hidden
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardBody>
      </GlassCard>
    );
  }, [readinessCardModel, readinessSourceReport?.meta?.id, showInterviewReadinessCard]);

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
  const roleExperiences = useMemo(
    () => experiences.filter((e) => (e.role ?? "").trim() === role.trim()),
    [experiences, role],
  );

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
                {readinessCardEl}
              </>
            ) : showJourneyColumn ? (
              <>
                <h2 className="text-5xl font-extrabold leading-[52px] tracking-tight">
                  {(() => {
                    const isFirstStart = readinessSourceReport?.meta.heroVariant === "first_start";
                    if (isRoadmapCoach) return "Here is your guided journey";
                    if (isFinalCoach) return isFirstStart ? "You're off to a strong start." : "Good New! you are Improving";
                    return "You're off to a strong start.";
                  })()}
                </h2>
                <h4 className="mt-1 mb-[14px] text-[32px] font-semibold leading-[52px] tracking-tight">
                  {(() => {
                    const isFirstStart = readinessSourceReport?.meta.heroVariant === "first_start";
                    if (isRoadmapCoach) return "Follow the path, then go for your mock interview.";
                    if (isFinalCoach) return isFirstStart
                      ? "A bit more refinement and you'll be interview-ready."
                      : "Focus on your weaker area's now to get it done.";
                    return "A bit more refinement and you'll be interview-ready.";
                  })()}
                </h4>
                {readinessCardEl}
                <div className="mt-4 w-full pt-0">
                  {!isRoadmapCoach ? (
                    <p className="w-full text-left text-xl leading-7 text-[var(--app-muted)]">
                      {(() => {
                        const isFirstStart = readinessSourceReport?.meta.heroVariant === "first_start";
                        if (isFinalCoach) {
                          return isFirstStart
                            ? "Complete the guided journey — it will help you improve."
                            : "Based on your last session, let’s focus on strengthening your execution and depth.";
                        }
                        return "Based on your last session Ai coach identified the areas to work on";
                      })()}
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
                                    <h3 className="text-xl font-extrabold tracking-tight">
                                      {showActionBadge ? (
                                        <span className="inline-flex items-center gap-2">
                                          <span>{title}</span>
                                          <span className="inline-flex items-center rounded-full border border-black/10 bg-black/[.04] px-2.5 py-0.5 text-xs font-extrabold tracking-tight text-gray-800">
                                            Action
                                          </span>
                                        </span>
                                      ) : (
                                        title
                                      )}
                                    </h3>
                                    <p className="mt-2 text-base leading-6 text-[var(--app-muted)]">{subtitle}</p>
                                    {showFirstStartProgress ? (
                                      <>
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
                                          {Math.round(trainingPct)}% done
                                        </p>
                                      </>
                                    ) : null}
                                  </>
                                );
                              }
                              return (
                                <>
                                  <h3 className="text-xl font-extrabold tracking-tight">
                                    {showActionBadge ? (
                                      <span className="inline-flex items-center gap-2">
                                        <span>{title}</span>
                                        <span className="inline-flex items-center rounded-full border border-black/10 bg-black/[.04] px-2.5 py-0.5 text-xs font-extrabold tracking-tight text-gray-800">
                                          Action
                                        </span>
                                      </span>
                                    ) : (
                                      title
                                    )}
                                  </h3>
                                  <p className="mt-2 text-base leading-6 text-[var(--app-muted)]">{subtitle}</p>
                                </>
                              );
                            })()}
                          </div>
                          <Link
                            href="/training"
                            className={cn(
                              "inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-full px-5 text-base font-bold tracking-tight transition",
                              "bg-transparent text-gray-600 shadow-none hover:text-gray-900 hover:bg-white/70 active:bg-white",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3EC878]/40",
                            )}
                          >
                            {(() => {
                              const isFirstStart = readinessSourceReport?.meta.heroVariant === "first_start";
                              const isSecondInterview = isFinalCoach && !isFirstStart;
                              if (isSecondInterview) return "Start learning";
                              if (coachJourneyView === "journey" && isFirstStart && trainingContinue) {
                                return "Continue learning";
                              }
                              return "Start learning";
                            })()}
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
                      {hasCraftedStoryboard ? (
                        <>
                          <h3 className="text-xl font-extrabold tracking-tight">2. Craft your story</h3>
                          <p className="mt-2 text-base leading-6 text-[var(--app-muted)]">
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
                                  <span className="font-extrabold text-gray-900">decisions</span>,{" "}
                                  <span className="font-extrabold text-gray-900">actions</span>, and{" "}
                                  <span className="font-extrabold text-gray-900">impact</span>.
                                </>
                              );
                            })()}
                          </p>
                          <div className="mt-3 flex flex-wrap items-baseline gap-2">
                            <span className="text-sm font-bold tracking-tight text-gray-800">
                              Here is your story score
                            </span>
                            <span className="text-2xl font-extrabold tabular-nums leading-none tracking-tight text-gray-900">
                              {storyScoreForCard > 0 ? storyScoreForCard.toFixed(1) : "—"}
                            </span>
                            <span className="text-sm font-extrabold tabular-nums text-gray-500">/ 5</span>
                          </div>
                        </>
                      ) : hasCreatedStoryboard ? (
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
                    <div className="flex shrink-0 items-center gap-2">
                      {hasCraftedStoryboard ? (
                        <Link
                          href="/storyboard?new=1"
                          className={cn(
                            "inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-full px-5 text-base font-bold tracking-tight transition",
                            "bg-transparent text-gray-600 shadow-none hover:text-gray-900 hover:bg-white/70 active:bg-white",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3EC878]/40",
                          )}
                        >
                          Add another experience
                          <ArrowUpRightIcon className="h-4 w-4 shrink-0" />
                        </Link>
                      ) : (
                        <>
                          <Link
                            href="/storyboard"
                            className={cn(
                              "inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-full px-5 text-base font-bold tracking-tight transition",
                              "bg-transparent text-gray-600 shadow-none hover:text-gray-900 hover:bg-white/70 active:bg-white",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3EC878]/40",
                            )}
                          >
                            {(() => {
                              const isFirstStart = readinessSourceReport?.meta.heroVariant === "first_start";
                              const isSecondInterview = isFinalCoach && !isFirstStart;
                              return isSecondInterview ? "Add more" : "Start crafting";
                            })()}
                            <ArrowUpRightIcon className="h-4 w-4 shrink-0" />
                          </Link>
                          {hasCreatedStoryboard ? (
                            <Link
                              href="/storyboard?new=1"
                              className={cn(
                                "inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-full px-5 text-base font-bold tracking-tight transition",
                                "bg-transparent text-gray-600 shadow-none hover:text-gray-900 hover:bg-white/70 active:bg-white",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3EC878]/40",
                              )}
                            >
                              {(() => {
                                const isFirstStart = readinessSourceReport?.meta.heroVariant === "first_start";
                                const isSecondInterview = isFinalCoach && !isFirstStart;
                                return isSecondInterview ? "Add more" : "Add another experience";
                              })()}
                              <ArrowUpRightIcon className="h-4 w-4 shrink-0" />
                            </Link>
                          ) : null}
                        </>
                      )}
                    </div>
                  </div>
                </CardBody>
              </div>

                    <div className="h-px w-full bg-slate-300" aria-hidden />

                    <div className="w-full">
                      <CardBody className="p-0">
                        <div className="flex items-start justify-between gap-4 rounded-[20px] transition-colors hover:bg-white/70">
                          <div className="min-w-0">
                            <h3 className="text-xl font-extrabold tracking-tight">
                              {(() => {
                                const isFirstStart = readinessSourceReport?.meta.heroVariant === "first_start";
                                const isSecondInterview = isFinalCoach && !isFirstStart;
                                return isSecondInterview ? "3. Practice with a focused mock" : "3. Take a mock interview";
                              })()}
                            </h3>
                            <p className="mt-2 text-base leading-6 text-[var(--app-muted)]">
                              {(() => {
                                const isFirstStart = readinessSourceReport?.meta.heroVariant === "first_start";
                                const isSecondInterview = isFinalCoach && !isFirstStart;
                                if (!isSecondInterview) {
                                  return <>Practice with a 30-minute, real-world interview.</>;
                                }
                                return (
                                  <>
                                    Try a short interview focused on{" "}
                                    <span className="font-extrabold text-gray-900">Action</span> and{" "}
                                    <span className="font-extrabold text-gray-900">Mastery</span> pillars.
                                  </>
                                );
                              })()}
                            </p>
                          </div>
                          <Link
                            href="/interview?welcomeBack=1"
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
        </div>
      </div>

      <CoachConversationalDock
        quickChips={COACH_AI_QUICK_CHIPS}
        onAdoptPlannedRole={(r) => handleRoleChange(r)}
      />
    </AppShell>
  );
}
