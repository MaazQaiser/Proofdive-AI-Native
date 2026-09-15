"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, BookOpen, Map } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { CoachFloatingNav } from "@/components/CoachFloatingNav";
import { COACH_HUB_CONTENT_TOP_CLASS } from "@/components/coachNavLayout";
import { cn } from "@/components/cn";
import { CoachConversationalDock } from "@/components/coach/CoachConversationalDock";
import { JourneyCard } from "@/components/coach/JourneyCard";
import { RoadmapPreparingOverlay, ROADMAP_PREPARING_FILL_MS } from "@/components/coach/RoadmapPreparingOverlay";
import { TypingText } from "@/components/TypingText";
import { Button } from "@/components/ui/button";
import { CardButton } from "@/components/ui/card-button";
import { ScoreScale } from "@/components/scoring/ScoreScale";
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
import type { RoleProfile } from "@/lib/proofdiveTypes";
import { useCoachJourneyModel } from "@/lib/coachJourneyModel";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

export type CoachJourneyView = "welcome" | "roadmap" | "journey" | "final";

/** `welcome` = 2 CTAs + empty readiness; `roadmap` = 3 step cards + same empty readiness; `journey` = 3 steps + full readiness from latest mock; `final` = same layout, readiness pinned to the report opened from `/report/[id]` → Coach. */
/** Default when opening Coach without `?welcome=1` / `?roadmap=1` / `?empty=1` (welcome/roadmap come from onboarding + interview skip; `?empty=1` is a bookmarkable developer preview of the empty welcome landing). */
const DEFAULT_COACH_JOURNEY_VIEW: CoachJourneyView = "journey";

/** Session-only: this tab used `?welcome=1` (onboarding / interview skip). Used so stale localStorage `welcome` does not show on plain `/coach`. */
const COACH_WELCOME_ENTRY_SESSION_KEY = "proofdive.session.coachWelcomeEntry.v1";
/** Session-only: this tab used `?roadmap=1` after welcome (prep roadmap). */
const COACH_ROADMAP_ENTRY_SESSION_KEY = "proofdive.session.coachRoadmapEntry.v1";

const DRIVER_ORDER = SUCCESS_DRIVER_ORDER;

/** Slightly longer than the logo fill so it reaches 100% before dismiss. */
/** Matches `RoadmapPreparingOverlay` logo-fill duration (+ settle for paint/ready). */
const ROADMAP_PREPARING_MS = ROADMAP_PREPARING_FILL_MS + 400;

function fmtCoachDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}

export function CoachHome() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [roleProfile] = useLocalStorageState<RoleProfile | null>(
    StorageKeys.roleProfile,
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
  const [roadmapPhase, setRoadmapPhase] = useState<"idle" | "preparing" | "ready">("idle");
  const [roadmapCardVisible, setRoadmapCardVisible] = useState(false);
  const journeyCardRef = useRef<HTMLDivElement>(null);
  const roadmapHoldTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (roadmapHoldTimerRef.current != null) {
        window.clearTimeout(roadmapHoldTimerRef.current);
      }
    };
  }, []);

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
  const showJourneyColumn =
    coachJourneyView === "journey" || coachJourneyView === "final";
  /**
   * Readiness sidebar: empty placeholders on `welcome` / `roadmap`, scored on `journey` / `final`.
   */
  /* The journey's real state, from the one model both Homes read. */
  const journeyModel = useCoachJourneyModel();

  const showInterviewReadinessCard =
    coachJourneyView === "welcome" ||
    coachJourneyView === "roadmap" ||
    coachJourneyView === "journey" ||
    coachJourneyView === "final";
  const interviewReadinessEmpty =
    coachJourneyView === "welcome" || coachJourneyView === "roadmap";
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

  /* The card's own footer, which the client asked for here after seeing it on
     the redesigned Home: one honest line while the scoreboard is empty, and
     the way into the report as soon as there is one. It replaces the
     dismissible banner that used to float above the card — a note about the
     card belongs inside it, and a line you can dismiss is a line the next
     visitor never reads. */
  const readinessReport = interviewReadinessEmpty ? null : readinessSourceReport;

  const readinessCardEl = useMemo(() => {
    if (!showInterviewReadinessCard) return null;
    return (
      <div className="mt-6 w-full pb-4">
        <InterviewReadinessCard
          overall={readinessCardModel.overall}
          pillars={readinessCardModel.pillars}
        >
          {readinessReport ? (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <span className="text-caption text-text-secondary">
                Latest mock · {fmtCoachDate(readinessReport.meta.createdAt)} ·{" "}
                {readinessReport.meta.questionCount} questions
              </span>
              <Button asChild variant="outline" size="sm">
                <Link href={`/report/${encodeURIComponent(readinessReport.meta.id)}`}>
                  View full report
                  <ArrowUpRight aria-hidden />
                </Link>
              </Button>
            </div>
          ) : (
            <p className="border-t border-border pt-4 text-caption text-text-secondary">
              Your score will appear here as you complete MasterClasses, build your StoryBoard,
              and take mock interviews.
            </p>
          )}
        </InterviewReadinessCard>
      </div>
    );
  }, [readinessCardModel, readinessReport, showInterviewReadinessCard]);

  /* The key changes job with the reader. Nobody has a score on their first
     visit, so the bands are not reference yet — they are what makes the empty
     scoreboard mean anything, and they go first, open. Once a mock has
     produced real numbers the key is reference again: closed, and last, after
     the numbers it explains. */
  const scoreKeyEl = showInterviewReadinessCard ? (
    <ScoreScale
      defaultOpen={!readinessReport}
      className={cn("w-full max-w-[800px]", readinessReport ? "mt-8" : "mt-6")}
    />
  ) : null;

  /* Why a passing score is not the end of the work. It sits under the numbers
     rather than beside them: it is context for a score, so it is meaningless
     until there is one. */
  const employerInsightEl = readinessReport ? (
    <aside className="mt-4 w-full max-w-[800px] rounded-xl border border-border bg-card px-4 py-3.5">
      <p className="text-overline text-text-secondary">Employer insight</p>
      <p className="mt-1.5 text-body-sm leading-6 text-text-primary">
        Passing is the threshold, not the finish line. When several candidates pass for one
        position, those who demonstrate stronger evidence across all four Success Drivers are
        more likely to secure the role.
      </p>
    </aside>
  ) : null;

  useEffect(() => {
    const is = (k: string) => {
      const v = searchParams.get(k);
      return v === "1" || v?.toLowerCase() === "true";
    };
    const setView = (next: CoachJourneyView) => {
      if (coachJourneyView !== next) setCoachJourneyView(next);
    };
    // Developer preview: force empty welcome landing (Storyboard + Roadmap CTAs)
    // regardless of stored data. Keeps `?empty=1` in the URL so it stays bookmarkable.
    if (is("empty")) {
      setCoachFinalReportId(null);
      setView("welcome");
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
        setView("journey");
        router.replace("/coach", { scroll: false });
        return;
      }
      sessionStorage.setItem(COACH_WELCOME_ENTRY_SESSION_KEY, "1");
      setCoachFinalReportId(null);
      setView("welcome");
      router.replace("/coach", { scroll: false });
      return;
    }
    if (is("journey")) {
      sessionStorage.removeItem(COACH_WELCOME_ENTRY_SESSION_KEY);
      sessionStorage.removeItem(COACH_ROADMAP_ENTRY_SESSION_KEY);
      setCoachFinalReportId(null);
      setView("journey");
      router.replace("/coach", { scroll: false });
      return;
    }
    if (is("roadmap")) {
      if (sessionStorage.getItem(COACH_WELCOME_ENTRY_SESSION_KEY) !== "1") {
        setCoachFinalReportId(null);
        setView("journey");
        router.replace("/coach", { scroll: false });
        return;
      }
      sessionStorage.setItem(COACH_ROADMAP_ENTRY_SESSION_KEY, "1");
      setCoachFinalReportId(null);
      setView("roadmap");
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
          setView("final");
          router.replace("/coach", { scroll: false });
          return;
        }
      }
      setCoachFinalReportId(null);
      setView("journey");
      router.replace("/coach", { scroll: false });
      return;
    }

    const hasWelcomeEntry = sessionStorage.getItem(COACH_WELCOME_ENTRY_SESSION_KEY) === "1";
    // Do not demote `roadmap` when the session key is missing — localStorage must
    // keep the suggested roadmap across tab changes until storyboard/interview.
    if (coachJourneyView === "welcome" && !hasWelcomeEntry) {
      setView("journey");
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
    // Wait until entry query params are stripped — otherwise this fights the
    // `?welcome=1` / `?roadmap=1` handler and loops setState.
    const flag = (k: string) => {
      const v = searchParams.get(k);
      return v === "1" || v?.toLowerCase() === "true";
    };
    if (flag("welcome") || flag("roadmap") || flag("empty")) return;

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
    searchParams,
    setCoachJourneyView,
    setCoachFinalReportId,
  ]);

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
                    {readinessReport ? null : scoreKeyEl}
                    {readinessCardEl}
                  </>
                ) : null}
                {roadmapCardVisible ? (
                  <>
                    {readinessReport ? null : scoreKeyEl}
                    {readinessCardEl}
                    <div ref={journeyCardRef} className="w-full max-w-[800px]">
                      {journeyModel ? <JourneyCard model={journeyModel} className="mt-8" /> : null}
                    </div>
                  </>
                ) : null}
              </>
            ) : showJourneyColumn ? (
              <>
                <h2 className="text-agent-heading text-heading-teal">
                  {/* Two states, both the client's words: before a mock the
                      page encourages, after one it credits the work and lets
                      the report's own headline name what to strengthen. */}
                  {readinessReport
                    ? "You put in real work to get here."
                    : "You're off to a strong start."}
                </h2>
                <h4 className="mt-3 mb-[14px] text-agent-question text-text-primary">
                  {readinessReport
                    ? readinessReport.headline
                    : "Follow the path below to build your interview readiness."}
                </h4>
                {/* Readiness first in every state, the journey under it — the
                    client's call on the redesigned Home and now here too: a new
                    user should see the scoreboard they are about to fill in, so
                    the three steps read as the way to fill it. The key goes
                    above it while there is nothing to read yet. */}
                {readinessReport ? null : scoreKeyEl}
                {readinessCardEl}
                {employerInsightEl}
                {journeyModel ? (
                  <JourneyCard
                    model={journeyModel}
                    className="mt-8"
                    intro={
                      <>
                        Here&apos;s your path forward. Three steps
                        {journeyModel.role ? <>, built around your {journeyModel.role} target</> : null}
                        .
                      </>
                    }
                  />
                ) : null}
              </>
            ) : null}

            {/* Once there is a score, the key comes last: the numbers go first
                and the reader who wants to know what they mean is the one who
                has already read them. */}
            {readinessReport ? scoreKeyEl : null}
          </div>
        </div>
      </div>

      <CoachConversationalDock />
    </AppShell>
  );
}
