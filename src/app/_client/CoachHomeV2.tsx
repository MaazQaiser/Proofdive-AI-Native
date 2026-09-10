"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { ArrowUpRight, ChevronLeft, Plus } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { CoachFloatingNav } from "@/components/CoachFloatingNav";
import { COACH_HUB_CONTENT_TOP_CLASS } from "@/components/coachNavLayout";
import { CoachConversationalDock } from "@/components/coach/CoachConversationalDock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/ui/logo";
import { ScoreScale } from "@/components/scoring/ScoreScale";
import {
  InterviewReadinessCard,
  readinessPillarsFromReport,
} from "@/components/interview/InterviewReadinessCard";
import { safeParseReportsMap } from "@/lib/interviewReports";
import { SUCCESS_DRIVER_ORDER, SUCCESS_DRIVERS } from "@/lib/successDrivers";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import type {
  InterviewReport,
  RoleProfile,
  TrainingJourneyProgress,
} from "@/lib/proofdiveTypes";
import { deriveJourneySignals, pickRecommendedNextStep } from "@/lib/recommendedNextStep";
import { scoringBadgeClass, scoringLabelForScore } from "@/lib/scoringPalette";
import { readJson } from "@/lib/storage";
import {
  editingDiveForRole,
  isDiveStore,
  savedDivesForRole,
  type StoryboardDiveStore,
} from "@/lib/storyboardDraft";
import { hasCompletedAnyTrainingForRole, pickMostRecentForRole } from "@/lib/trainingJourneyProgress";
import { useLocalStorageState } from "@/lib/useLocalStorageState";
import { cn } from "@/lib/utils";

/**
 * Home, second version — same page the client signed off on (agent heading,
 * readiness card, the 1-2-3 journey card, the assistant dock), with the
 * three things the audit found missing:
 *
 *   1. The steps carry REAL state. Each row reads its module's own progress
 *      (training phase %, saved Dives, mock reports) and says done / in
 *      progress / up next, with the detail that proves it.
 *   2. One step is clearly the next one. It is picked by the same
 *      `pickRecommendedNextStep` the onboarding plan and the FAQ bot already
 *      use, so Home never disagrees with them.
 *   3. The page derives from data, not from a stored "view" enum. Two users
 *      with the same progress see the same Home, however they got here.
 *
 * Dropped on purpose: the welcome tiles and the 1.6s "Preparing roadmap"
 * overlay — the journey card IS the roadmap, and it is the same for everyone.
 */

type StepId = "training" | "storyboard" | "interview";
type StepStatus = "done" | "in_progress" | "todo";

type JourneyStep = {
  id: StepId;
  index: number;
  title: string;
  /** What the step is, for a user who has not started it. */
  subtitle: string;
  /** What the user has actually done, once they have started. */
  detail: string | null;
  status: StepStatus;
  /** In-progress percentage when the module reports one (training). */
  percent: number | null;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
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

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}

export function CoachHomeV2() {
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

  /* Everything below is derived from storage on the client. `pathname` is in
     the deps so a return from any module re-reads — the same trick the
     current Home uses. */
  const model = useMemo(() => {
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
    return { steps, recommended, report, doneCount, dives };
    // `pathname` is not read inside, but it is the re-read trigger: the
    // Dive store and reports live in localStorage, not React state, so a
    // return from Storyboard or Interview has to invalidate this memo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, role, trainingMap, roleProfile, pathname]);

  const heading = useMemo(() => {
    if (!model) return { h2: "", h4: "" };
    const { report, doneCount, recommended } = model;
    if (report) {
      const improving = report.meta.heroVariant === "improving";
      return {
        h2: improving ? "Good news, you're improving." : "You're off to a strong start.",
        h4: report.headline,
      };
    }
    if (doneCount === 0) {
      return {
        h2: firstName ? `Welcome, ${firstName}.` : "Welcome to ProofDive.",
        h4: role
          ? `Three steps to get interview-ready for ${role}. Start with the first.`
          : "Three steps to get interview-ready. Start with the first.",
      };
    }
    return {
      h2: "You're on your way.",
      h4: `${doneCount} of 3 steps done. Next up: ${recommended.title.charAt(0).toLowerCase()}${recommended.title.slice(1)}.`,
    };
  }, [model, firstName, role]);

  const readinessEl = model?.report ? (
    <InterviewReadinessCard
      overall={model.report.overallScore}
      pillars={readinessPillarsFromReport(model.report)}
    >
      {/* The card has no CTA of its own; Home gives it the one it needs — the
          way into the report the numbers came from. */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <span className="text-caption text-text-secondary">
          Latest mock · {fmtDate(model.report.meta.createdAt)} · {model.report.meta.questionCount} questions
        </span>
        <Button asChild variant="outline" size="sm">
          <Link href={`/report/${encodeURIComponent(model.report.meta.id)}`}>
            View full report
            <ArrowUpRight aria-hidden />
          </Link>
        </Button>
      </div>
    </InterviewReadinessCard>
  ) : model ? (
    /* Empty readiness is the FULL card with em-dashes, above the journey —
       the client's call: a new user should see the scoreboard they are about
       to fill in, so the three steps read as the way to fill it. The card's
       footer carries the one honest line about how it fills. */
    <InterviewReadinessCard
      overall={null}
      pillars={SUCCESS_DRIVER_ORDER.map((id) => ({
        id,
        label: SUCCESS_DRIVERS[id].shortLabel,
        score: null,
      }))}
    >
      <p className="border-t border-border pt-4 text-caption text-text-secondary">
        Complete your first mock interview to generate readiness insights across the four
        Success Drivers.
      </p>
    </InterviewReadinessCard>
  ) : null;

  return (
    <AppShell contentTopClassName={COACH_HUB_CONTENT_TOP_CLASS}>
      <CoachFloatingNav />
      <div className="flex min-h-[70vh] flex-col items-start justify-start pb-44">
        <div className="mx-auto mt-0 flex w-full max-w-[840px] flex-col gap-0 px-6 text-left">
          {/* Review chrome: this is the preview, the current Home is one step back. */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/coach"
              className="inline-flex items-center gap-1 text-caption font-medium text-text-secondary hover:text-text-primary"
            >
              <ChevronLeft className="size-4" aria-hidden />
              Current Home
            </Link>
            <Badge>Preview · new Home</Badge>
          </div>

          {model ? (
            <>
              <h2 className="text-agent-heading text-heading-teal">{heading.h2}</h2>
              <h4 className="mt-3 text-agent-question text-text-primary">{heading.h4}</h4>

              {/* Readiness first in every state (see the empty-card note above),
                  then the journey that fills it. */}
              <div className="mt-8 w-full">{readinessEl}</div>
              <JourneyCard model={model} className="mt-8" />
              {/* The key, last: the numbers come first, and the reader who
                  wants to know what they mean is the one who has already
                  read them. Same bands and the same pills as the report's
                  scoring key. It says nothing about this reader's own score
                  — that belongs to the numbers themselves, which explain
                  their own band on hover. */}
              <ScoreScale className="mt-8" />
            </>
          ) : (
            <div className="min-h-[40vh]" aria-hidden />
          )}
        </div>
      </div>

      <CoachConversationalDock />
    </AppShell>
  );
}

function JourneyCard({
  model,
  className,
}: {
  model: {
    steps: JourneyStep[];
    recommended: { id: StepId; ctaHref: string; ctaLabel: string };
    doneCount: number;
    report: InterviewReport | null;
  };
  className?: string;
}) {
  const { steps, recommended, doneCount } = model;
  return (
    <section className={cn("w-full", className)} aria-label="Your guided journey">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-[20px] font-medium leading-7 tracking-[-1px] text-text-secondary">
            Your guided journey
          </h3>
        </div>
        {/* Progress as three segments, one per step — a bar that can only ever
            say 0, 1, 2 or 3, which is exactly as precise as the truth. */}
        <div className="flex items-center gap-2 text-overline font-medium uppercase tracking-wide text-text-secondary">
          <span className="flex gap-1" aria-hidden>
            {steps.map((s) => (
              <span
                key={s.id}
                className={cn(
                  "h-1.5 w-7 rounded-full",
                  s.status === "done" ? "bg-primary" : s.status === "in_progress" ? "bg-primary/40" : "bg-muted",
                )}
              />
            ))}
          </span>
          {doneCount} of 3 done
        </div>
      </div>

      {/* `overflow-hidden` so the highlighted row's tint is clipped to the
          card's own radius when it is the first or last row. */}
      <ol className="mt-3 flex w-full flex-col overflow-hidden rounded-xl border border-border bg-card px-4">
        {steps.map((step) => {
          const isNext = step.id === recommended.id;
          const done = step.status === "done";
          return (
            <li
              key={step.id}
              className={cn(
                // No `w-full`: a stretched flex child already fills the list, and
                // 100% + a negative margin would leave the highlight 32px short of
                // the card's right edge.
                "flex flex-col gap-3 border-b border-border py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between",
                isNext && "-mx-4 border-b-0 bg-brand-1000/60 px-4",
              )}
            >
              <div className="flex min-w-0 flex-1 items-start gap-4">
                {/* The numeral stays in every state (client likes it) — the
                    "Done" badge already says done, a check beside it said it
                    twice. Ink carries the state instead: full brand on the
                    next step, soft brand on done, quiet on not-started. */}
                <span
                  aria-hidden
                  className={cn(
                    "flex w-8 shrink-0 self-stretch items-center justify-center font-gilroy text-[52px] font-normal leading-[52px] tracking-[-1.04px] tabular-nums",
                    isNext ? "text-brand-500" : done ? "text-brand-500/50" : "text-text-secondary/40",
                  )}
                >
                  {step.index}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-[18px] font-medium leading-[27px] tracking-[-1.3px] text-text-primary">
                      {step.title}
                    </h4>
                    {/* A step can be both done and the recommended next move
                        (the mock, once everything else is complete). It keeps
                        the highlight and the filled button, but says "Done" —
                        "Up next" beside a check mark contradicts itself. */}
                    {isNext && !done ? (
                      <Badge className="border-transparent bg-primary text-primary-foreground">
                        <LogoMark className="size-3" />
                        Up next
                      </Badge>
                    ) : done ? (
                      <Badge className={cn(scoringBadgeClass("Ready"), "border-transparent")}>Done</Badge>
                    ) : step.status === "in_progress" ? (
                      <Badge>In progress{step.percent != null ? ` · ${step.percent}%` : ""}</Badge>
                    ) : null}
                  </div>
                  <p className="text-[16px] font-normal leading-6 text-text-secondary">
                    {step.detail ?? step.subtitle}
                  </p>
                  {step.percent != null ? (
                    <div className="h-1 w-full max-w-[16rem] overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,var(--brand-100),var(--brand-600))]"
                        style={{ width: `${step.percent}%` }}
                      />
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2 pl-12 sm:pl-0">
                {step.secondary ? (
                  <Button asChild variant="ghost" size="sm" className="text-text-secondary">
                    <Link href={step.secondary.href}>
                      {step.secondary.label === "Add competency" ? <Plus aria-hidden /> : null}
                      {step.secondary.label}
                    </Link>
                  </Button>
                ) : null}
                {isNext ? (
                  <Button asChild size="sm">
                    <Link href={recommended.ctaHref}>
                      {step.primary.label}
                      <ArrowUpRight aria-hidden />
                    </Link>
                  </Button>
                ) : (
                  <Button asChild variant="ghost" size="sm" className="text-extended-dark-cyan hover:text-extended-dark-cyan">
                    <Link href={step.primary.href}>
                      {step.primary.label}
                      <ArrowUpRight aria-hidden />
                    </Link>
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
