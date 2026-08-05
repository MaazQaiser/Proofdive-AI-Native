"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";

import { AppShell } from "@/components/AppShell";
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
  SuccessDriverMark,
} from "@/components/ui/success-driver-card";
import {
  AudioLines,
  Calendar,
  Captions,
  ChartNoAxesColumn,
  Check,
  ChevronDown,
  ChevronLeft,
  Clock3,
  Download,
  Gauge,
  Hand,
  Lightbulb,
  ListChecks,
  ListTree,
  MessageSquareQuote,
  Mic,
  PersonStanding,
  PictureInPicture2,
  Play,
  RotateCcw,
  SkipBack,
  Sparkles,
  SpellCheck,
  UserRound,
  Video,
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

function badgeClasses(label: ReadinessLabel) {
  return scoringBadgeClass(label);
}

function scoreTextClasses(score: number) {
  return scoringTextClass(score);
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Unknown date";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

function fmtDuration(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const mm = Math.floor(s / 60);
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}m ${ss}s`;
}

const FALLBACK_IMPROVEMENT_ICONS: LucideIcon[] = [
  Lightbulb,
  Sparkles,
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

function PanelLabel({ icon: Icon, children }: { icon: LucideIcon; children: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
        <Icon className="size-4" aria-hidden />
      </span>
      <span className="text-overline text-extended-cyan-green">{children}</span>
    </div>
  );
}

function useStickySummary(sentinelRef: React.RefObject<HTMLElement | null>) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        setShow(!entry.isIntersecting);
      },
      // Only show once the content above has scrolled away.
      // Slight negative top margin helps account for sticky headers (h-14 shell).
      { threshold: 0.01, rootMargin: "-56px 0px 0px 0px" },
    );

    io.observe(sentinel);
    return () => io.disconnect();
  }, [sentinelRef]);

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
    <span className="inline-flex items-center gap-2 rounded-full border border-[#b3effa] bg-white py-1.5 pl-1.5 pr-3">
      {icon}
      <span className="text-overline leading-[18px] text-text-primary">{children}</span>
    </span>
  );
}

function driverIdFromPillarLabel(pillar: string): SuccessDriverId | null {
  const n = pillar.trim().toLowerCase();
  for (const id of SUCCESS_DRIVER_ORDER) {
    const meta = SUCCESS_DRIVERS[id];
    if (id === n || meta.shortLabel.toLowerCase() === n || meta.label.toLowerCase() === n) {
      return id;
    }
  }
  return null;
}

function TrainingMetaRow({
  pillar,
  difficulty,
  durationMinutes,
}: {
  pillar: string;
  difficulty?: string;
  durationMinutes: number;
}) {
  const driverId = driverIdFromPillarLabel(pillar);
  return (
    <div className="flex flex-wrap items-center gap-2">
      {driverId ? (
        <SuccessDriverCompetencyPill
          driver={driverId}
          label={SUCCESS_DRIVERS[driverId].shortLabel}
        />
      ) : (
        <MetaChip icon={<Sparkles className="size-4 shrink-0 text-text-secondary" aria-hidden />}>
          {pillar}
        </MetaChip>
      )}
      {difficulty ? (
        <MetaChip icon={<Gauge className="size-4 shrink-0 text-text-secondary" aria-hidden />}>
          {difficulty}
        </MetaChip>
      ) : null}
      <MetaChip icon={<Clock3 className="size-4 shrink-0 text-text-secondary" aria-hidden />}>
        {durationMinutes} min
      </MetaChip>
    </div>
  );
}

function HighlightChip({ prefix, text }: { prefix: string; text: string }) {
  const match = text.match(/^(.*?)\s*(\d+(?:\.\d+)?)\/5\s*$/);
  const rest = match ? match[1].replace(/\s*·\s*$/, "").trim() : text.trim();
  const score = match ? Number.parseFloat(match[2]!) : null;
  return (
    <span className="inline-flex items-center rounded-full border border-[#b3effa] bg-white py-1.5 px-3">
      <span className="text-overline leading-[18px] text-text-primary">
        {prefix}
        {rest ? ` ${rest}` : ""}
        {score != null ? (
          <>
            {" · "}
            <span className={scoreTextClasses(score)}>{score.toFixed(1)}</span>
            <span className="text-[#abadb2]">/5</span>
          </>
        ) : null}
      </span>
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
      <span className="cap-baseline text-[24px] font-medium leading-none tracking-[-1.2px] text-[#abadb2]">
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
    <div className="border-t border-extended-green py-[18px]">
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
          See the breakdown
          <ChevronDown
            className={cn("size-4 transition-transform", expanded ? "rotate-180" : "rotate-0")}
            aria-hidden
          />
        </button>
        {expanded ? (
          <div className="mt-4 space-y-2">
            {driver.subSkills.map((s) => (
              <div key={s.name} className="flex items-center justify-between gap-3">
                <div className="min-w-0 truncate text-caption text-text-primary">{s.name}</div>
                <div className="flex shrink-0 items-baseline gap-0.5 font-gilroy whitespace-nowrap">
                  <span className={cn("text-caption font-semibold", scoreTextClasses(s.score))}>
                    {s.score.toFixed(1)}
                  </span>
                  <span className="text-caption font-semibold text-[#abadb2]">/5</span>
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
}: {
  q: InterviewReportQuestion;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <Card className="gap-0 py-0 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left"
        aria-expanded={open}
        aria-controls={`q-panel-${q.id}`}
      >
        <CardContent className="flex items-center gap-3 p-5">
          <div className="flex min-w-0 flex-1 flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <SuccessDriverCompetencyPill
                  driver={q.driver as SuccessDriverId}
                  label={
                    <>
                      {SUCCESS_DRIVERS[q.driver as SuccessDriverId].shortLabel}
                      {" · "}
                      {q.facet}
                    </>
                  }
                />
                <span className="inline-flex items-center gap-2 rounded-full border border-[#b3effa] bg-white py-1.5 pl-1.5 pr-3">
                  <Clock3 className="size-4 shrink-0 text-text-secondary" aria-hidden />
                  <span className="text-overline leading-[18px] text-text-primary">
                    {fmtDuration(q.timeSeconds)}
                    {q.idealRangeSeconds ? (
                      <span className="text-text-secondary">
                        {" "}
                        · ideal {Math.floor(q.idealRangeSeconds[0] / 60)}–{Math.floor(q.idealRangeSeconds[1] / 60)}m
                      </span>
                    ) : null}
                  </span>
                </span>
              </div>

              <div className="mt-3 text-body-sm font-semibold text-text-primary">
                Q{q.index}. “{q.text}”
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2.5">
              <div
                className={cn(
                  "inline-flex items-center rounded-full border px-2.5 py-1 text-overline",
                  badgeClasses(q.status),
                )}
              >
                {q.status}
              </div>
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
                <blockquote className="mt-3 rounded-lg border border-[#dde7e9] bg-white p-4 text-caption leading-relaxed text-text-primary">
                  {q.answer}
                </blockquote>
              </div>
              <div className="min-w-0">
                <PanelLabel icon={Sparkles}>Areas for improvement</PanelLabel>
                <div className="mt-3 grid gap-3">
                  {q.improvements.map((imp, index) => {
                    const Icon = improvementIconFor(imp.title, index);
                    return (
                      <div
                        key={imp.title}
                        className="flex gap-3 rounded-lg border border-[#dde7e9] bg-white p-4"
                      >
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-extended-light-cyan text-extended-cyan-green">
                          <Icon className="size-4" aria-hidden />
                        </span>
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
          </CardContent>
        </div>
      ) : null}
    </Card>
  );
}

export function ReportDetailScreen({ reportId }: Props) {
  const stickySentinelRef = useRef<HTMLDivElement | null>(null);
  const showSticky = useStickySummary(stickySentinelRef);

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
  const [competencyAreasOpen, setCompetencyAreasOpen] = useState(false);
  const printRestoreRef = useRef<{
    drivers: Record<string, boolean>;
    questions: Record<string, boolean>;
    competencyAreasOpen: boolean;
    title: string;
  } | null>(null);

  const missing = report === null;
  const overall = report?.overallScore ?? 0;

  const spotlightQuestion = useMemo(() => {
    if (!report) return null;
    return report.questions.find((q) => q.id === report.spotlight.questionId) ?? report.questions[0] ?? null;
  }, [report]);

  if (report === undefined) {
    return (
      <AppShell>
        <CoachFloatingNav />
        <div className="pb-44">
          <Card className="gap-0 py-0">
            <CardContent>
              <div className="text-h5 text-text-primary">Loading report…</div>
            </CardContent>
          </Card>
        </div>
        <CoachBottomChatBar placeholder="Ask about this report (e.g. “How do I improve Q4?”)" />
        <GenericUpgradeModal open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen} />
      </AppShell>
    );
  }

  if (missing) {
    return (
      <AppShell>
        <CoachFloatingNav />
        <div className="pb-44">
          <Card className="gap-0 py-0">
            <CardContent>
              <div className="text-h4 text-text-primary">Report not found</div>
              <div className="mt-3 max-w-2xl text-caption leading-6 text-text-secondary">
                This report id doesn’t exist on this device yet. If you just finished an interview,
                try ending the session again to generate a report.
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
        <CoachBottomChatBar placeholder="Ask about this report (e.g. “How do I improve Q4?”)" />
        <GenericUpgradeModal open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen} />
      </AppShell>
    );
  }

  if (!reportAllowed) {
    return (
      <AppShell>
        <CoachFloatingNav />
        <div className="pb-44">
          <Card className="gap-0 py-0">
            <CardContent className="space-y-4 p-6">
              <div className="text-h4 text-text-primary">Report locked</div>
              <p className="max-w-2xl text-caption leading-6 text-text-secondary">
                Your Free plan includes one interview report. Upgrade to view or download additional
                reports.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={() => setUpgradeModalOpen(true)}>
                  Upgrade Plan
                </Button>
                <Button asChild variant="outline">
                  <Link href="/interview">Back to sessions</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <CoachBottomChatBar placeholder="Ask about this report (e.g. “How do I improve Q4?”)" />
        <GenericUpgradeModal open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen} />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <CoachFloatingNav />

      {showSticky ? (
        <div className="sticky top-14 z-10 -mx-6 border-b border-border bg-background/85 px-6 py-3 backdrop-blur print:hidden">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <div className="flex items-baseline gap-2">
              <div className={cn("text-caption font-semibold", scoreTextClasses(overall))}>
                {overall.toFixed(1)} / 5.0
              </div>
              <div
                className={cn(
                  "inline-flex items-center rounded-full border px-2.5 py-1 text-overline",
                  scoringBadgeClass(overall),
                )}
              >
                {scoringLabelForScore(overall)}
              </div>
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
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
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
            href={`/coach?final=1&report=${encodeURIComponent(reportId)}`}
            className="inline-flex items-center gap-1.5 text-caption font-semibold text-text-primary/65 transition hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/15 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <ChevronLeft className="size-4 shrink-0" aria-hidden />
            Go to home page
          </Link>
          <div className="flex shrink-0 flex-wrap justify-start gap-2 sm:justify-end">
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
                  competencyAreasOpen,
                  title: document.title,
                };
                flushSync(() => {
                  setDriverExpanded(
                    Object.fromEntries(report.drivers.map((d) => [d.id, true])),
                  );
                  setOpenQuestions(
                    Object.fromEntries(report.questions.map((q) => [q.id, true])),
                  );
                  setCompetencyAreasOpen(true);
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
                  setCompetencyAreasOpen(prev.competencyAreasOpen);
                };
                window.addEventListener("afterprint", restore);
                window.setTimeout(() => window.print(), 50);
              }}
            >
              <Download />
              Download report
            </Button>
            <Button asChild size="default">
              <Link href="/interview">
                <RotateCcw />
                Retake interview
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-4 min-w-0">
          <h1 className="text-agent-heading text-heading-teal">
            {report.meta.heroVariant === "first_start"
              ? "You're off to a strong start. Let's prepare more!"
              : "Good news! You're improving your interview readiness score."}
          </h1>
          <div className="mt-3 text-agent-question text-text-primary">
            Here&apos;s a detailed breakdown report and analytics of your mock interview for{" "}
            <span className="rounded-sm bg-[#B9EFF4] px-1 text-[#095B73]">{report.meta.roleTitle}</span>
            .
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <MetaChip icon={<Video className="size-5 shrink-0 text-text-secondary" aria-hidden />}>
              {report.meta.interviewName}
            </MetaChip>
            <MetaChip icon={<Calendar className="size-5 shrink-0 text-text-secondary" aria-hidden />}>
              {fmtDate(report.meta.createdAt)}
            </MetaChip>
            <MetaChip icon={<Clock3 className="size-5 shrink-0 text-text-secondary" aria-hidden />}>
              {fmtDuration(report.meta.durationSeconds)}
            </MetaChip>
            <MetaChip icon={<ListChecks className="size-5 shrink-0 text-text-secondary" aria-hidden />}>
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
              "bg-[linear-gradient(114.96deg,rgba(255,255,255,0.8)_0%,rgba(255,255,255,0.5)_98.96%)]",
            )}
          >
            <div className="flex w-full items-center justify-between gap-4 py-4">
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
                  <span className="cap-baseline text-[48px] font-normal leading-none tracking-[-2.4px] text-[#abadb2]">
                    /5
                  </span>
                </div>
                <span className="cap-baseline text-[16px] font-medium tracking-[-0.5px] text-text-primary">
                  Overall performance
                </span>
              </div>
              <div className="flex shrink-0 flex-wrap items-center justify-end gap-x-2.5">
                <span className="text-[16px] font-medium tracking-[-0.5px] text-text-primary">
                  You are currently
                </span>
                <span
                  className={cn(
                    "inline-flex items-center justify-center overflow-hidden rounded-full border border-solid px-[9px] py-[3px] text-[12px] font-medium leading-[1.2]",
                    scoringBadgeClass(overall),
                  )}
                >
                  {scoringLabelForScore(overall)}
                </span>
              </div>
            </div>

            <div className="text-body-sm font-semibold text-text-primary">{report.headline}</div>
            <div className="w-full text-caption leading-6 text-text-secondary">{report.summary}</div>

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

        <section className="mt-8">
          <Card className="gap-0 py-0">
            <CardContent className="p-6">
              <details
                className="open:[&_summary_svg]:rotate-180"
                open={competencyAreasOpen}
                onToggle={(event) => setCompetencyAreasOpen(event.currentTarget.open)}
              >
                <summary className="cursor-pointer list-none">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-body-sm font-semibold text-text-primary">
                      View all competency areas
                    </div>
                    <ChevronDown className="size-5 shrink-0 text-text-primary/60 transition-transform duration-200" aria-hidden />
                  </div>
                </summary>

                <div className="mt-4 text-caption leading-6 text-text-secondary">
                  Each pillar has an overall score. The driver cards above show the top-level rating, and the breakdown
                  shows per–sub-skill detail.
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  {report.drivers.map((d) => (
                    <Card key={d.id} className="gap-0 py-0">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <SuccessDriverMark
                              driver={d.id as SuccessDriverId}
                              className="text-caption"
                              iconClassName="size-4"
                            />
                          </div>
                          <ScoreLockup score={d.score} />
                        </div>
                        <div className="mt-4 space-y-2">
                          {d.subSkills.map((s) => (
                            <div key={s.name} className="flex items-center justify-between gap-3">
                              <div className="min-w-0 truncate text-caption text-text-primary">{s.name}</div>
                              <div className="flex shrink-0 items-baseline gap-0.5 font-gilroy whitespace-nowrap">
                                <span className={cn("text-caption font-semibold", scoreTextClasses(s.score))}>
                                  {s.score.toFixed(1)}
                                </span>
                                <span className="text-caption font-semibold text-[#abadb2]">/5</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </details>
            </CardContent>
          </Card>
        </section>

        <section className="mt-10">
          <Card className="gap-0 py-0">
            <CardContent className="p-6">
              <SectionTitle
                title={
                  <>
                    What{" "}
                    <span className="rounded-sm bg-[#B9EFF4] px-1 text-[#095B73]">AI Coach</span>{" "}
                    saw in your session
                  </>
                }
                subtitle={report.narrative.subtitle}
              />
              <div className="mt-4 max-w-4xl text-caption leading-6 text-text-secondary">
                {report.narrative.paragraph}
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <HighlightChip prefix="Strongest:" text={report.highlightChips.strongest} />
                <HighlightChip prefix="Biggest gap:" text={report.highlightChips.biggestGap} />
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-10">
          <SectionTitle title="Your answers, question by question" subtitle="Expand any row to see your answer and coaching opportunities." />
          <div className="mt-4 grid gap-4">
            {report.questions.map((q) => (
              <QuestionRow
                key={q.id}
                q={q}
                open={!!openQuestions[q.id]}
                onToggle={() => setOpenQuestions((prev) => ({ ...prev, [q.id]: !prev[q.id] }))}
              />
            ))}
          </div>
        </section>

        <section id="recording" className="mt-10 scroll-mt-28">
          <Card className="gap-0 py-0">
            <CardContent className="p-6">
              <SectionTitle
                title="Recording and transcript"
                subtitle="Replay your session and scan the transcript for coaching flags."
              />

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <div className="min-w-0">
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-[#dde7e9] bg-[#edf5f7]">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button
                        type="button"
                        onClick={() => window.alert("Player is a v1 stub.")}
                      >
                        <Play className="size-4" aria-hidden />
                        Play
                      </Button>
                    </div>
                    <span className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full border border-[#b3effa] bg-white py-1.5 pl-1.5 pr-3">
                      <Clock3 className="size-4 shrink-0 text-text-secondary" aria-hidden />
                      <span className="text-overline leading-[18px] text-text-primary">
                        {fmtDuration(report.meta.durationSeconds)}
                      </span>
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <MetaChip icon={<SkipBack className="size-5 shrink-0 text-text-secondary" aria-hidden />}>
                      ±10s
                    </MetaChip>
                    <MetaChip icon={<Gauge className="size-5 shrink-0 text-text-secondary" aria-hidden />}>
                      1×
                    </MetaChip>
                    <MetaChip icon={<PictureInPicture2 className="size-5 shrink-0 text-text-secondary" aria-hidden />}>
                      PiP
                    </MetaChip>
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="rounded-lg border border-[#dde7e9] bg-white p-4">
                    <PanelLabel icon={Captions}>Transcript</PanelLabel>
                    <div className="mt-3 max-h-[320px] space-y-2 overflow-auto pr-1">
                      {report.transcript.map((line, idx) => {
                        const isCandidate = line.speaker === "Candidate";
                        return (
                          <div
                            key={idx}
                            className="rounded-lg border border-[#dde7e9] bg-white p-3"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "grid size-7 shrink-0 place-items-center rounded-full",
                                  isCandidate
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-extended-light-cyan text-extended-cyan-green",
                                )}
                                aria-hidden
                              >
                                {isCandidate ? (
                                  <UserRound className="size-3.5" />
                                ) : (
                                  <Mic className="size-3.5" />
                                )}
                              </span>
                              <span className="text-overline font-medium text-extended-cyan-green">
                                {line.speaker}
                              </span>
                              <span className="ml-auto text-overline text-text-secondary">
                                {fmtDuration(line.timeSeconds)}
                              </span>
                            </div>
                            <p className="mt-2 text-caption leading-relaxed text-text-primary">
                              {line.text}
                            </p>
                            {line.flag ? (
                              <div className="mt-2 inline-flex items-center rounded-full border border-scoring-red/25 bg-scoring-red/15 px-2.5 py-1 text-overline text-scoring-red-fg">
                                {line.flag}
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
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
                title="Areas to improve"
                subtitle="A sharper rewrite + delivery notes for your highest-priority gap."
              />

              <div className="mt-6 rounded-lg border border-[#b3effa] bg-[#edf5f7] p-5">
                <div className="flex items-start gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Sparkles className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-body-sm font-semibold text-extended-cyan-green">
                      Highest-priority gap
                    </h3>
                    <p className="mt-1 text-caption leading-relaxed text-text-secondary">
                      The AI coach picked the weakest question to help you improve.
                    </p>
                  </div>
                </div>

                {spotlightQuestion ? (
                  <div className="mt-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <SuccessDriverCompetencyPill
                        driver={spotlightQuestion.driver as SuccessDriverId}
                        label={
                          <>
                            {SUCCESS_DRIVERS[spotlightQuestion.driver as SuccessDriverId].shortLabel}
                            {" · "}
                            {spotlightQuestion.facet}
                          </>
                        }
                      />
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2.5 py-1 text-overline",
                          badgeClasses(spotlightQuestion.status),
                          "bg-white",
                        )}
                      >
                        {spotlightQuestion.status}
                      </span>
                      <ScoreLockup score={spotlightQuestion.score} />
                    </div>
                    <p className="mt-3 text-body-sm font-semibold text-text-primary">
                      Q{spotlightQuestion.index}. “{spotlightQuestion.text}”
                    </p>
                  </div>
                ) : null}

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <div className="min-w-0">
                    <PanelLabel icon={MessageSquareQuote}>Your answer</PanelLabel>
                    <blockquote className="mt-3 rounded-lg border border-[#dde7e9] bg-white p-4 text-caption leading-relaxed text-text-primary">
                      {report.spotlight.yourAnswer}
                    </blockquote>
                  </div>
                  <div className="min-w-0">
                    <PanelLabel icon={Sparkles}>Coach rewrite</PanelLabel>
                    <blockquote className="mt-3 whitespace-pre-line rounded-lg border border-[#b3effa] bg-white p-4 text-caption leading-relaxed text-text-primary">
                      {report.spotlight.coachRewrite}
                    </blockquote>
                  </div>
                </div>

                <div className="mt-5">
                  <PanelLabel icon={Lightbulb}>Why this version is stronger</PanelLabel>
                  <ul className="mt-3 grid gap-2">
                    {report.spotlight.whyStronger.map((s) => (
                      <li key={s} className="flex gap-3 rounded-lg border border-[#dde7e9] bg-white p-3">
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-extended-light-cyan text-extended-cyan-green">
                          <Check className="size-4" aria-hidden />
                        </span>
                        <span className="self-center text-caption leading-relaxed text-text-primary">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
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
                    className="flex gap-3 rounded-lg border border-[#dde7e9] bg-white p-4"
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

                <div className="flex gap-3 rounded-lg border border-[#dde7e9] bg-white p-4">
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
              <SectionTitle title="What to work on next" subtitle="Suggested trainings based on your highest-leverage gaps." />

              <div className="mt-6 grid gap-4 lg:grid-cols-4">
                <Card className="gap-0 py-0 lg:col-span-2">
                  <CardContent className="p-5">
                    <MetaChip icon={<Sparkles className="size-4 shrink-0 text-text-secondary" aria-hidden />}>
                      Featured
                    </MetaChip>
                    <div className="mt-3 text-h6 text-text-primary">
                      {report.trainings.featured.title}
                    </div>
                    <div className="mt-2 text-caption leading-6 text-text-secondary">
                      {report.trainings.featured.description}
                    </div>
                    <div className="mt-4">
                      <TrainingMetaRow
                        pillar={report.trainings.featured.pillar}
                        difficulty={report.trainings.featured.difficulty}
                        durationMinutes={report.trainings.featured.durationMinutes}
                      />
                    </div>
                    <div className="mt-4">
                      <Link
                        href={report.trainings.featured.href}
                        className="text-caption font-semibold text-text-primary underline decoration-black/20 underline-offset-4 hover:decoration-black/40"
                      >
                        Start training
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {report.trainings.more.map((t) => (
                  <Card key={t.id} className="gap-0 py-0">
                    <CardContent className="p-5">
                      <TrainingMetaRow pillar={t.pillar} durationMinutes={t.durationMinutes} />
                      <div className="mt-3 text-body-sm font-semibold text-text-primary">{t.title}</div>
                      <div className="mt-2 text-caption leading-6 text-text-secondary">{t.description}</div>
                      <div className="mt-4">
                        <Link
                          href={t.href}
                          className="text-caption font-semibold text-text-primary underline decoration-black/20 underline-offset-4 hover:decoration-black/40"
                        >
                          Start training
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      <CoachBottomChatBar placeholder="Ask about this report (e.g. “How do I improve Q4?”)" />
      <GenericUpgradeModal open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen} />
    </AppShell>
  );
}

