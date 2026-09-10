"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Download,
  RotateCcw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { CoachBottomChatBar } from "@/components/CoachBottomChatBar";
import { CoachFloatingNav } from "@/components/CoachFloatingNav";
import { GenericUpgradeModal } from "@/components/GenericUpgradeModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SuccessDriverInfoTip } from "@/components/ui/success-driver-card";
import { SuccessDriverIcon } from "@/components/ui/success-driver-icon";
import { canAccessReport, isFreePlan, withReportAccessRecorded } from "@/lib/candidateUsage";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import type {
  InterviewReport,
  InterviewReportDriver,
  InterviewTrainingRecommendation,
} from "@/lib/proofdiveTypes";
import {
  scoringBadgeClass,
  scoringFillClass,
  scoringLabelForScore,
  scoringTextClass,
} from "@/lib/scoringPalette";
import { SUCCESS_DRIVERS, SUCCESS_DRIVER_ORDER, type SuccessDriverId } from "@/lib/successDrivers";
import { useLocalStorageState } from "@/lib/useLocalStorageState";
import { useCandidateSubscription } from "@/lib/useSubscriberPayments";
import { cn } from "@/lib/utils";

import { FieldLabel, QuestionRow, ScoreChip, SpotlightRewrite } from "./ReportV2Answers";
import {
  deriveInsights,
  fmtDate,
  fmtDuration,
  sessionTypeLabel,
} from "./reportV2Model";
import { HowScoringWorks } from "@/components/report/HowScoringWorks";
import { ReportV2Nav } from "./ReportV2Nav";
import { ReportV2Transcript } from "./ReportV2Transcript";

type Props = { reportId: string };

/* ------------------------------------------------------------------------ */
/* Section chrome                                                            */
/* ------------------------------------------------------------------------ */

/** Every section opens the same way: a title the nav can point at, one line
 *  saying what the section is for, and room on the right for a control. */
function SectionHeader({
  title,
  lede,
  right,
}: {
  title: string;
  lede: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-h3 text-text-primary">{title}</h2>
        <p className="mt-1 max-w-[62ch] text-caption text-text-secondary">{lede}</p>
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

/** Section anchor: offset for the sticky header + nav so a jump lands the
 *  title just under the bar instead of behind it. */
function Section({
  id,
  children,
  className,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("scroll-mt-32", className)}>
      {children}
    </section>
  );
}

const GLASS_CARD =
  "rounded-[20px] border border-border/70 bg-[linear-gradient(114.96deg,var(--glass-from)_0%,var(--glass-to)_98.96%)] shadow-[inset_0_1px_0_var(--glass-inset)] backdrop-blur-[42px]";

/* ------------------------------------------------------------------------ */
/* Drivers                                                                   */
/* ------------------------------------------------------------------------ */

function DriverCard({ driver }: { driver: InterviewReportDriver }) {
  const id = driver.id as SuccessDriverId;
  const meta = SUCCESS_DRIVERS[id];
  const pct = Math.round(((driver.score - 1) / 4) * 100);
  return (
    <div className="flex flex-col rounded-[16px] border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-1000 text-extended-blue">
          <SuccessDriverIcon driver={id} className="size-5 text-current" />
        </span>
        <div className="flex items-baseline gap-1 font-gilroy tabular-nums">
          <span className={cn("text-[28px] leading-none tracking-[-1.4px]", scoringTextClass(driver.score))}>
            {driver.score.toFixed(1)}
          </span>
          <span className="text-body-sm text-text-secondary/70">/5</span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1.5">
        <span className="text-body-sm font-semibold text-text-primary">{meta.shortLabel}</span>
        <SuccessDriverInfoTip driver={id} />
      </div>
      <div className="text-caption text-text-secondary">{meta.label}</div>

      <div className="mt-3 flex items-center gap-3">
        <ProgressBar
          value={pct}
          aria-label={`${meta.shortLabel} score`}
          className="h-1.5"
          indicatorClassName={cn("h-1.5 border-transparent", scoringFillClass(driver.score))}
        />
        <Badge variant="outline" className={cn("shrink-0", scoringBadgeClass(driver.status))}>
          {driver.status}
        </Badge>
      </div>

      <FieldLabel className="mt-5">Competency breakdown</FieldLabel>
      <ul className="mt-2 divide-y divide-border">
        {driver.subSkills.map((s) => (
          <li key={s.name} className="flex items-center justify-between gap-3 py-2">
            <span className="flex min-w-0 items-center gap-2 text-caption text-text-primary">
              <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", scoringFillClass(s.score))} />
              <span className="truncate">{s.name}</span>
            </span>
            <span className="flex shrink-0 items-baseline gap-0.5 font-gilroy text-caption tabular-nums">
              <span className={cn("font-semibold", scoringTextClass(s.score))}>{s.score.toFixed(1)}</span>
              <span className="text-text-secondary/70">/5</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Trainings                                                                 */
/* ------------------------------------------------------------------------ */

function trainingDriver(pillar: string): SuccessDriverId | null {
  const key = pillar.trim().toLowerCase();
  return SUCCESS_DRIVER_ORDER.find((id) => SUCCESS_DRIVERS[id].shortLabel.toLowerCase() === key) ?? null;
}

function TrainingMeta({ t }: { t: InterviewTrainingRecommendation }) {
  const driver = trainingDriver(t.pillar);
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {driver ? (
        <Badge>
          <SuccessDriverIcon driver={driver} className="text-current" />
          {SUCCESS_DRIVERS[driver].shortLabel}
        </Badge>
      ) : (
        <Badge>{t.pillar}</Badge>
      )}
      <Badge>{t.difficulty}</Badge>
      <Badge>{t.durationMinutes} min</Badge>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Screen                                                                    */
/* ------------------------------------------------------------------------ */

export function ReportV2Screen({ reportId }: Props) {
  // The stored reports map, read through the same hook the rest of the app
  // uses: the first client render matches SSR, and `hydrated` tells us when
  // "not in the map" means "missing" rather than "not read yet".
  const [reportsMap, , reportsHydrated] = useLocalStorageState<Record<string, InterviewReport>>(
    StorageKeys.reports,
    {},
  );
  /** `undefined` = storage not read yet. */
  const report: InterviewReport | null | undefined = reportsHydrated
    ? (reportsMap[reportId] ?? null)
    : undefined;

  const [subscription] = useCandidateSubscription();
  const [accessedReportIds, setAccessedReportIds] = useLocalStorageState<string[]>(
    StorageKeys.candidateAccessedReportIds,
    [],
  );
  const accessRecordedRef = useRef<string | null>(null);

  const freePlan = isFreePlan(subscription);
  const reportAllowed = canAccessReport(reportId, accessedReportIds, freePlan);

  // The upgrade modal opens by itself when the report is locked, and again on
  // demand from the Upgrade buttons. Derived, not synced: the locked case is
  // a fact about the data, so it needs no effect — only a "dismissed" flag so
  // closing it once does not reopen it on the next render.
  const [lockDismissed, setLockDismissed] = useState(false);
  const [upgradeRequested, setUpgradeRequested] = useState(false);
  const locked = report != null && !reportAllowed;
  const upgradeModalOpen = upgradeRequested || (locked && !lockDismissed);
  const onUpgradeModalChange = useCallback((open: boolean) => {
    setUpgradeRequested(open);
    if (!open) setLockDismissed(true);
  }, []);
  const setUpgradeModalOpen = useCallback((open: boolean) => onUpgradeModalChange(open), [onUpgradeModalChange]);

  // Same plan rule as the current report — one free report — recorded the
  // same way, so opening either version counts once. Recorded on the next
  // tick: this is a write to storage on behalf of the page mount, not state
  // the render depends on, so it must not run synchronously inside the effect.
  useEffect(() => {
    if (report == null || !reportAllowed) return;
    if (accessRecordedRef.current === reportId) return;
    accessRecordedRef.current = reportId;
    const t = window.setTimeout(() => {
      setAccessedReportIds((prev) => withReportAccessRecorded(reportId, prev));
    }, 0);
    return () => window.clearTimeout(t);
  }, [report, reportAllowed, reportId, setAccessedReportIds]);

  const [openQuestions, setOpenQuestions] = useState<Record<string, boolean>>({});
  const printRestoreRef = useRef<Record<string, boolean> | null>(null);

  const insights = useMemo(() => (report ? deriveInsights(report) : null), [report]);
  const spotlightQuestion = useMemo(() => {
    if (!report) return null;
    return report.questions.find((q) => q.id === report.spotlight.questionId) ?? insights?.weakestQuestion ?? null;
  }, [report, insights]);

  const allOpen = report ? report.questions.every((q) => openQuestions[q.id]) : false;
  const setAll = useCallback(
    (open: boolean) => {
      if (!report) return;
      setOpenQuestions(Object.fromEntries(report.questions.map((q) => [q.id, open])));
    },
    [report],
  );

  /** Open a question row and bring it into view — used by the coach summary's
   *  "See answer" links so evidence is one click from the claim. */
  const revealQuestion = useCallback((id: string) => {
    setOpenQuestions((prev) => ({ ...prev, [id]: true }));
    window.requestAnimationFrame(() => {
      document.getElementById(`q-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const onDownload = useCallback(() => {
    if (!report) return;
    if (!canAccessReport(reportId, accessedReportIds, freePlan)) {
      setUpgradeModalOpen(true);
      return;
    }
    printRestoreRef.current = openQuestions;
    flushSync(() => setAll(true));
    const prevTitle = document.title;
    document.title = `Session report — ${report.meta.roleTitle}`;
    const restore = () => {
      window.removeEventListener("afterprint", restore);
      document.title = prevTitle;
      if (printRestoreRef.current) setOpenQuestions(printRestoreRef.current);
      printRestoreRef.current = null;
    };
    window.addEventListener("afterprint", restore);
    window.setTimeout(() => window.print(), 50);
  }, [report, reportId, accessedReportIds, freePlan, openQuestions, setAll, setUpgradeModalOpen]);

  const chatBar = <CoachBottomChatBar placeholder="Ask AI Coach about this report" />;

  /* ---- Loading / missing / locked -------------------------------------- */

  if (report === undefined) {
    return (
      <AppShell contentTopClassName="pt-16">
        <CoachFloatingNav />
        <div className="pb-44" aria-busy="true">
          <div className="h-4 w-40 animate-pulse rounded bg-surface" />
          <div className="mt-4 h-10 w-3/4 animate-pulse rounded bg-surface" />
          <div className="mt-8 h-56 w-full animate-pulse rounded-[20px] bg-surface" />
        </div>
        {chatBar}
      </AppShell>
    );
  }

  if (report === null) {
    return (
      <AppShell contentTopClassName="pt-16">
        <CoachFloatingNav />
        <div className="pb-44">
          <div className="rounded-[16px] border border-border bg-card p-6">
            <h1 className="text-h4 text-text-primary">We can&apos;t find this report</h1>
            <p className="mt-2 max-w-[60ch] text-caption leading-6 text-text-secondary">
              Reports are stored on the device where the session was recorded. If you just finished
              a session, it may not have saved — end the session again to generate a new report.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild>
                <Link href="/interview">
                  <ArrowLeft />
                  Back to sessions
                </Link>
              </Button>
            </div>
          </div>
        </div>
        {chatBar}
      </AppShell>
    );
  }

  const overall = report.overallScore;
  const role = report.meta.roleTitle.trim();

  if (!reportAllowed) {
    return (
      <AppShell contentTopClassName="pt-16">
        <CoachFloatingNav />
        <div className="pb-44">
          <div className="rounded-[16px] border border-border bg-card p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>Report ready</Badge>
              <Badge variant="outline" className={scoringBadgeClass(overall)}>
                {scoringLabelForScore(overall)} · {overall.toFixed(1)} / 5
              </Badge>
            </div>
            <h1 className="mt-3 text-h4 text-text-primary">This report is on a paid plan</h1>
            <p className="mt-2 max-w-[60ch] text-caption leading-6 text-text-secondary">
              Your Free plan includes one full report, and you&apos;ve used it. Upgrade to open this
              one — your {role} session, {fmtDuration(report.meta.durationSeconds)},{" "}
              {report.meta.questionCount} questions — and every report after it.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button type="button" onClick={() => setUpgradeModalOpen(true)}>
                Upgrade plan
              </Button>
              <Button asChild variant="outline">
                <Link href="/interview">Back to sessions</Link>
              </Button>
            </div>
          </div>
        </div>
        {chatBar}
        <GenericUpgradeModal open={upgradeModalOpen} onOpenChange={onUpgradeModalChange} />
      </AppShell>
    );
  }

  /* ---- The report --------------------------------------------------------- */

  const featured = report.trainings.featured;

  return (
    <AppShell contentTopClassName="pt-6">
      <CoachFloatingNav />

      {/* Toolbar: the way out on the left, the two actions on the right. Both
          actions are quiet — the result, not the exits, is the page's job. */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href="/interview"
          className="inline-flex items-center gap-1.5 text-caption font-semibold text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to sessions
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/report/${encodeURIComponent(reportId)}`} className="app-link mr-2 text-caption">
            Current report
          </Link>
          <Button variant="outline" size="sm" onClick={onDownload}>
            <Download />
            Download PDF
          </Button>
          <Button asChild size="sm">
            <Link href="/interview">
              <RotateCcw />
              Retake session
            </Link>
          </Button>
        </div>
      </div>

      {/* Header */}
      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-2 text-overline text-text-secondary">
          <span className="font-medium uppercase tracking-wide">Session report</span>
          <Badge variant="outline">{report.meta.versionLabel}</Badge>
          <span className="font-mono">#{report.meta.id}</span>
        </div>
        <h1 className="mt-2 max-w-[24ch] text-agent-heading text-extended-blue [text-wrap:balance]">
          Analytics &amp; coaching for {role}
        </h1>
        <p className="mt-3 flex flex-wrap items-center gap-x-2 text-caption text-text-secondary">
          <span>{sessionTypeLabel(report)}</span>
          <span aria-hidden>·</span>
          <span>{fmtDate(report.meta.createdAt)}</span>
          <span aria-hidden>·</span>
          <span>{fmtDuration(report.meta.durationSeconds)}</span>
          <span aria-hidden>·</span>
          <span>{report.meta.questionCount} questions</span>
        </p>
      </header>

      {/* Direct child of the content column on purpose: a sticky element can
          only travel within its parent, and a wrapper the height of the bar
          would pin it to nothing. */}
      <ReportV2Nav overall={overall} ready={Boolean(report)} className="mt-6" />

      <div className="flex flex-col gap-14 pb-44 pt-8 print:pb-0">
        {/* 1 — Verdict ------------------------------------------------------ */}
        <Section id="verdict">
          <div className={cn(GLASS_CARD, "p-6 sm:p-8")}>
            <div className="grid gap-8 lg:grid-cols-[auto_1fr_auto] lg:gap-10">
              {/* Score */}
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1.5 font-gilroy tabular-nums">
                  <span
                    className={cn(
                      "text-[72px] leading-none tracking-[-3.6px]",
                      scoringTextClass(overall),
                    )}
                  >
                    {overall.toFixed(1)}
                  </span>
                </div>
                <div className="mt-2 text-overline font-medium uppercase tracking-wide text-text-secondary">
                  Out of 5.0
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Badge variant="outline" className={scoringBadgeClass(overall)}>
                    {scoringLabelForScore(overall)}
                  </Badge>
                  <span className="text-overline font-medium uppercase tracking-wide text-text-secondary">
                    Overall verdict
                  </span>
                </div>
              </div>

              {/* Why */}
              <div className="min-w-0 max-w-[62ch]">
                <h2 className="text-h4 leading-snug text-text-primary [text-wrap:balance]">
                  {report.headline}
                </h2>
                <p className="mt-3 text-body-sm leading-7 text-text-secondary">{report.summary}</p>
                {insights?.potentialOverall ? (
                  <p className="mt-3 text-caption text-text-secondary">
                    If {SUCCESS_DRIVERS[insights.weakestDriver.id as SuccessDriverId].shortLabel} matched
                    your other drivers, your overall would be{" "}
                    <span className={cn("font-semibold", scoringTextClass(insights.potentialOverall))}>
                      {insights.potentialOverall.toFixed(1)}
                    </span>
                    .
                  </p>
                ) : null}
              </div>

              {/* This session */}
              <dl className="grid content-start gap-3 rounded-[14px] border border-border/70 bg-card/60 p-4 text-caption lg:w-56">
                <div className="text-overline font-medium uppercase tracking-wide text-text-secondary">
                  This session
                </div>
                <div>
                  <dt className="text-text-secondary">Role</dt>
                  <dd className="font-semibold text-text-primary">{role}</dd>
                </div>
                <div>
                  <dt className="text-text-secondary">Assessed on</dt>
                  <dd className="mt-1 flex flex-wrap gap-1">
                    {report.meta.pillarChips.map((chip) => (
                      <Badge key={chip}>{chip}</Badge>
                    ))}
                  </dd>
                </div>
                <div className="flex gap-4">
                  <div>
                    <dt className="text-text-secondary">Questions</dt>
                    <dd className="font-semibold tabular-nums text-text-primary">{report.meta.questionCount}</dd>
                  </div>
                  <div>
                    <dt className="text-text-secondary">Length</dt>
                    <dd className="font-semibold tabular-nums text-text-primary">
                      {fmtDuration(report.meta.durationSeconds)}
                    </dd>
                  </div>
                </div>
              </dl>
            </div>

            {/* One next step, right under the verdict. The full list is at the
                bottom; this is the single thing to do if you read nothing else. */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-5">
              <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-overline font-medium uppercase tracking-wide text-text-secondary">
                  Recommended next step
                </span>
                <span className="text-caption font-semibold text-text-primary">{featured.title}</span>
                <span className="text-caption text-text-secondary">{featured.durationMinutes} min</span>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <a href="#rewrite" className="app-link text-caption">
                  See the rewrite
                </a>
                <Button asChild size="sm" variant="outline">
                  <Link href={featured.href}>
                    Start training
                    <ArrowUpRight />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </Section>

        {/* 2 — Drivers ------------------------------------------------------ */}
        <Section id="drivers">
          <SectionHeader
            title="How your score breaks down"
            lede="Four Success Drivers, three competencies each. Your overall is their average."
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {report.drivers.map((d) => (
              <DriverCard key={d.id} driver={d} />
            ))}
          </div>
          <div className="mt-4">
            <HowScoringWorks />
          </div>
        </Section>

        {/* 3 — Coach summary ------------------------------------------------ */}
        <Section id="coach">
          <SectionHeader
            title="What AI Coach saw in your session"
            lede="Summary of strengths, gaps, and how you showed up."
          />
          <div className="mt-6 rounded-[16px] border border-border bg-card">
            <div className="px-6 pt-6">
              <Badge>AI Coach</Badge>
              <p className="mt-3 max-w-[72ch] text-body-sm leading-7 text-text-primary">
                {report.narrative.paragraph}
              </p>
            </div>

            {insights ? (
              <div className="mt-6 grid gap-px border-t border-border bg-border lg:grid-cols-2">
                <div className="bg-card px-6 py-5">
                  <div className="flex items-center gap-2 text-caption font-semibold text-scoring-green-fg">
                    <TrendingUp className="size-4" aria-hidden />
                    What carried your score
                  </div>
                  <ul className="mt-3 flex flex-col gap-3">
                    <li className="flex items-center justify-between gap-3">
                      <span className="flex min-w-0 items-center gap-2 text-caption text-text-primary">
                        <SuccessDriverIcon
                          driver={insights.strongestDriver.id as SuccessDriverId}
                          className="size-4 text-extended-blue"
                        />
                        <span className="truncate">
                          <span className="font-semibold">{insights.strongestDriver.fullTitle}</span>
                          <span className="text-text-secondary"> — your strongest driver</span>
                        </span>
                      </span>
                      <ScoreChip score={insights.strongestDriver.score} />
                    </li>
                    <li className="flex items-center justify-between gap-3">
                      <span className="min-w-0 truncate text-caption text-text-primary">
                        <span className="font-semibold">Q{insights.bestQuestion.index}</span>
                        <span className="text-text-secondary"> · {insights.bestQuestion.facet} — best answer</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <ScoreChip score={insights.bestQuestion.score} />
                        <button
                          type="button"
                          onClick={() => revealQuestion(insights.bestQuestion.id)}
                          className="app-link text-overline"
                        >
                          See answer
                        </button>
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="bg-card px-6 py-5">
                  <div className="flex items-center gap-2 text-caption font-semibold text-scoring-red-fg">
                    <TrendingDown className="size-4" aria-hidden />
                    What held it back
                  </div>
                  <ul className="mt-3 flex flex-col gap-3">
                    <li className="flex items-center justify-between gap-3">
                      <span className="flex min-w-0 items-center gap-2 text-caption text-text-primary">
                        <SuccessDriverIcon
                          driver={insights.weakestDriver.id as SuccessDriverId}
                          className="size-4 text-extended-blue"
                        />
                        <span className="truncate">
                          <span className="font-semibold">{insights.weakestDriver.fullTitle}</span>
                          <span className="text-text-secondary"> — your weakest driver</span>
                        </span>
                      </span>
                      <ScoreChip score={insights.weakestDriver.score} />
                    </li>
                    <li className="flex items-center justify-between gap-3">
                      <span className="min-w-0 truncate text-caption text-text-primary">
                        <span className="font-semibold">Q{insights.weakestQuestion.index}</span>
                        <span className="text-text-secondary"> · {insights.weakestQuestion.facet} — weakest answer</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <ScoreChip score={insights.weakestQuestion.score} />
                        <a href="#rewrite" className="app-link text-overline">
                          See the rewrite
                        </a>
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            ) : null}
          </div>
        </Section>

        {/* 4 — Weakest answer ----------------------------------------------- */}
        {spotlightQuestion ? (
          <Section id="rewrite">
            <SectionHeader
              title="How to improve your weakest answer"
              lede="Your lowest-scoring answer, rewritten the way it should sound — and what your delivery was doing while you gave it."
            />
            <div className="mt-6">
              <SpotlightRewrite report={report} question={spotlightQuestion} />
            </div>
          </Section>
        ) : null}

        {/* 5 — Answers ------------------------------------------------------ */}
        <Section id="answers">
          <SectionHeader
            title="Your answers — question by question"
            lede="Expand a row for the competency it tested, what you said, and what would have scored higher."
            right={
              <Button type="button" variant="ghost" size="sm" onClick={() => setAll(!allOpen)}>
                {allOpen ? "Collapse all" : "Expand all"}
              </Button>
            }
          />
          <ol className="mt-6 flex flex-col gap-3">
            {report.questions.map((q) => (
              <QuestionRow
                key={q.id}
                q={q}
                open={Boolean(openQuestions[q.id])}
                onToggle={() => setOpenQuestions((prev) => ({ ...prev, [q.id]: !prev[q.id] }))}
                isSpotlight={q.id === spotlightQuestion?.id}
              />
            ))}
          </ol>
        </Section>

        {/* 6 — Transcript --------------------------------------------------- */}
        <Section id="transcript">
          <SectionHeader
            title="Recording & transcript"
            lede="The full conversation, with AI Coach's flags at the moments an answer lost points."
          />
          <div className="mt-6">
            <ReportV2Transcript report={report} />
          </div>
        </Section>

        {/* 7 — Next steps --------------------------------------------------- */}
        <Section id="next">
          <SectionHeader
            title="What to work on next"
            lede="Based on your session — AI Coach's picks for your next training."
          />
          <div className="mt-6 rounded-[16px] border border-brand-700 bg-brand-1000/40 p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default">Featured</Badge>
              <TrainingMeta t={featured} />
            </div>
            <h3 className="mt-3 max-w-[40ch] text-h4 text-text-primary">{featured.title}</h3>
            <p className="mt-1.5 max-w-[62ch] text-caption leading-relaxed text-text-secondary">
              {featured.description}
            </p>
            <Button asChild className="mt-5">
              <Link href={featured.href}>
                Start training module
                <ArrowRight />
              </Link>
            </Button>
          </div>
          <ul className="mt-4 grid gap-4 md:grid-cols-3">
            {report.trainings.more.map((t) => (
              <li key={t.id} className="flex flex-col rounded-[16px] border border-border bg-card p-5">
                <TrainingMeta t={t} />
                <h3 className="mt-3 text-body-sm font-semibold text-text-primary">{t.title}</h3>
                <p className="mt-1 flex-1 text-caption leading-relaxed text-text-secondary">{t.description}</p>
                <Link href={t.href} className="app-link mt-4 inline-flex items-center gap-1 text-caption font-medium">
                  Start training
                  <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </Section>

        {/* Close ------------------------------------------------------------- */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8 print:hidden">
          <div>
            <div className="text-body-sm font-semibold text-text-primary">Ready to go again?</div>
            <p className="mt-1 text-caption text-text-secondary">
              Another session for {role} will be scored the same way, so you can see the difference.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/interview">Back to sessions</Link>
            </Button>
            <Button asChild>
              <Link href="/interview">
                <RotateCcw />
                Retake session
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {chatBar}
      <GenericUpgradeModal open={upgradeModalOpen} onOpenChange={onUpgradeModalChange} />
    </AppShell>
  );
}
