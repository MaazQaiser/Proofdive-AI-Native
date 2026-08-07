"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, BookOpen, Map, Plus, X } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { CoachFloatingNav } from "@/components/CoachFloatingNav";
import { COACH_HUB_CONTENT_TOP_CLASS } from "@/components/coachNavLayout";
import { cn } from "@/components/cn";
import { CoachConversationalDock } from "@/components/coach/CoachConversationalDock";
import { RoadmapPreparingOverlay, ROADMAP_PREPARING_FILL_MS } from "@/components/coach/RoadmapPreparingOverlay";
import { TypingText } from "@/components/TypingText";
import { Button } from "@/components/ui/button";
import { CardButton } from "@/components/ui/card-button";
import {
  InterviewReadinessCard,
  readinessPillarsFromReport,
} from "@/components/interview/InterviewReadinessCard";
import {
  SUCCESS_DRIVER_ORDER,
  SUCCESS_DRIVERS,
} from "@/lib/successDrivers";
import { getReportById, useLatestInterviewReport } from "@/lib/interviewReports";
import { reportCountForRole } from "@/lib/proofdiveLogic";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import { readJson } from "@/lib/storage";
import {
  isDiveStore,
  savedDivesForRole,
  type StoryboardDiveStore,
} from "@/lib/storyboardDraft";
import { pickMostRecentForRole } from "@/lib/trainingJourneyProgress";
import type {
  RoleProfile,
  TrainingJourneyProgress,
} from "@/lib/proofdiveTypes";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

export type CoachJourneyView = "welcome" | "roadmap" | "journey" | "final";

/** `welcome` = 2 CTAs + empty readiness; `roadmap` = 3 step cards + same empty readiness; `journey` = 3 steps + full readiness from latest mock; `final` = same layout, readiness pinned to the report opened from `/report/[id]` → Coach. */
/** Default when opening Coach without `?welcome=1` / `?roadmap=1` / `?empty=1` (welcome/roadmap come from onboarding + interview skip; `?empty=1` is a bookmarkable developer preview of the empty welcome landing). */
const DEFAULT_COACH_JOURNEY_VIEW: CoachJourneyView = "journey";

/** Session-only: this tab used `?welcome=1` (onboarding / interview skip). Used so stale localStorage `welcome` does not show on plain `/coach`. */
const COACH_WELCOME_ENTRY_SESSION_KEY = "proofdive.session.coachWelcomeEntry.v1";
/** Session-only: this tab used `?roadmap=1` after welcome (prep roadmap). */
const COACH_ROADMAP_ENTRY_SESSION_KEY = "proofdive.session.coachRoadmapEntry.v1";
/** Session-only dismiss for the readiness empty-state banner. */
const COACH_READINESS_BANNER_DISMISS_KEY = "proofdive.session.coachReadinessBannerDismissed.v1";

const DRIVER_ORDER = SUCCESS_DRIVER_ORDER;

/** Slightly longer than the logo fill so it reaches 100% before dismiss. */
const ROADMAP_PREPARING_MS = ROADMAP_PREPARING_FILL_MS + 200;

function CoachJourneyPlanCard({
  mode,
  isFirstStart,
  trainingContinue,
}: {
  mode: "roadmap" | "journey" | "final" | "suggested";
  isFirstStart: boolean;
  trainingContinue: boolean;
}) {
  const isSecondInterview = mode === "final" && !isFirstStart;
  const showIntro = mode !== "roadmap";
  /** Add competency only after the user has a storyboard or interview journey. */
  const showAddCompetency = mode === "journey" || mode === "final";

  return (
    <div className="mt-4 w-full max-w-[800px] scroll-mt-24 pt-4">
      {showIntro ? (
        <p className="w-full text-left text-[20px] font-medium leading-7 tracking-[-1px] text-text-secondary">
          {(() => {
            if (mode === "final") {
              return isFirstStart
                ? "Complete the guided journey to help you improve."
                : "Based on your last session, let’s focus on strengthening your execution and depth.";
            }
            if (mode === "suggested") {
              return (
                <>
                  Here are the suggested actions{" "}
                  <span className="rounded-sm bg-[#B9EFF4] px-1 text-[#095B73]">
                    AI coach
                  </span>{" "}
                  recommends.
                </>
              );
            }
            return (
              <>
                Based on your last session,{" "}
                <span className="rounded-sm bg-[#B9EFF4] px-1 text-[#095B73]">
                  AI coach
                </span>{" "}
                identified the areas to work on.
              </>
            );
          })()}
        </p>
      ) : null}

      <div className={cn("w-full", mode === "roadmap" ? "mt-0" : "mt-4")}>
        <div
          className={cn(
            "flex w-full flex-col rounded-xl border-[0.5px] border-solid border-[#dde7e9] p-4",
            "bg-[linear-gradient(121.89deg,rgba(255,255,255,0.8)_0%,rgba(255,255,255,0.5)_98.96%)]",
          )}
        >
          <div className="flex w-full items-center justify-between border-b border-extended-green pb-4">
            <div className="flex min-w-0 flex-1 items-start gap-4">
              <span
                aria-hidden
                className="flex shrink-0 self-stretch items-center font-gilroy text-[52px] font-normal leading-[52px] tracking-[-1.04px] tabular-nums text-brand-500"
              >
                1
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <h3 className="text-[18px] font-medium leading-[27px] tracking-[-1.3px] text-text-primary">
                  {isSecondInterview
                    ? "Strengthen how you take action"
                    : "Train with essential interview guides"}
                </h3>
                <p className="text-[16px] font-normal leading-6 text-text-secondary">
                  {isSecondInterview
                    ? "Work on turning ideas into clear, outcome-driven execution."
                    : "Learn the fundamentals with guided practice."}
                </p>
              </div>
            </div>
            <Button
              asChild
              variant="ghost"
              className="h-auto shrink-0 gap-2 rounded-md py-2 pl-4 pr-2! text-[14px] font-medium leading-5 text-extended-dark-cyan hover:bg-transparent hover:text-extended-dark-cyan"
            >
              <Link href="/training">
                {mode === "journey" && isFirstStart && trainingContinue
                  ? "Continue learning"
                  : "Start learning"}
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="flex w-full items-center justify-between border-b border-extended-green py-4">
            <div className="flex min-w-0 flex-1 items-start gap-4">
              <span
                aria-hidden
                className="flex shrink-0 self-stretch items-center font-gilroy text-[52px] font-normal leading-[52px] tracking-[-1.04px] tabular-nums text-brand-500"
              >
                2
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <h3 className="text-[18px] font-medium leading-[27px] tracking-[-1.3px] text-text-primary">
                  {isSecondInterview ? "Improve your story" : "Craft your story"}
                </h3>
                <p className="text-[16px] font-normal leading-6 text-text-secondary">
                  {!isSecondInterview ? (
                    "Turn your experience into structured answers."
                  ) : (
                    <>
                      Add more depth around your{" "}
                      <span className="font-semibold text-text-primary">decisions</span>,{" "}
                      <span className="font-semibold text-text-primary">actions</span>, and{" "}
                      <span className="font-semibold text-text-primary">impact</span>.
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {showAddCompetency ? (
                <Button
                  asChild
                  variant="ghost"
                  className="h-auto gap-2 rounded-md py-2 pl-0! pr-2 text-[14px] font-medium leading-5 text-text-secondary hover:bg-transparent hover:text-text-secondary"
                >
                  <Link href="/storyboard?new=1">
                    <Plus className="size-4" />
                    {isSecondInterview ? "Add more" : "Add competency"}
                  </Link>
                </Button>
              ) : null}
              <Button
                asChild
                variant="ghost"
                className="h-auto gap-2 rounded-md py-2 pl-4 pr-2! text-[14px] font-medium leading-5 text-extended-dark-cyan hover:bg-transparent hover:text-extended-dark-cyan"
              >
                <Link href="/storyboard">
                  Start crafting
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex w-full items-center justify-between pt-4">
            <div className="flex min-w-0 flex-1 items-start gap-4">
              <span
                aria-hidden
                className="flex shrink-0 self-stretch items-center font-gilroy text-[52px] font-normal leading-[52px] tracking-[-1.04px] tabular-nums text-brand-500"
              >
                3
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <h3 className="text-[18px] font-medium leading-[27px] tracking-[-1.3px] text-text-primary">
                  {isSecondInterview
                    ? "Practice with a focused mock"
                    : "Take a mock interview"}
                </h3>
                <p className="text-[16px] font-normal leading-6 text-text-secondary">
                  {!isSecondInterview ? (
                    "Practice with a 30-minute, real-world interview."
                  ) : (
                    <>
                      Try a short interview focused on{" "}
                      <span className="font-semibold text-text-primary">Action</span> and{" "}
                      <span className="font-semibold text-text-primary">Mastery</span> pillars.
                    </>
                  )}
                </p>
              </div>
            </div>
            <Button
              asChild
              variant="ghost"
              className="h-auto shrink-0 gap-2 rounded-md py-2 pl-4 pr-2! text-[14px] font-medium leading-5 text-extended-dark-cyan hover:bg-transparent hover:text-extended-dark-cyan"
            >
              <Link href="/interview?welcomeBack=1">
                Start interview
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CoachHome() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [roleProfile] = useLocalStorageState<RoleProfile | null>(
    StorageKeys.roleProfile,
    null,
  );
  const [trainingJourneyProgressMap] = useLocalStorageState<Record<string, TrainingJourneyProgress>>(
    StorageKeys.trainingProgress,
    {},
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
  const [roadmapPhase, setRoadmapPhase] = useState<"idle" | "preparing" | "ready">("idle");
  const [roadmapCardVisible, setRoadmapCardVisible] = useState(false);
  const journeyCardRef = useRef<HTMLDivElement>(null);
  const roadmapHoldTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setReadinessBannerDismissed(
      sessionStorage.getItem(COACH_READINESS_BANNER_DISMISS_KEY) === "1",
    );
  }, []);

  useEffect(() => {
    return () => {
      if (roadmapHoldTimerRef.current != null) {
        window.clearTimeout(roadmapHoldTimerRef.current);
      }
    };
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

  /** Suggested roadmap stays on the welcome chrome (actions + empty readiness) until storyboard or interview. */
  const showWelcomeLanding =
    coachJourneyView === "welcome" || coachJourneyView === "roadmap";
  const isRoadmapCoach = coachJourneyView === "roadmap";
  const isFinalCoach = coachJourneyView === "final";
  const showJourneyColumn =
    coachJourneyView === "journey" || coachJourneyView === "final";
  /**
   * Readiness sidebar: empty placeholders on `welcome` / `roadmap`, scored on `journey` / `final`.
   */
  const showInterviewReadinessCard =
    coachJourneyView === "welcome" ||
    coachJourneyView === "roadmap" ||
    coachJourneyView === "journey" ||
    coachJourneyView === "final";
  const interviewReadinessEmpty =
    coachJourneyView === "welcome" || coachJourneyView === "roadmap";
  /** Until a mock exists, show the action plan above the empty readiness card. */
  const showActionsAboveReadiness =
    interviewReadinessEmpty || !latestInterviewReport;

  const readinessCardModel = useMemo(() => {
    const emptyPillars = DRIVER_ORDER.map((id) => ({
      id,
      label: SUCCESS_DRIVERS[id].shortLabel,
      score: null,
    }));

    const pillars =
      interviewReadinessEmpty || !readinessSourceReport
        ? emptyPillars
        : readinessPillarsFromReport(readinessSourceReport);

    const overall = interviewReadinessEmpty
      ? null
      : (readinessSourceReport?.overallScore ?? null);

    const noteText = interviewReadinessEmpty
      ? "Take your first mock interview to get your interview readiness score."
      : readinessSourceReport
        ? null
        : "Complete a mock interview to see your readiness snapshot here.";

    return { pillars, overall, noteText };
  }, [interviewReadinessEmpty, readinessSourceReport]);

  const readinessCardEl = useMemo(() => {
    if (!showInterviewReadinessCard) return null;
    return (
      <div className="mt-6 w-full pb-4">
        <InterviewReadinessCard
          overall={readinessCardModel.overall}
          pillars={readinessCardModel.pillars}
        />
      </div>
    );
  }, [readinessCardModel, showInterviewReadinessCard]);

  const readinessNoteBanner =
    showInterviewReadinessCard &&
    readinessCardModel.noteText &&
    !readinessBannerDismissed ? (
      <div
        role="status"
        className="mt-6 flex w-full items-center gap-3 rounded-lg border border-extended-light-cyan bg-extended-light-cyan/50 px-4 py-3"
      >
        <p className="min-w-0 flex-1 text-body-sm leading-6 text-extended-green-blue">
          {readinessCardModel.noteText}
        </p>
        <Button
          variant="ghost"
          size="icon"
          onClick={dismissReadinessBanner}
          className="size-8 shrink-0 text-extended-green-blue hover:bg-extended-light-cyan hover:text-extended-dark-cyan"
          aria-label="Dismiss readiness tip"
        >
          <X />
        </Button>
      </div>
    ) : null;
  useEffect(() => {
    const is = (k: string) => {
      const v = searchParams.get(k);
      return v === "1" || v?.toLowerCase() === "true";
    };
    // Developer preview: force empty welcome landing (Storyboard + Roadmap CTAs)
    // regardless of stored data. Keeps `?empty=1` in the URL so it stays bookmarkable.
    if (is("empty")) {
      setCoachFinalReportId(null);
      if (coachJourneyView !== "welcome") {
        setCoachJourneyView("welcome");
      }
      return;
    }
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
    // Do not demote `roadmap` when the session key is missing — localStorage must
    // keep the suggested roadmap across tab changes until storyboard/interview.
    if (coachJourneyView === "welcome" && !hasWelcomeEntry) {
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

  /** Restore suggested roadmap chrome after remount (phase/card are in-memory). */
  useEffect(() => {
    if (coachJourneyView !== "roadmap") return;
    if (roadmapPhase === "idle") {
      setRoadmapPhase("ready");
      setRoadmapCardVisible(true);
    }
  }, [coachJourneyView, roadmapPhase]);

  /** Leave welcome/roadmap once the role has a saved Storyboard or a mock report. */
  useEffect(() => {
    if (coachJourneyView !== "welcome" && coachJourneyView !== "roadmap") return;
    if (typeof window === "undefined") return;
    const roleTitle = roleProfile?.targetRole?.trim() ?? "";
    const hasInterview = reportCountForRole(roleTitle) > 0;
    const diveStore = readJson<StoryboardDiveStore>(StorageKeys.storyboardDives);
    const hasStoryboard =
      Boolean(roleTitle) &&
      isDiveStore(diveStore) &&
      savedDivesForRole(diveStore, roleTitle).length > 0;
    if (!hasInterview && !hasStoryboard) return;
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(COACH_WELCOME_ENTRY_SESSION_KEY);
      sessionStorage.removeItem(COACH_ROADMAP_ENTRY_SESSION_KEY);
    }
    setRoadmapPhase("idle");
    setRoadmapCardVisible(false);
    setCoachFinalReportId(null);
    setCoachJourneyView("journey");
  }, [
    coachJourneyView,
    roleProfile,
    pathname,
    latestInterviewReport,
    setCoachJourneyView,
    setCoachFinalReportId,
  ]);

  const trainingProgressForRole = useMemo(
    () => pickMostRecentForRole(trainingJourneyProgressMap, role),
    [trainingJourneyProgressMap, role],
  );

  const trainingContinue =
    typeof trainingProgressForRole?.percentComplete === "number" &&
    trainingProgressForRole.percentComplete > 0;

  const isFirstStart = readinessSourceReport?.meta.heroVariant === "first_start";

  const startRoadmapReveal = useCallback(() => {
    if (roadmapPhase !== "idle") return;
    setRoadmapPhase("preparing");
  }, [roadmapPhase]);

  useEffect(() => {
    if (roadmapPhase !== "preparing") return;
    if (roadmapHoldTimerRef.current != null) {
      window.clearTimeout(roadmapHoldTimerRef.current);
    }
    roadmapHoldTimerRef.current = window.setTimeout(() => {
      sessionStorage.setItem(COACH_ROADMAP_ENTRY_SESSION_KEY, "1");
      setCoachJourneyView("roadmap");
      setRoadmapPhase("ready");
    }, ROADMAP_PREPARING_MS);
    return () => {
      if (roadmapHoldTimerRef.current != null) {
        window.clearTimeout(roadmapHoldTimerRef.current);
      }
    };
  }, [roadmapPhase, setCoachJourneyView]);

  const handleReadyTyped = useCallback(() => {
    setRoadmapCardVisible(true);
  }, []);

  useEffect(() => {
    if (roadmapPhase !== "ready") return;
    const fallback = window.setTimeout(() => setRoadmapCardVisible(true), 2800);
    return () => window.clearTimeout(fallback);
  }, [roadmapPhase]);

  useEffect(() => {
    if (!roadmapCardVisible) return;
    const frame = window.requestAnimationFrame(() => {
      journeyCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [roadmapCardVisible]);

  return (
    <AppShell contentTopClassName={COACH_HUB_CONTENT_TOP_CLASS}>
      <CoachFloatingNav />
      {roadmapPhase === "preparing" ? <RoadmapPreparingOverlay /> : null}
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
                <h2 className="text-agent-heading text-heading-teal">Welcome to ProofDive</h2>
                <h4 className="mt-3 mb-[14px] text-agent-question text-text-primary">
                  {roadmapPhase === "preparing" ? (
                    "Preparing roadmap…"
                  ) : roadmapPhase === "ready" ? (
                    roadmapCardVisible ? (
                      "Follow the path below to prepare for this role."
                    ) : (
                      <span aria-live="polite">
                        <TypingText
                          key="roadmap-ready"
                          text="Follow the path below to prepare for this role."
                          mode="word"
                          cursor
                          startDelayMs={180}
                          onDone={handleReadyTyped}
                        />
                      </span>
                    )
                  ) : (
                    "Start with your story, or open a guided prep path for this role."
                  )}
                </h4>
                {roadmapPhase === "idle" ? (
                  <>
                    <div className="mt-8 grid w-full max-w-[800px] grid-cols-1 gap-4 sm:grid-cols-2">
                      <CardButton
                        href="/storyboard"
                        variant="primary"
                        icon={<BookOpen />}
                        title="Start Storyboarding"
                        subtitle="Turn your experience into proof"
                        illustrationSrc="/brand/illustration-1.svg"
                        className="w-full"
                      />
                      <CardButton
                        variant="gray"
                        icon={<Map />}
                        title="View Roadmap"
                        subtitle="Get a personalized prep plan"
                        illustrationSrc="/brand/illustration-2.svg"
                        className="w-full"
                        onClick={startRoadmapReveal}
                      />
                    </div>
                    {readinessNoteBanner}
                    {readinessCardEl}
                  </>
                ) : null}
                {roadmapCardVisible ? (
                  <>
                    {showActionsAboveReadiness ? (
                      <>
                        <div ref={journeyCardRef} className="w-full max-w-[800px]">
                          <CoachJourneyPlanCard
                            mode="suggested"
                            isFirstStart={Boolean(isFirstStart)}
                            trainingContinue={trainingContinue}
                          />
                        </div>
                        {readinessNoteBanner}
                        {readinessCardEl}
                      </>
                    ) : (
                      <>
                        {readinessNoteBanner}
                        {readinessCardEl}
                        <div ref={journeyCardRef} className="w-full max-w-[800px]">
                          <CoachJourneyPlanCard
                            mode="suggested"
                            isFirstStart={Boolean(isFirstStart)}
                            trainingContinue={trainingContinue}
                          />
                        </div>
                      </>
                    )}
                  </>
                ) : null}
              </>
            ) : showJourneyColumn ? (
              <>
                <h2 className="text-agent-heading text-heading-teal">
                  {(() => {
                    if (isRoadmapCoach) return "Here is your guided journey";
                    if (isFinalCoach) return isFirstStart ? "You're off to a strong start." : "Good news, you're improving.";
                    return "You're off to a strong start.";
                  })()}
                </h2>
                <h4 className="mt-3 mb-[14px] text-agent-question text-text-primary">
                  {(() => {
                    if (isRoadmapCoach) return "Follow the path below to prepare for this role.";
                    if (isFinalCoach) {
                      return isFirstStart
                        ? "Follow the path below to keep improving."
                        : "Focus on your weaker areas to get it done.";
                    }
                    return "Follow the path below to keep improving.";
                  })()}
                </h4>
                {showActionsAboveReadiness ? (
                  <>
                    <CoachJourneyPlanCard
                      mode={isFinalCoach ? "final" : isRoadmapCoach ? "roadmap" : "journey"}
                      isFirstStart={Boolean(isFirstStart)}
                      trainingContinue={trainingContinue}
                    />
                    {readinessNoteBanner}
                    {readinessCardEl}
                  </>
                ) : (
                  <>
                    {readinessNoteBanner}
                    {readinessCardEl}
                    <CoachJourneyPlanCard
                      mode={isFinalCoach ? "final" : isRoadmapCoach ? "roadmap" : "journey"}
                      isFirstStart={Boolean(isFirstStart)}
                      trainingContinue={trainingContinue}
                    />
                  </>
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>

      <CoachConversationalDock />
    </AppShell>
  );
}
