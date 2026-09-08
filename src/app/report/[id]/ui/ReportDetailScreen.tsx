"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";

import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { LogoMark } from "@/components/ui/logo";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/components/cn";
import { CoachBottomChatBar } from "@/components/CoachBottomChatBar";
import { CoachFloatingNav } from "@/components/CoachFloatingNav";
import { GenericUpgradeModal } from "@/components/GenericUpgradeModal";
import { Button } from "@/components/ui/button";
import { SuccessDriverIcon } from "@/components/ui/success-driver-icon";
import {
  SuccessDriverCompetencyPill,
  SuccessDriverInfoTip,
} from "@/components/ui/success-driver-card";
import { TranscriptReplay } from "@/components/interview/TranscriptReplay";
import {
  AudioLines,
  ArrowUpRight,
  BookOpen,
  Calendar,
  ClipboardList,
  Hash,
  History,
  ListChecks,
  ChartNoAxesColumn,
  Check,
  ChevronDown,
  ChevronLeft,
  Clock3,
  Download,
  Hand,
  Lightbulb,
  ListTree,
  MessageSquareQuote,
  PersonStanding,
  Podium,
  RotateCcw,
  SpellCheck,
  Tag,
  TrendingDown,
  TrendingUp,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import {
  canAccessReport,
  isFreePlan,
  withReportAccessRecorded,
} from "@/lib/candidateUsage";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import type {
  InterviewReport,
  InterviewReportDriver,
  InterviewReportQuestion,
  ReadinessLabel,
} from "@/lib/proofdiveTypes";
import {
  SUCCESS_DRIVER_ORDER,
  SUCCESS_DRIVERS,
  type SuccessDriverId,
} from "@/lib/successDrivers";
import {
  scoringBadgeClass,
  scoringLabelForScore,
  scoringTextClass,
} from "@/lib/scoringPalette";
import { useLocalStorageState } from "@/lib/useLocalStorageState";
import { useCandidateSubscription } from "@/lib/useSubscriberPayments";

type Props = { reportId: string };

function safeParseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Status tint without the stroke. The shared palette draws a 25% border
 *  around every band pill; on this page the tint alone carries the band, and
 *  the stroke only added an outline to something that already reads as a tag.
 *  Every status badge on the report goes through here, so they all match. */
function badgeClasses(scoreOrLabel: ReadinessLabel | number) {
  return cn(scoringBadgeClass(scoreOrLabel), "border-transparent");
}

function scoreTextClasses(score: number) {
  return scoringTextClass(score);
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Unknown date";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

/** The session KIND, the way the reference report leads its meta line. The
 *  stored `interviewName` is the generic "Mock interview" unless a specific
 *  name was recorded. */
function sessionTypeLabel(report: InterviewReport): string {
  const name = report.meta.interviewName?.trim();
  if (name && name.toLowerCase() !== "mock interview") return name;
  return "Role-based mock";
}

function fmtDuration(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const mm = Math.floor(s / 60);
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}m ${ss}s`;
}

/** "short of 3–4 min" / "over 3–4 min" — the one piece of question metadata
 *  the user can act on directly. Null when there is no window or the answer
 *  landed inside it (then the time alone is the fact). */
function answerLengthNote(q: InterviewReportQuestion): string | null {
  if (!q.idealRangeSeconds) return null;
  const [lo, hi] = q.idealRangeSeconds;
  const range = `${Math.round(lo / 60)}–${Math.round(hi / 60)} min`;
  if (q.timeSeconds < lo) return `short of ${range}`;
  if (q.timeSeconds > hi) return `over ${range}`;
  return null;
}

/** The question's number as its own mark — what makes a list of eight rows
 *  scannable, and the same mark the rewrite section can point back to. */
function QuestionNumber({ index, className }: { index: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-lg bg-brand-1000 text-caption font-medium tabular-nums text-extended-blue",
        className,
      )}
    >
      Q{index}
    </span>
  );
}

/** The three beats the coach rewrite is built on. "Why this version is
 *  stronger" is keyed to them when it has exactly three points. */
const CAR_STEPS = ["Context", "Action", "Result"] as const;

const FALLBACK_IMPROVEMENT_ICONS: LucideIcon[] = [
  Lightbulb,
  Tag,
  ListTree,
  ChartNoAxesColumn,
];

function improvementIconFor(title: string, index: number): LucideIcon {
  const t = title.toLowerCase();
  if (/(quantif|metric|number|measur|data)/.test(t)) return ChartNoAxesColumn;
  if (/(“i”|"i"|’i’|'i'|ownership|language|yourself)/.test(t)) return UserRound;
  if (/(structur|car\b|tighten|organiz|framework)/.test(t)) return ListTree;
  return FALLBACK_IMPROVEMENT_ICONS[index % FALLBACK_IMPROVEMENT_ICONS.length]!;
}

function PanelLabel({
  icon: Icon,
  children,
  hint,
}: {
  /** A Lucide icon or `LogoMark` — anything that takes a className. */
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  children: string;
  /** One-line explainer after the label, e.g. "What you said". */
  hint?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
        <Icon className="size-4" aria-hidden />
      </span>
      <span className="text-overline text-extended-cyan-green">{children}</span>
      {hint ? <span className="text-caption text-text-secondary">— {hint}</span> : null}
    </div>
  );
}

function useStickySummary(
  sentinelRef: React.RefObject<HTMLElement | null>,
  /** True once the report tree — and so the sentinel — is actually mounted.
   *  The hook used to attach on first render, while the loading card was
   *  showing and there was no sentinel to observe, so the bar never appeared. */
  enabled: boolean,
) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    // Scroll position, not IntersectionObserver. The observer had two holes:
    // "not intersecting" was true while the sentinel was still BELOW the fold
    // on first paint (so the bar showed at scroll 0 on any viewport shorter
    // than the hero card), and it only fires on a state CHANGE — an anchor
    // jump or fast scroll that carries the sentinel from below the viewport
    // to above it in one frame never intersects, so the bar never appeared.
    // Reading the rect on scroll answers the one question exactly: is the
    // sentinel above the app header (h-14 = 56px)?
    let frame = 0;
    const update = () => {
      frame = 0;
      setShow(sentinel.getBoundingClientRect().top < 56);
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [sentinelRef, enabled]);

  return show;
}

function SectionTitle({
  title,
  subtitle,
  right,
}: {
  title: React.ReactNode;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <div className="text-h5 text-text-primary">{title}</div>
        {subtitle ? <div className="mt-1 text-caption text-text-secondary">{subtitle}</div> : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

function MetaChip({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex h-6 items-center gap-1.5 rounded-full border border-pill-border bg-pill-surface py-0 pl-1 pr-2 text-pill-foreground">
      {icon}
      <span className="text-[11px] leading-4 font-medium tracking-[0.5px] text-pill-foreground">
        {children}
      </span>
    </span>
  );
}

/** Compact score, for a row where the number is a fact beside a name rather
 *  than the headline — the AI Coach card's carried / held-back lists. */
function ScoreChip({ score }: { score: number }) {
  return (
    <span className="inline-flex h-6 shrink-0 items-center gap-0.5 rounded-full border border-border bg-card px-2 text-overline font-medium tabular-nums">
      <span className={scoreTextClasses(score)}>{score.toFixed(1)}</span>
      <span className="text-text-secondary/60">/5</span>
    </span>
  );
}

function ScoreLockup({ score }: { score: number }) {
  return (
    <div className="flex shrink-0 items-baseline gap-1 font-gilroy whitespace-nowrap">
      <span
        className={cn(
          "cap-baseline w-[72px] text-right text-[32px] font-medium leading-none tracking-[-1.6px] tabular-nums",
          scoreTextClasses(score),
        )}
      >
        {score.toFixed(1)}
      </span>
      <span className="cap-baseline text-[24px] font-medium leading-none tracking-[-1.2px] text-text-secondary/60">
        /5
      </span>
    </div>
  );
}

function DriverRow({
  driver,
  expanded,
  onToggle,
}: {
  driver: InterviewReportDriver;
  expanded: boolean;
  onToggle: () => void;
}) {
  const score = driver.score;
  const driverId = driver.id as SuccessDriverId;
  return (
    <div className="-mx-6 border-t border-extended-green px-6 py-[18px]">
      <div className="flex w-full flex-wrap items-center gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <SuccessDriverIcon
            driver={driverId}
            className="size-4 shrink-0 text-text-primary"
          />
          <span className="truncate text-[16px] font-medium tracking-[-0.5px] text-text-primary">
            {driver.fullTitle}
          </span>
          <SuccessDriverInfoTip driver={driverId} />
        </div>
        <span
          className={cn(
            "inline-flex items-center justify-center overflow-hidden rounded-full border border-solid px-[9px] py-[3px] text-[12px] font-medium leading-[1.2]",
            badgeClasses(driver.status),
          )}
        >
          {driver.status}
        </span>
        <ScoreLockup score={score} />
      </div>
      <div className="mt-3">
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex items-center gap-2 text-caption font-semibold text-extended-dark-cyan"
          aria-expanded={expanded}
        >
          {expanded ? "Hide breakdown" : "Show breakdown"}
          <ChevronDown
            className={cn("size-4 transition-transform", expanded ? "rotate-180" : "rotate-0")}
            aria-hidden
          />
        </button>
        {expanded ? (
          <div className="mt-4 divide-y divide-border">
            {driver.subSkills.map((s) => (
              <div key={s.name} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                <div className="min-w-0 truncate text-caption text-text-primary">{s.name}</div>
                <div className="flex shrink-0 items-baseline gap-0.5 font-gilroy whitespace-nowrap">
                  <span className={cn("text-caption font-semibold", scoreTextClasses(s.score))}>
                    {s.score.toFixed(1)}
                  </span>
                  <span className="text-caption font-semibold text-text-secondary/60">/5</span>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function QuestionRow({
  q,
  open,
  onToggle,
  isSpotlight,
}: {
  q: InterviewReportQuestion;
  open: boolean;
  onToggle: () => void;
  /** This is the answer the rewrite section below works on. */
  isSpotlight: boolean;
}) {
  return (
    <Card id={`q-${q.id}`} className="gap-0 py-0 overflow-hidden scroll-mt-28">
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left"
        aria-expanded={open}
        aria-controls={`q-panel-${q.id}`}
      >
        {/* Everything on the row centres on the two-line block (tags, then the
            question): the number mark, the status + score cluster and the
            chevron all sit on the same axis, so a closed row reads as one line
            of information rather than three things at three heights. */}
        <CardContent className="flex items-center gap-3 p-5">
          <QuestionNumber index={q.index} />
          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <SuccessDriverCompetencyPill
                  variant="filled"
                  driver={q.driver as SuccessDriverId}
                  label={
                    <>
                      {SUCCESS_DRIVERS[q.driver as SuccessDriverId].shortLabel}
                      {" · "}
                      {q.facet}
                    </>
                  }
                />
                <span className="inline-flex h-6 items-center gap-1.5 rounded-full border border-pill-border bg-pill-surface py-0 pl-1 pr-2">
                  <Clock3 className="size-3.5 shrink-0 text-pill-foreground" aria-hidden />
                  <span className="text-[11px] leading-4 font-medium tracking-[0.5px] tabular-nums text-pill-foreground">
                    {fmtDuration(q.timeSeconds)}
                    {answerLengthNote(q) ? (
                      <span className="text-scoring-yellow-fg">
                        {" · "}
                        {answerLengthNote(q)}
                      </span>
                    ) : null}
                  </span>
                </span>
                {isSpotlight ? <Badge>Weakest answer</Badge> : null}
              </div>

              <div className="mt-3 text-body-sm font-semibold text-text-primary">
                “{q.text}”
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2.5">
              <Badge variant="outline" className={badgeClasses(q.status)}>
                {q.status}
              </Badge>
              <ScoreLockup score={q.score} />
            </div>
          </div>
          <ChevronDown
            className={cn(
              "size-5 shrink-0 text-text-primary/60 transition-transform",
              open ? "rotate-180" : "rotate-0",
            )}
            aria-hidden
          />
        </CardContent>
      </button>

      {open ? (
        <div id={`q-panel-${q.id}`} className="border-t border-border">
          <CardContent className="p-5">
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="min-w-0">
                <PanelLabel icon={MessageSquareQuote}>Your answer</PanelLabel>
                <blockquote className="mt-3 rounded-lg border border-border bg-card p-4 text-caption leading-relaxed text-text-primary">
                  {q.answer}
                </blockquote>
              </div>
              <div className="min-w-0">
                <PanelLabel icon={LogoMark}>Areas for improvement</PanelLabel>
                <div className="mt-3 overflow-hidden rounded-lg border border-border bg-card">
                  <div className="divide-y divide-border">
                    {q.improvements.map((imp, index) => {
                      const Icon = improvementIconFor(imp.title, index);
                      return (
                        <div key={imp.title} className="flex items-start gap-3 p-4">
                          <Icon
                            className="mt-0.5 size-4 shrink-0 text-extended-cyan-green"
                            aria-hidden
                          />
                          <div className="min-w-0">
                            <div className="text-body-sm font-semibold text-extended-cyan-green">
                              {imp.title}
                            </div>
                            <p className="mt-1 text-caption leading-relaxed text-text-secondary">
                              {imp.detail}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      ) : null}
    </Card>
  );
}

export function ReportDetailScreen({ reportId }: Props) {
  const stickySentinelRef = useRef<HTMLDivElement | null>(null);

  /** `undefined` = not read yet (after mount we always read from localStorage). */
  const [report, setReport] = useState<InterviewReport | null | undefined>(undefined);
  const [subscription] = useCandidateSubscription();
  const [accessedReportIds, setAccessedReportIds] = useLocalStorageState<string[]>(
    StorageKeys.candidateAccessedReportIds,
    [],
  );
  const [nudgeSeen, setNudgeSeen] = useLocalStorageState<boolean>(
    StorageKeys.candidatePostInterviewUpgradeNudgeSeen,
    false,
  );
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const accessRecordedRef = useRef<string | null>(null);

  const freePlan = isFreePlan(subscription);
  const reportAllowed = canAccessReport(reportId, accessedReportIds, freePlan);
  const showSticky = useStickySummary(stickySentinelRef, report != null && reportAllowed);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(StorageKeys.reports);
      const map = safeParseJson<Record<string, InterviewReport>>(raw) ?? {};
      setReport(map[reportId] ?? null);
    } catch {
      setReport(null);
    }
  }, [reportId]);

  useEffect(() => {
    if (report == null) return;
    if (!reportAllowed) {
      setUpgradeModalOpen(true);
      return;
    }
    if (accessRecordedRef.current === reportId) return;
    accessRecordedRef.current = reportId;
    setAccessedReportIds((prev) => withReportAccessRecorded(reportId, prev));
    if (freePlan && !nudgeSeen) {
      setShowNudge(true);
      setNudgeSeen(true);
    }
  }, [
    report,
    reportAllowed,
    reportId,
    freePlan,
    nudgeSeen,
    setAccessedReportIds,
    setNudgeSeen,
  ]);

  const [driverExpanded, setDriverExpanded] = useState<Record<string, boolean>>({});
  const [openQuestions, setOpenQuestions] = useState<Record<string, boolean>>({});
  const printRestoreRef = useRef<{
    drivers: Record<string, boolean>;
    questions: Record<string, boolean>;
    title: string;
  } | null>(null);

  const missing = report === null;
  const overall = report?.overallScore ?? 0;

  const spotlightQuestion = useMemo(() => {
    if (!report) return null;
    return report.questions.find((q) => q.id === report.spotlight.questionId) ?? report.questions[0] ?? null;
  }, [report]);
  // The "Strongest" chip is computed from the questions rather than read from
  // `highlightChips.strongest`: the stored string can disagree with the scores
  // shown two sections lower (the mock says "Q3 · 3.8/5" while Q3 scores 2.2).
  const strongestQuestion = useMemo(() => {
    if (!report || report.questions.length === 0) return null;
    return [...report.questions].sort((a, b) => b.score - a.score)[0] ?? null;
  }, [report]);
  const [strongestDriver, weakestDriver] = useMemo(() => {
    if (!report || report.drivers.length === 0) return [null, null] as const;
    const sorted = [...report.drivers].sort((a, b) => b.score - a.score);
    return [sorted[0] ?? null, sorted[sorted.length - 1] ?? null] as const;
  }, [report]);
  /** Open a question row and bring it into view — evidence one click from
   *  the claim that cites it. */
  const revealQuestion = (id: string) => {
    setOpenQuestions((prev) => ({ ...prev, [id]: true }));
    window.requestAnimationFrame(() => {
      document.getElementById(`q-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  if (report === undefined) {
    return (
      <AppShell contentTopClassName="pt-16">
        <CoachFloatingNav />
        <div className="pb-44">
          <Card className="gap-0 py-0">
            <CardContent>
              <div className="text-h5 text-text-primary">Loading report…</div>
            </CardContent>
          </Card>
        </div>
        <CoachBottomChatBar placeholder="Ask AI Coach about this report" />
        <GenericUpgradeModal open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen} />
      </AppShell>
    );
  }

  if (missing) {
    return (
      <AppShell contentTopClassName="pt-16">
        <CoachFloatingNav />
        <div className="pb-44">
          <Card className="gap-0 py-0">
            <CardContent>
              <div className="text-h4 text-text-primary">We can&apos;t find this report</div>
              <div className="mt-3 max-w-2xl text-caption leading-6 text-text-secondary">
                Reports are stored on the device where the session was recorded. If you just finished
                a session, it may not have saved — end the session again to generate a new report.
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <Button asChild>
                  <Link href="/interview">Back to sessions</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/coach?journey=1">Go to Coach</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <CoachBottomChatBar placeholder="Ask AI Coach about this report" />
        <GenericUpgradeModal open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen} />
      </AppShell>
    );
  }

  if (!reportAllowed) {
    return (
      <AppShell contentTopClassName="pt-16">
        <CoachFloatingNav />
        <div className="pb-44">
          <Card className="gap-0 py-0">
            <CardContent className="space-y-4 p-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>Report ready</Badge>
                <Badge variant="outline" className={badgeClasses(report.overallScore)}>
                  {scoringLabelForScore(report.overallScore)} · {report.overallScore.toFixed(1)} / 5
                </Badge>
              </div>
              <div className="text-h4 text-text-primary">This report is on a paid plan</div>
              <p className="max-w-2xl text-caption leading-6 text-text-secondary">
                Your Free plan includes one full report, and you&apos;ve used it. Upgrade to open this
                one — your {report.meta.roleTitle} session, {fmtDuration(report.meta.durationSeconds)},{" "}
                {report.meta.questionCount} questions — and every report after it.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={() => setUpgradeModalOpen(true)}>
                  Upgrade plan
                </Button>
                <Button asChild variant="outline">
                  <Link href="/interview">Back to sessions</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <CoachBottomChatBar placeholder="Ask AI Coach about this report" />
        <GenericUpgradeModal open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen} />
      </AppShell>
    );
  }

  const carKeyed = report.spotlight.whyStronger.length === CAR_STEPS.length;
  const allQuestionsOpen = report.questions.every((q) => openQuestions[q.id]);

  return (
    <AppShell contentTopClassName="pt-16">
      <CoachFloatingNav />

      {showSticky ? (
        <div className="sticky top-14 z-10 -mx-6 border-b border-border bg-background/85 px-6 py-3 backdrop-blur print:hidden">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <div className="flex items-baseline gap-2">
              <div className={cn("text-caption font-semibold", scoreTextClasses(overall))}>
                {overall.toFixed(1)} / 5.0
              </div>
              <Badge variant="outline" className={badgeClasses(overall)}>
                {scoringLabelForScore(overall)}
              </Badge>
            </div>
            <div className="text-overline text-text-secondary">
              {report.meta.questionCount} questions · {fmtDuration(report.meta.durationSeconds)}
              {report.meta.hasAudio ? " · Audio" : ""}
              {report.meta.hasVideo ? " · Video" : ""}
            </div>
          </div>
        </div>
      ) : null}

      <div className="pb-44 print:pb-0">
        {showNudge ? (
          <div className="mb-4 flex flex-col gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
            <div className="flex min-w-0 items-start gap-3">
              <LogoMark className="mt-0.5 size-4 text-primary" />
              <div className="min-w-0">
                <p className="text-caption font-semibold text-text-primary">
                  Get more from your interview prep
                </p>
                <p className="mt-1 text-caption leading-5 text-text-secondary">
                  Upgrade your plan for additional mock interviews, reports, and coaching access.
                </p>
              </div>
            </div>
            <Button asChild size="sm" className="shrink-0 self-start sm:self-center">
              <Link href="/profile/pricing">Upgrade Plan</Link>
            </Button>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link
            href="/interview"
            className="inline-flex items-center gap-1.5 text-caption font-semibold text-text-primary/65 transition hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <ChevronLeft className="size-4 shrink-0" aria-hidden />
            Back to sessions
          </Link>
          <div className="flex shrink-0 flex-wrap items-center justify-start gap-2 sm:justify-end">
            {/* Review-only entry points: the redesigned report and the untouched
                original, both on the same data, so the three can be compared
                side by side. */}
            <span className="mr-2 inline-flex flex-wrap items-center gap-x-3 gap-y-1 text-caption font-medium">
              <Link
                href={`/report/${encodeURIComponent(reportId)}/v2`}
                className="app-link inline-flex items-center gap-1"
              >
                Preview redesigned report
              </Link>
              <span aria-hidden className="text-text-secondary/60">·</span>
              <Link
                href={`/report/${encodeURIComponent(reportId)}/original`}
                className="app-link inline-flex items-center gap-1"
              >
                <History className="size-3.5" aria-hidden />
                Original version
              </Link>
            </span>
            <Button
              variant="outline"
              size="default"
              onClick={() => {
                if (!canAccessReport(reportId, accessedReportIds, freePlan)) {
                  setUpgradeModalOpen(true);
                  return;
                }
                printRestoreRef.current = {
                  drivers: driverExpanded,
                  questions: openQuestions,
                  title: document.title,
                };
                flushSync(() => {
                  setDriverExpanded(
                    Object.fromEntries(report.drivers.map((d) => [d.id, true])),
                  );
                  setOpenQuestions(
                    Object.fromEntries(report.questions.map((q) => [q.id, true])),
                  );
                });
                const role = report.meta.roleTitle?.trim();
                document.title = role
                  ? `${report.meta.interviewName} — ${role}`
                  : report.meta.interviewName;

                const restore = () => {
                  window.removeEventListener("afterprint", restore);
                  const prev = printRestoreRef.current;
                  if (!prev) return;
                  printRestoreRef.current = null;
                  document.title = prev.title;
                  setDriverExpanded(prev.drivers);
                  setOpenQuestions(prev.questions);
                };
                window.addEventListener("afterprint", restore);
                window.setTimeout(() => window.print(), 50);
              }}
            >
              <Download />
              Download PDF
            </Button>
            <Button asChild variant="outline" size="default">
              <Link href="/interview">
                <RotateCcw />
                Retake session
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-4 min-w-0">
          {/* Version and id: stored on every report, never shown until now. */}
          <div className="mb-2 flex flex-wrap items-center gap-2 text-overline text-text-secondary">
            <Badge variant="outline">
              <Tag aria-hidden />
              {report.meta.versionLabel}
            </Badge>
            <span className="inline-flex items-center gap-0.5 font-mono">
              <Hash className="size-3" aria-hidden />
              {report.meta.id}
            </span>
          </div>
          <h1 className="text-agent-heading text-extended-blue">
            Session report — analytics &amp; coaching for{" "}
            <span className="rounded-sm bg-extended-light-cyan px-1 text-link">{report.meta.roleTitle}</span>
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <MetaChip icon={<ClipboardList className="size-3.5 shrink-0 text-pill-foreground" aria-hidden />}>
              {sessionTypeLabel(report)}
            </MetaChip>
            <MetaChip icon={<Calendar className="size-3.5 shrink-0 text-pill-foreground" aria-hidden />}>
              {fmtDate(report.meta.createdAt)}
            </MetaChip>
            <MetaChip icon={<Clock3 className="size-3.5 shrink-0 text-pill-foreground" aria-hidden />}>
              {fmtDuration(report.meta.durationSeconds)}
            </MetaChip>
            <MetaChip icon={<ListChecks className="size-3.5 shrink-0 text-pill-foreground" aria-hidden />}>
              {report.meta.questionCount} questions
            </MetaChip>
          </div>
        </div>

        <section className="mt-8">
          <div
            data-slot="card"
            className={cn(
              "flex w-full flex-col gap-2.5 rounded-[20px]",
              "px-6 py-4 backdrop-blur-[42px]",
              "bg-[linear-gradient(114.96deg,var(--glass-from)_0%,var(--glass-to)_98.96%)]",
            )}
          >
            <div className="flex w-full flex-wrap items-center justify-between gap-4 py-4">
              <div className="flex min-w-0 flex-1 items-baseline gap-4">
                <div className="flex w-[148px] shrink-0 items-baseline gap-1 font-gilroy whitespace-nowrap">
                  <span
                    className={cn(
                      "cap-baseline text-[64px] font-normal leading-none tracking-[-3.2px] tabular-nums",
                      scoreTextClasses(overall),
                    )}
                  >
                    {overall.toFixed(1)}
                  </span>
                  <span className="cap-baseline text-[48px] font-normal leading-none tracking-[-2.4px] text-text-secondary/60">
                    /5
                  </span>
                </div>
                <span className="cap-baseline text-[16px] font-medium tracking-[-0.5px] text-text-primary">
                  Overall performance
                </span>
              </div>
              <div className="flex shrink-0 flex-wrap items-center justify-end gap-x-2.5">
                <span className="text-overline font-medium uppercase tracking-wide text-text-secondary">
                  Overall verdict
                </span>
                <span
                  className={cn(
                    "inline-flex items-center justify-center overflow-hidden rounded-full border border-solid px-[9px] py-[3px] text-[12px] font-medium leading-[1.2]",
                    badgeClasses(overall),
                  )}
                >
                  {scoringLabelForScore(overall)}
                </span>
              </div>
            </div>

            <div className="text-body-sm font-semibold text-text-primary">{report.headline}</div>
            <div className="w-full text-caption leading-6 text-text-secondary">{report.summary}</div>
            {/* What the score was measured against — stored on every report,
                shown nowhere until now. */}
            <div className="flex flex-wrap items-center gap-2 pb-2">
              <span className="text-overline font-medium uppercase tracking-wide text-text-secondary">
                Assessed on
              </span>
              {report.meta.pillarChips.map((chip) => (
                <Badge key={chip}>{chip}</Badge>
              ))}
            </div>

            <div className="flex w-full flex-col">
              {report.drivers.map((d) => (
                <DriverRow
                  key={d.id}
                  driver={d}
                  expanded={!!driverExpanded[d.id]}
                  onToggle={() =>
                    setDriverExpanded((prev) => ({ ...prev, [d.id]: !prev[d.id] }))
                  }
                />
              ))}
            </div>
          </div>
        </section>
        {/* Sticky summary appears once this sentinel scrolls out of view. */}
        <div ref={stickySentinelRef} className="h-px w-full" />

        <section className="mt-10">
          <Card className="gap-0 overflow-hidden py-0">
            <CardContent className="relative isolate overflow-hidden p-6">
              <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/brand/report-ai-coach/logo-artifact.png"
                  alt=""
                  className="absolute bottom-0 right-0 h-[min(72%,168px)] w-auto max-w-[40%] origin-bottom-right scale-[1.2] object-contain object-bottom-right opacity-90 mix-blend-screen"
                />
              </div>
              <div className="relative z-[1]">
                <SectionTitle
                  title={
                    <>
                      What{" "}
                      <span className="rounded-sm bg-extended-light-cyan px-1 text-link">AI Coach</span>{" "}
                      saw in your session
                    </>
                  }
                  subtitle={report.narrative.subtitle}
                />
                <div className="mt-4 max-w-4xl text-caption leading-6 text-text-secondary">
                  {report.narrative.paragraph}
                </div>
                {/* Strongest and weakest, driver and answer, each with its score
                    and a link to the evidence. Derived from the scores, so the
                    claims can never disagree with the numbers two sections down. */}
                {/* `bg-card` on purpose: the card's decorative artwork is anchored
                    bottom-right and would otherwise sit behind the right column's
                    scores. The block's top rule is a clean line to cut it on. */}
                <div className="-mx-6 -mb-6 mt-6 grid border-t border-border bg-card lg:grid-cols-2 lg:divide-x lg:divide-border">
                  <div className="px-6 py-5">
                    <div className="flex items-center gap-2 text-caption font-semibold text-scoring-green-fg">
                      <TrendingUp className="size-4" aria-hidden />
                      What carried your score
                    </div>
                    <ul className="mt-3 flex flex-col gap-3">
                      {strongestDriver ? (
                        <li className="flex items-center justify-between gap-3">
                          <span className="flex min-w-0 items-center gap-2 text-caption text-text-primary">
                            <SuccessDriverIcon
                              driver={strongestDriver.id as SuccessDriverId}
                              className="size-4 shrink-0 text-text-primary"
                            />
                            <span className="truncate">
                              <span className="font-semibold">{strongestDriver.fullTitle}</span>
                              <span className="text-text-secondary"> — your strongest driver</span>
                            </span>
                          </span>
                          <ScoreChip score={strongestDriver.score} />
                        </li>
                      ) : null}
                      {strongestQuestion ? (
                        <li className="flex items-center justify-between gap-3">
                          <span className="min-w-0 truncate text-caption text-text-primary">
                            <span className="font-semibold">Q{strongestQuestion.index}</span>
                            <span className="text-text-secondary">
                              {" "}· {strongestQuestion.facet} — best answer
                            </span>
                          </span>
                          <span className="flex shrink-0 items-center gap-2">
                            <ScoreChip score={strongestQuestion.score} />
                            <button
                              type="button"
                              onClick={() => revealQuestion(strongestQuestion.id)}
                              className="app-link text-overline font-medium"
                            >
                              See answer
                            </button>
                          </span>
                        </li>
                      ) : null}
                    </ul>
                  </div>
                  <div className="border-t border-border px-6 py-5 lg:border-t-0">
                    <div className="flex items-center gap-2 text-caption font-semibold text-scoring-red-fg">
                      <TrendingDown className="size-4" aria-hidden />
                      What held it back
                    </div>
                    <ul className="mt-3 flex flex-col gap-3">
                      {weakestDriver ? (
                        <li className="flex items-center justify-between gap-3">
                          <span className="flex min-w-0 items-center gap-2 text-caption text-text-primary">
                            <SuccessDriverIcon
                              driver={weakestDriver.id as SuccessDriverId}
                              className="size-4 shrink-0 text-text-primary"
                            />
                            <span className="truncate">
                              <span className="font-semibold">{weakestDriver.fullTitle}</span>
                              <span className="text-text-secondary"> — your weakest driver</span>
                            </span>
                          </span>
                          <ScoreChip score={weakestDriver.score} />
                        </li>
                      ) : null}
                      {spotlightQuestion ? (
                        <li className="flex items-center justify-between gap-3">
                          <span className="min-w-0 truncate text-caption text-text-primary">
                            <span className="font-semibold">Q{spotlightQuestion.index}</span>
                            <span className="text-text-secondary">
                              {" "}· {spotlightQuestion.facet} — weakest answer
                            </span>
                          </span>
                          <span className="flex shrink-0 items-center gap-2">
                            <ScoreChip score={spotlightQuestion.score} />
                            <a href="#rewrite" className="app-link text-overline font-medium">
                              See the rewrite
                            </a>
                          </span>
                        </li>
                      ) : null}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-10">
          <SectionTitle
            title="Your answers, question by question"
            subtitle="Expand each row for competency analysis and improvements."
            right={
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setOpenQuestions(
                    Object.fromEntries(report.questions.map((q) => [q.id, !allQuestionsOpen])),
                  )
                }
              >
                {allQuestionsOpen ? "Collapse all" : "Expand all"}
              </Button>
            }
          />
          <div className="mt-4 grid gap-4">
            {report.questions.map((q) => (
              <QuestionRow
                key={q.id}
                q={q}
                open={!!openQuestions[q.id]}
                onToggle={() => setOpenQuestions((prev) => ({ ...prev, [q.id]: !prev[q.id] }))}
                isSpotlight={q.id === spotlightQuestion?.id}
              />
            ))}
          </div>
        </section>

        <section id="recording" className="mt-10 scroll-mt-28">
          <Card className="gap-0 py-0">
            <CardContent className="p-6">
              <SectionTitle
                title="Recording & transcript"
                subtitle="Replay your session and review the full conversation."
              />

              <TranscriptReplay
                className="mt-6"
                transcript={report.transcript}
                durationSeconds={report.meta.durationSeconds}
                hasAudio={report.meta.hasAudio}
                hasVideo={report.meta.hasVideo}
              />
            </CardContent>
          </Card>
        </section>

        <section id="rewrite" className="mt-10 scroll-mt-28">
          <Card className="gap-0 py-0">
            <CardContent className="p-6">
              <SectionTitle
                title="How to improve your weakest answer"
                subtitle="Delivery, language, and a sharper version of your highest-priority gap answer."
              />

              {/* Plain surface on purpose: the coach rewrite inside carries the
                  brand tint, and it can only read as "the one highlighted thing"
                  if the box around it is not tinted too. */}
              <div className="mt-6 rounded-lg border border-border bg-card p-5">
                <div className="flex items-start gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Podium className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-body-sm font-semibold text-extended-cyan-green">
                      {report.spotlight.title}
                    </h3>
                    <p className="mt-1 text-caption leading-relaxed text-text-secondary">
                      Your lowest-scoring answer, rewritten the way it should sound.
                    </p>
                  </div>
                </div>

                {spotlightQuestion ? (
                  <div className="mt-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <SuccessDriverCompetencyPill
                        variant="filled"
                        driver={spotlightQuestion.driver as SuccessDriverId}
                        label={
                          <>
                            {SUCCESS_DRIVERS[spotlightQuestion.driver as SuccessDriverId].shortLabel}
                            {" · "}
                            {spotlightQuestion.facet}
                          </>
                        }
                      />
                      <Badge
                        variant="outline"
                        className={badgeClasses(spotlightQuestion.status)}
                      >
                        {spotlightQuestion.status}
                      </Badge>
                      <ScoreLockup score={spotlightQuestion.score} />
                    </div>
                    <div className="mt-3 text-overline font-medium uppercase tracking-wide text-text-secondary">
                      Interview question
                    </div>
                    <p className="mt-1 text-body-sm font-semibold text-text-primary">
                      Q{spotlightQuestion.index}. “{spotlightQuestion.text}”
                    </p>
                  </div>
                ) : null}

                {/* The comparison: what was said beside how it should sound. One
                    bordered pair, the rewrite on a brand tint with a primary rule
                    so the eye lands on the stronger version; the byline says who
                    wrote it. */}
                <div className="mt-5 grid gap-px overflow-hidden rounded-lg border border-border bg-border lg:grid-cols-2">
                  <div className="min-w-0 bg-card p-5">
                    <div className="text-overline font-medium uppercase tracking-wide text-text-secondary">
                      Your answer
                    </div>
                    <div className="mt-0.5 text-caption text-text-secondary/80">What you said</div>
                    <blockquote className="mt-3 border-l-2 border-border pl-4 text-caption leading-relaxed text-text-primary">
                      {report.spotlight.yourAnswer}
                    </blockquote>
                  </div>
                  <div className="min-w-0 bg-brand-1000 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-overline font-medium uppercase tracking-wide text-text-secondary">
                          Coach rewrite
                        </div>
                        <div className="mt-0.5 text-caption text-text-secondary/80">How it should sound</div>
                      </div>
                      <Badge>AI Coach</Badge>
                    </div>
                    <blockquote className="mt-3 whitespace-pre-line border-l-2 border-primary pl-4 text-caption leading-relaxed text-text-primary">
                      {report.spotlight.coachRewrite}
                    </blockquote>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="text-overline font-medium uppercase tracking-wide text-text-secondary">
                    Why this version is stronger
                  </div>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-3">
                    {report.spotlight.whyStronger.map((s, i) => (
                      <li key={s} className="flex gap-3 rounded-lg border border-border bg-card p-3">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                        <span className="text-caption leading-relaxed text-text-primary">
                          {carKeyed ? (
                            <span className="font-semibold text-extended-blue">{CAR_STEPS[i]}: </span>
                          ) : null}
                          {s}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 text-overline font-medium uppercase tracking-wide text-text-secondary">
                Delivery &amp; language
              </div>
              <div className="mt-3 grid gap-4 lg:grid-cols-2">
                {(
                  [
                    {
                      title: "Body language",
                      icon: PersonStanding,
                      items: report.spotlight.delivery.bodyLanguage,
                    },
                    {
                      title: "Grammar & phrasing",
                      icon: SpellCheck,
                      items: report.spotlight.delivery.grammarPhrasing,
                    },
                    {
                      title: "Gestures & interview presence",
                      icon: Hand,
                      items: report.spotlight.delivery.gesturesPresence,
                    },
                  ] as const
                ).map(({ title, icon: Icon, items }) => (
                  <div
                    key={title}
                    className="flex gap-3 rounded-lg border border-border bg-card p-4"
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-extended-light-cyan text-extended-cyan-green">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <div className="text-body-sm font-semibold text-extended-cyan-green">{title}</div>
                      <ul className="mt-2 space-y-2 text-caption leading-relaxed text-text-secondary">
                        {items.map((s) => (
                          <li key={s}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}

                <div className="flex gap-3 rounded-lg border border-border bg-card p-4">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-extended-light-cyan text-extended-cyan-green">
                    <AudioLines className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <div className="text-body-sm font-semibold text-extended-cyan-green">
                      Filler words & pacing
                    </div>
                    <p className="mt-2 text-caption leading-relaxed text-text-secondary">
                      {report.spotlight.delivery.fillerPacing.summary}
                    </p>
                    <div className="mt-3 text-overline text-extended-cyan-green">On-camera presence</div>
                    <p className="mt-1 text-caption leading-relaxed text-text-secondary">
                      {report.spotlight.delivery.fillerPacing.onCameraPresence}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-10">
          <Card className="gap-0 py-0">
            <CardContent className="p-6">
              <SectionTitle
                title="What to work on next"
                subtitle="Based on your session — AI Coach's picks for your next training."
              />

              <div className="mt-6 flex w-full flex-col">
                {[
                  {
                    id: report.trainings.featured.id,
                    title: report.trainings.featured.title,
                    description: report.trainings.featured.description,
                    href: report.trainings.featured.href,
                    pillar: report.trainings.featured.pillar,
                    difficulty: report.trainings.featured.difficulty,
                    durationMinutes: report.trainings.featured.durationMinutes,
                  },
                  ...report.trainings.more.map((t) => ({
                    id: t.id,
                    title: t.title,
                    description: t.description,
                    href: t.href,
                    pillar: t.pillar,
                    difficulty: t.difficulty,
                    durationMinutes: t.durationMinutes,
                  })),
                ].map((item, index, list) => {
                  const isLast = index === list.length - 1;
                  const pillarKey = item.pillar?.trim().toLowerCase() ?? "";
                  const driverId =
                    SUCCESS_DRIVER_ORDER.find(
                      (id) => SUCCESS_DRIVERS[id].shortLabel.toLowerCase() === pillarKey,
                    ) ?? null;
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "flex w-full items-center justify-between gap-4 py-4",
                        index === 0 && "pt-0",
                        isLast ? "pb-0" : "border-b border-extended-green",
                      )}
                    >
                      <div className="flex min-w-0 flex-1 items-start gap-4">
                        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-[18px] font-medium leading-[27px] tracking-[-1.3px] text-text-primary">
                              {item.title}
                            </h3>
                            {index === 0 ? (
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1",
                                  "bg-[linear-gradient(135deg,var(--brand-100)_0%,var(--brand-300)_100%)]",
                                  "text-overline leading-[18px] font-medium text-primary-foreground",
                                )}
                              >
                                <LogoMark className="size-3.5" />
                                Featured
                              </span>
                            ) : null}
                            {driverId ? (
                              <SuccessDriverCompetencyPill
                                variant="filled"
                                driver={driverId}
                                label={SUCCESS_DRIVERS[driverId].shortLabel}
                              />
                            ) : item.pillar ? (
                              <span className="inline-flex h-6 items-center rounded-full border border-pill-border bg-pill-surface px-2 py-0">
                                <span className="text-[11px] leading-4 font-medium tracking-[0.5px] text-pill-foreground">
                                  {item.pillar}
                                </span>
                              </span>
                            ) : null}
                            {item.durationMinutes != null ? (
                              <MetaChip
                                icon={
                                  <Clock3
                                    className="size-3.5 shrink-0 text-pill-foreground"
                                    aria-hidden
                                  />
                                }
                              >
                                {item.durationMinutes} min
                              </MetaChip>
                            ) : null}
                            {item.difficulty ? (
                              <MetaChip
                                icon={
                                  <BookOpen className="size-3.5 shrink-0 text-pill-foreground" aria-hidden />
                                }
                              >
                                {item.difficulty}
                              </MetaChip>
                            ) : null}
                          </div>
                          <p className="text-[16px] font-normal leading-6 text-text-secondary">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <Button
                        asChild
                        variant="ghost"
                        className="h-auto shrink-0 gap-2 rounded-md py-2 pl-4 pr-2! text-[14px] font-medium leading-5 text-extended-dark-cyan hover:bg-transparent hover:text-extended-dark-cyan"
                      >
                        <Link href={item.href}>
                          {index === 0 ? "Start training module" : "Start training"}
                          <ArrowUpRight className="size-4" />
                        </Link>
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8 print:hidden">
          <div>
            <div className="text-body-sm font-semibold text-text-primary">Ready to go again?</div>
            <p className="mt-1 text-caption text-text-secondary">
              Another session for {report.meta.roleTitle} is scored the same way, so you can see the
              difference.
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
        </section>
      </div>

      <CoachBottomChatBar placeholder="Ask AI Coach about this report" />
      <GenericUpgradeModal open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen} />
    </AppShell>
  );
}

