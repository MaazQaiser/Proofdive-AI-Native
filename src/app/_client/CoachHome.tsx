"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, BookOpen, Map, Plus, X } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { CoachFloatingNav } from "@/components/CoachFloatingNav";
import { cn } from "@/components/cn";
import { CoachConversationalDock } from "@/components/coach/CoachConversationalDock";
import { Button } from "@/components/ui/button";
import { CardButton } from "@/components/ui/card-button";
import { SuccessDriverIcon } from "@/components/ui/success-driver-icon";
import {
  SUCCESS_DRIVER_ORDER,
  SUCCESS_DRIVERS,
  type SuccessDriverId,
} from "@/lib/successDrivers";
import { getReportById, useLatestInterviewReport } from "@/lib/interviewReports";
import { reportCountForRole } from "@/lib/proofdiveLogic";
import {
  scoringBandForScore,
  scoringLabelForScore,
  type ScoringBand,
} from "@/lib/scoringPalette";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import { readJson } from "@/lib/storage";
import { pickMostRecentForRole } from "@/lib/trainingJourneyProgress";
import type {
  InterviewReport,
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

const READINESS_MAX = 5;

const DRIVER_ORDER = SUCCESS_DRIVER_ORDER;

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

/** Bright scoring fills for large readiness numerals (Figma color/scoring/*). */
function readinessScoreTextClass(score: number | null | undefined): string {
  if (score == null || !Number.isFinite(score)) return "text-text-secondary";
  const band = scoringBandForScore(score);
  if (band === "cyan") return "text-scoring-cyan";
  if (band === "green") return "text-scoring-green";
  if (band === "yellow") return "text-scoring-yellow";
  return "text-scoring-red";
}

/** Status pill matching Figma Interview Readiness (solid border + 25% fill). */
function readinessStatusPillClass(scoreOrLabel: number | string | null): string {
  if (scoreOrLabel == null) {
    return "border-border bg-muted text-muted-foreground";
  }
  const band: ScoringBand =
    typeof scoreOrLabel === "number"
      ? scoringBandForScore(scoreOrLabel)
      : labelToScoringBand(scoreOrLabel);
  if (band === "cyan") {
    return "border-scoring-cyan bg-scoring-cyan/25 text-scoring-cyan-fg";
  }
  if (band === "green") {
    return "border-scoring-green bg-scoring-green/25 text-scoring-green";
  }
  if (band === "yellow") {
    return "border-scoring-yellow bg-scoring-yellow/25 text-scoring-yellow-fg";
  }
  return "border-scoring-red bg-scoring-red/25 text-scoring-red";
}

function labelToScoringBand(label: string): ScoringBand {
  const n = label.trim().toLowerCase();
  if (n === "star") return "cyan";
  if (n === "pass" || n === "ready") return "green";
  if (n === "borderline") return "yellow";
  return "red";
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
      ? DRIVER_ORDER.map((id) => ({
          id,
          label: SUCCESS_DRIVERS[id].shortLabel,
          score: null,
        }))
      : journeyReadinessSnapshot?.pillars
        ? journeyReadinessSnapshot.pillars.map((p) => ({
            id: p.id as (typeof DRIVER_ORDER)[number],
            label: SUCCESS_DRIVERS[p.id as SuccessDriverId]?.shortLabel ?? p.label,
            score: p.score,
          }))
        : DRIVER_ORDER.map((id) => ({
            id,
            label: SUCCESS_DRIVERS[id].shortLabel,
            score: null,
          }));

    const overall = interviewReadinessEmpty ? null : (journeyReadinessSnapshot?.overall ?? null);
    const overallText = overall == null ? "—" : overall.toFixed(1);
    const band = interviewReadinessEmpty ? null : (journeyReadinessSnapshot?.band ?? null);
    const bandText =
      overall != null
        ? scoringLabelForScore(overall)
        : (band ?? "—");
    const bandClass =
      overall != null
        ? readinessStatusPillClass(overall)
        : band == null
          ? readinessStatusPillClass(null)
          : readinessStatusPillClass(journeyReadinessSnapshot?.band ?? "Not ready");

    const noteText = interviewReadinessEmpty
      ? "Take your first mock interview to get your interview readiness score."
      : journeyReadinessSnapshot
        ? null
        : "Complete a mock interview to see your readiness snapshot here.";

    return { pillars, overall, overallText, bandText, bandClass, noteText };
  }, [interviewReadinessEmpty, journeyReadinessSnapshot]);

  const readinessCardEl = useMemo(() => {
    if (!showInterviewReadinessCard) return null;
    return (
      <div className="mt-6 w-full pb-4">
        <div
          className={cn(
            "flex w-full flex-col gap-2.5 rounded-[20px] border-[0.5px] border-solid border-[#dde7e9]",
            "px-6 py-4 backdrop-blur-[42px]",
            "bg-[linear-gradient(114.96deg,rgba(255,255,255,0.8)_0%,rgba(255,255,255,0.5)_98.96%)]",
          )}
        >
          <div className="flex w-full items-center justify-between gap-4 py-4">
            <div className="flex min-w-0 flex-1 items-end gap-4">
              <div className="flex w-[148px] shrink-0 items-end gap-1 font-gilroy whitespace-nowrap">
                <span
                  className={cn(
                    "text-[64px] font-normal leading-none tracking-[-3.2px] tabular-nums",
                    readinessScoreTextClass(readinessCardModel.overall),
                  )}
                >
                  {readinessCardModel.overallText}
                </span>
                <span className="text-[48px] font-normal leading-none tracking-[-2.4px] text-[#abadb2]">
                  /{READINESS_MAX}
                </span>
              </div>
              <span className="pb-1 text-[16px] font-medium tracking-[-0.5px] text-text-primary">
                Interview readiness
              </span>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-x-2.5 gap-y-0">
              <span className="text-[16px] font-medium tracking-[-0.5px] text-text-primary">
                You are currently
              </span>
              <span
                className={cn(
                  "inline-flex items-center justify-center overflow-hidden rounded-full border border-solid px-[9px] py-[3px] text-[12px] font-medium leading-[1.2]",
                  readinessCardModel.bandClass,
                )}
              >
                {readinessCardModel.bandText}
              </span>
            </div>
          </div>

          <div className="flex w-full flex-col">
            {readinessCardModel.pillars.map(({ id, label, score }) => {
              const displayScore = score != null && score > 0 ? score : null;
              return (
                <div
                  key={id}
                  className="flex w-full items-center gap-4 border-t border-extended-green py-[18px]"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <SuccessDriverIcon
                      driver={id}
                      className="size-4 text-text-primary"
                    />
                    <span className="truncate text-[16px] font-medium tracking-[-0.5px] text-text-primary">
                      {label}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-end gap-1 font-gilroy whitespace-nowrap">
                    <span
                      className={cn(
                        "w-[72px] text-right text-[32px] font-medium leading-none tracking-[-1.6px] tabular-nums",
                        readinessScoreTextClass(displayScore),
                      )}
                    >
                      {displayScore != null ? displayScore.toFixed(1) : "—"}
                    </span>
                    <span className="text-[24px] font-medium leading-none tracking-[-1.2px] text-[#abadb2]">
                      /{READINESS_MAX}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
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

  const trainingProgressForRole = useMemo(
    () => pickMostRecentForRole(trainingJourneyProgressMap, role),
    [trainingJourneyProgressMap, role],
  );

  const trainingContinue =
    typeof trainingProgressForRole?.percentComplete === "number" &&
    trainingProgressForRole.percentComplete > 0;

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
                <h4 className="mt-3 mb-[14px] text-agent-question text-text-primary">
                  Let&apos;s get interview ready
                </h4>
                <p className="mt-2 max-w-xl text-left text-body leading-7 text-text-secondary">
                  Choose a path to get started.
                </p>
                <div className="mt-8 grid w-full max-w-[800px] grid-cols-1 gap-4 sm:grid-cols-2">
                  <CardButton
                    href="/storyboard"
                    variant="primary"
                    icon={<BookOpen />}
                    title="Storyboard"
                    subtitle="Turn your experience into proof"
                    illustrationSrc="/brand/illustration-1.svg"
                    className="w-full"
                  />
                  <CardButton
                    href="/coach?roadmap=1"
                    variant="gray"
                    icon={<Map />}
                    title="Roadmap"
                    subtitle="Get a personalized prep plan"
                    illustrationSrc="/brand/illustration-2.svg"
                    className="w-full"
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
                <h4 className="mt-3 mb-[14px] text-agent-question text-text-primary">
                  {(() => {
                    const isFirstStart = readinessSourceReport?.meta.heroVariant === "first_start";
                    if (isRoadmapCoach) return "Follow the path, then go for your mock interview.";
                    if (isFinalCoach) {
                      return isFirstStart
                        ? "Follow the path below to keep improving."
                        : "Focus on your weaker areas to get it done.";
                    }
                    return "Follow the path below to keep improving.";
                  })()}
                </h4>
                {readinessNoteBanner}
                {readinessCardEl}
                <div className="mt-4 w-full pt-4">
                  {!isRoadmapCoach ? (
                    <p className="w-full text-left text-[20px] font-medium leading-7 tracking-[-1px] text-text-secondary">
                      {(() => {
                        const isFirstStart = readinessSourceReport?.meta.heroVariant === "first_start";
                        if (isFinalCoach) {
                          return isFirstStart
                            ? "Complete the guided journey to help you improve."
                            : "Based on your last session, let’s focus on strengthening your execution and depth.";
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

                  <div className={cn("w-full", isRoadmapCoach ? "mt-0" : "mt-4")}>
                    <div
                      className={cn(
                        "flex w-full flex-col rounded-xl border-[0.5px] border-solid border-[#dde7e9] p-4",
                        "bg-[linear-gradient(121.89deg,rgba(255,255,255,0.8)_0%,rgba(255,255,255,0.5)_98.96%)]",
                      )}
                    >
                      {/* Step 1 */}
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
                              {(() => {
                                const isFirstStart = readinessSourceReport?.meta.heroVariant === "first_start";
                                const isSecondInterview = isFinalCoach && !isFirstStart;
                                return isSecondInterview
                                  ? "Strengthen how you take action"
                                  : "Train with essential interview guides";
                              })()}
                            </h3>
                            <p className="text-[16px] font-normal leading-6 text-text-secondary">
                              {(() => {
                                const isFirstStart = readinessSourceReport?.meta.heroVariant === "first_start";
                                const isSecondInterview = isFinalCoach && !isFirstStart;
                                return isSecondInterview
                                  ? "Work on turning ideas into clear, outcome-driven execution."
                                  : "Learn the fundamentals with guided practice.";
                              })()}
                            </p>
                          </div>
                        </div>
                        <Button
                          asChild
                          variant="ghost"
                          className="h-auto shrink-0 gap-2 rounded-md py-2 pl-4 pr-2! text-[14px] font-medium leading-5 text-extended-dark-cyan hover:bg-transparent hover:text-extended-dark-cyan"
                        >
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
                            <ArrowUpRight className="size-4" />
                          </Link>
                        </Button>
                      </div>

                      {/* Step 2 */}
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
                              {(() => {
                                const isFirstStart = readinessSourceReport?.meta.heroVariant === "first_start";
                                const isSecondInterview = isFinalCoach && !isFirstStart;
                                return isSecondInterview ? "Improve your story" : "Craft your story";
                              })()}
                            </h3>
                            <p className="text-[16px] font-normal leading-6 text-text-secondary">
                              {(() => {
                                const isFirstStart = readinessSourceReport?.meta.heroVariant === "first_start";
                                const isSecondInterview = isFinalCoach && !isFirstStart;
                                if (!isSecondInterview) {
                                  return "Turn your experience into structured answers.";
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
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <Button
                            asChild
                            variant="ghost"
                            className="h-auto gap-2 rounded-md py-2 pl-0! pr-2 text-[14px] font-medium leading-5 text-text-secondary hover:bg-transparent hover:text-text-secondary"
                          >
                            <Link href="/storyboard?new=1">
                              <Plus className="size-4" />
                              {(() => {
                                const isFirstStart = readinessSourceReport?.meta.heroVariant === "first_start";
                                const isSecondInterview = isFinalCoach && !isFirstStart;
                                return isSecondInterview ? "Add more" : "Add competency";
                              })()}
                            </Link>
                          </Button>
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

                      {/* Step 3 */}
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
                              {(() => {
                                const isFirstStart = readinessSourceReport?.meta.heroVariant === "first_start";
                                const isSecondInterview = isFinalCoach && !isFirstStart;
                                return isSecondInterview
                                  ? "Practice with a focused mock"
                                  : "Take a mock interview";
                              })()}
                            </h3>
                            <p className="text-[16px] font-normal leading-6 text-text-secondary">
                              {(() => {
                                const isFirstStart = readinessSourceReport?.meta.heroVariant === "first_start";
                                const isSecondInterview = isFinalCoach && !isFirstStart;
                                if (!isSecondInterview) {
                                  return "Practice with a 30-minute, real-world interview.";
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
              </>
            ) : null}
          </div>
        </div>
      </div>

      <CoachConversationalDock />
    </AppShell>
  );
}
