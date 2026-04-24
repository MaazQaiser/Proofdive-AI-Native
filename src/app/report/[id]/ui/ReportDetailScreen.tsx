"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { CardBody, GlassCard, GlassCardSection } from "@/components/Card";
import { cn } from "@/components/cn";
import { CoachBottomChatBar } from "@/components/CoachBottomChatBar";
import { CoachFloatingNav } from "@/components/CoachFloatingNav";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import type {
  InterviewReport,
  InterviewReportDriver,
  InterviewReportQuestion,
  ReadinessLabel,
} from "@/lib/proofdiveTypes";

type Props = { reportId: string };

function safeParseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function scoreBand(score: number): "red" | "amber" | "green" {
  if (score >= 3.5) return "green";
  if (score >= 2.5) return "amber";
  return "red";
}

function badgeClasses(label: ReadinessLabel) {
  if (label === "Ready") return "bg-emerald-500/15 text-emerald-900 border-emerald-500/20";
  if (label === "Borderline") return "bg-amber-500/15 text-amber-900 border-amber-500/20";
  return "bg-rose-500/15 text-rose-900 border-rose-500/20";
}

function scoreTextClasses(score: number) {
  const b = scoreBand(score);
  if (b === "green") return "text-emerald-700";
  if (b === "amber") return "text-amber-700";
  return "text-rose-700";
}

function scoreBarClasses(score: number) {
  const b = scoreBand(score);
  if (b === "green") return "bg-emerald-500";
  if (b === "amber") return "bg-amber-500";
  return "bg-rose-500";
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

function driverAccentDot(driverId: InterviewReportDriver["id"]) {
  if (driverId === "thinking") return "bg-teal-500";
  if (driverId === "action") return "bg-amber-500";
  if (driverId === "people") return "bg-emerald-500";
  return "bg-violet-500";
}

function driverAccentSoft(driverId: InterviewReportDriver["id"]) {
  if (driverId === "thinking") return "bg-teal-500/10 border-teal-500/15";
  if (driverId === "action") return "bg-amber-500/10 border-amber-500/15";
  if (driverId === "people") return "bg-emerald-500/10 border-emerald-500/15";
  return "bg-violet-500/10 border-violet-500/15";
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
      // Slight negative top margin helps account for sticky headers.
      { threshold: 0.01, rootMargin: "-72px 0px 0px 0px" },
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
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <div className="text-2xl font-extrabold tracking-tight text-black">{title}</div>
        {subtitle ? <div className="mt-1 text-sm text-[var(--app-muted)]">{subtitle}</div> : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

function Icon({ name }: { name: InterviewReportDriver["icon"] }) {
  const cls = "h-5 w-5";
  if (name === "brain") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cls}>
        <path
          d="M8.5 6.5a3.5 3.5 0 0 1 6.9-1A3.5 3.5 0 0 1 18 8.7a3.4 3.4 0 0 1 1 2.4 3.5 3.5 0 0 1-2 3.2 3.5 3.5 0 0 1-3 5.2H10a3.5 3.5 0 0 1-3-5.2A3.5 3.5 0 0 1 5 11.1c0-.9.34-1.7.9-2.4A3.5 3.5 0 0 1 8.5 6.5Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (name === "bolt") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cls}>
        <path
          d="M13 2 3 14h7l-1 8 12-14h-7l-1-6Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (name === "users") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cls}>
        <path
          d="M17 21v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M9.5 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M22 21v-1a4 4 0 0 0-3-3.87"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M16 3.13a4 4 0 0 1 0 7.75"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cls}>
      <path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M12 7v6l4 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DriverCard({
  driver,
  expanded,
  onToggle,
}: {
  driver: InterviewReportDriver;
  expanded: boolean;
  onToggle: () => void;
}) {
  const score = driver.score;
  const pct = Math.max(0, Math.min(100, Math.round(driver.pct)));
  return (
    <GlassCard className="overflow-hidden">
      <CardBody className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center rounded-[14px] border text-black",
                  driverAccentSoft(driver.id),
                )}
              >
                <Icon name={driver.icon} />
              </span>
              <div className="min-w-0">
                <div className="truncate text-base font-extrabold tracking-tight text-black">
                  {driver.shortTitle}
                </div>
                <div className="truncate text-xs font-extrabold tracking-[0.18em] text-gray-500">
                  {driver.fullTitle}
                </div>
              </div>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <div className={cn("text-sm font-extrabold tracking-tight", scoreTextClasses(score))}>
              {score.toFixed(1)} / 5
            </div>
            <div
              className={cn(
                "mt-1 inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-extrabold",
                badgeClasses(driver.status),
              )}
            >
              {driver.status}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="h-2 w-full rounded-full bg-black/5">
            <div className={cn("h-2 rounded-full", scoreBarClasses(score))} style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-3">
            <button
              type="button"
              onClick={onToggle}
              className="inline-flex items-center gap-2 text-sm font-extrabold text-black underline decoration-black/20 underline-offset-4 hover:decoration-black/40"
              aria-expanded={expanded}
            >
              See the breakdown
              <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className={cn("h-4 w-4 transition-transform", expanded ? "rotate-180" : "rotate-0")}
              >
                <path
                  d="m6 9 6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {expanded ? (
            <div className="mt-4 space-y-2">
              {driver.subSkills.map((s) => (
                <div key={s.name} className="flex items-center justify-between gap-3">
                  <div className="min-w-0 truncate text-sm text-black">{s.name}</div>
                  <div className={cn("shrink-0 text-sm font-extrabold", scoreTextClasses(s.score))}>
                    {s.score.toFixed(1)}/5
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </CardBody>
    </GlassCard>
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
    <GlassCard className="overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left"
        aria-expanded={open}
        aria-controls={`q-panel-${q.id}`}
      >
        <CardBody className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs font-extrabold text-gray-800">
                  {q.facet}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs font-extrabold text-gray-800">
                  <span className={cn("h-2 w-2 rounded-full", driverAccentDot(q.driver))} />
                  {q.driver === "thinking"
                    ? "Thinking"
                    : q.driver === "action"
                      ? "Action"
                      : q.driver === "people"
                        ? "People"
                        : "Mastery"}
                </span>
                <span className="rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs font-extrabold text-gray-800">
                  {fmtDuration(q.timeSeconds)}
                  {q.idealRangeSeconds ? (
                    <span className="text-gray-500">
                      {" "}
                      · ideal {Math.floor(q.idealRangeSeconds[0] / 60)}–{Math.floor(q.idealRangeSeconds[1] / 60)}m
                    </span>
                  ) : null}
                </span>
              </div>

              <div className="mt-3 text-sm font-extrabold tracking-tight text-black">
                Q{q.index}. “{q.text}”
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <div className="text-right">
                <div className={cn("text-sm font-extrabold tracking-tight", scoreTextClasses(q.score))}>
                  {q.score.toFixed(1)}/5
                </div>
                <div
                  className={cn(
                    "mt-1 inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-extrabold",
                    badgeClasses(q.status),
                  )}
                >
                  {q.status}
                </div>
              </div>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className={cn("h-5 w-5 shrink-0 text-black/60 transition-transform", open ? "rotate-180" : "rotate-0")}
              >
                <path
                  d="m6 9 6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </CardBody>
      </button>

      {open ? (
        <div id={`q-panel-${q.id}`} className="border-t border-white/60">
          <CardBody className="p-5">
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="min-w-0">
                <div className="text-xs font-extrabold tracking-[0.22em] text-gray-500">YOUR ANSWER</div>
                <blockquote className="mt-2 rounded-[18px] border border-white/60 bg-white/50 p-4 text-sm leading-6 text-black">
                  {q.answer}
                </blockquote>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-extrabold tracking-[0.22em] text-gray-500">
                  AREAS FOR IMPROVEMENT
                </div>
                <div className="mt-3 grid gap-3">
                  {q.improvements.map((imp) => (
                    <div
                      key={imp.title}
                      className="rounded-[18px] border border-white/60 bg-white/50 p-4"
                    >
                      <div className="text-sm font-extrabold tracking-tight text-black">
                        {imp.title}
                      </div>
                      <div className="mt-1 text-sm leading-6 text-[var(--app-muted)]">
                        {imp.detail}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardBody>
        </div>
      ) : null}
    </GlassCard>
  );
}

export function ReportDetailScreen({ reportId }: Props) {
  const stickySentinelRef = useRef<HTMLDivElement | null>(null);
  const showSticky = useStickySummary(stickySentinelRef);

  /** `undefined` = not read yet (after mount we always read from localStorage). */
  const [report, setReport] = useState<InterviewReport | null | undefined>(undefined);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(StorageKeys.reports);
      const map = safeParseJson<Record<string, InterviewReport>>(raw) ?? {};
      setReport(map[reportId] ?? null);
    } catch {
      setReport(null);
    }
  }, [reportId]);

  const missing = report === null;

  const [driverExpanded, setDriverExpanded] = useState<Record<string, boolean>>({});
  const [openQuestions, setOpenQuestions] = useState<Record<string, boolean>>({});

  const overall = report?.overallScore ?? 0;
  const overallLabel = report?.overallStatus ?? "Borderline";

  const spotlightQuestion = useMemo(() => {
    if (!report) return null;
    return report.questions.find((q) => q.id === report.spotlight.questionId) ?? report.questions[0] ?? null;
  }, [report]);

  if (report === undefined) {
    return (
      <AppShell>
        <CoachFloatingNav />
        <div className="pb-44">
          <GlassCard>
            <CardBody>
              <div className="text-2xl font-extrabold tracking-tight text-black">Loading report…</div>
            </CardBody>
          </GlassCard>
        </div>
        <CoachBottomChatBar placeholder="Ask about this report (e.g. “How do I improve Q4?”)" />
      </AppShell>
    );
  }

  if (missing) {
    return (
      <AppShell>
        <CoachFloatingNav />
        <div className="pb-44">
          <GlassCard>
            <CardBody>
              <div className="text-3xl font-extrabold tracking-tight text-black">Report not found</div>
              <div className="mt-3 max-w-2xl text-sm leading-6 text-[var(--app-muted)]">
                This report id doesn’t exist on this device yet. If you just finished an interview,
                try ending the session again to generate a report.
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link href="/interview">
                  <Button>Back to sessions</Button>
                </Link>
                <Link href="/coach?journey=1">
                  <Button variant="secondary">Go to Coach</Button>
                </Link>
              </div>
            </CardBody>
          </GlassCard>
        </div>
        <CoachBottomChatBar placeholder="Ask about this report (e.g. “How do I improve Q4?”)" />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <CoachFloatingNav />

      {showSticky ? (
        <div className="sticky top-[72px] z-10 -mx-6 border-b border-white/50 bg-[var(--app-bg)]/85 px-6 py-3 backdrop-blur">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <div className="flex items-baseline gap-2">
              <div className={cn("text-sm font-extrabold", scoreTextClasses(overall))}>
                {overall.toFixed(1)} / 5.0
              </div>
              <div
                className={cn(
                  "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-extrabold",
                  badgeClasses(overallLabel),
                )}
              >
                {overallLabel}
              </div>
            </div>
            <div className="text-xs font-extrabold tracking-tight text-gray-600">
              {report.meta.questionCount} questions · {fmtDuration(report.meta.durationSeconds)}
              {report.meta.hasAudio ? " · Audio" : ""}
              {report.meta.hasVideo ? " · Video" : ""}
            </div>
          </div>
        </div>
      ) : null}

      <div className="pb-44">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="min-w-0 flex-1">
            <Link
              href={`/coach?final=1&report=${encodeURIComponent(reportId)}`}
              className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-black/65 transition hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/15 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--app-bg)]"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" aria-hidden>
                <path
                  d="M15 18l-6-6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Go to home page
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight text-black sm:text-4xl">
              {report.meta.heroVariant === "first_start"
                ? "You're off to a strong start. Let's prepare more!"
                : "Good news! You're improving your interview readiness score."}
            </h1>
            <div className="mt-2 max-w-3xl text-sm leading-6 text-[var(--app-muted)]">
              Here&apos;s a detailed breakdown report and analytics of your mock interview for{" "}
              <span className="font-extrabold text-black">{report.meta.roleTitle}</span>.
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs font-extrabold text-gray-800">
                {report.meta.interviewName}
              </span>
              <span className="rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs font-extrabold text-gray-800">
                {fmtDate(report.meta.createdAt)}
              </span>
              <span className="rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs font-extrabold text-gray-800">
                {fmtDuration(report.meta.durationSeconds)}
              </span>
              <span className="rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs font-extrabold text-gray-800">
                {report.meta.questionCount} questions
              </span>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap justify-start gap-2 sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                // stub: v1 non-functional
                window.alert("PDF download is stubbed in v1.");
              }}
            >
              Download PDF
            </Button>
            <Link href="/interview" className="inline-flex">
              <Button>Retake interview</Button>
            </Link>
          </div>
        </div>

        <section className="mt-8">
          <div className="grid gap-4">
            <GlassCardSection>
              <CardBody className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold tracking-[0.22em] text-gray-500">
                      OVERALL PERFORMANCE
                    </div>
                    <div className="mt-3 flex items-end gap-3">
                      <div className={cn("text-5xl font-extrabold tracking-tight", scoreTextClasses(overall))}>
                        {overall.toFixed(1)}
                      </div>
                      <div className="pb-1 text-sm font-extrabold text-gray-600">Out of 5.0</div>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="text-xs font-extrabold tracking-[0.22em] text-gray-500">OVERALL VERDICT</div>
                      <div
                        className={cn(
                          "inline-flex items-center rounded-full border px-3 py-1 text-xs font-extrabold",
                          badgeClasses(report.overallStatus),
                        )}
                      >
                        {report.overallStatus}
                      </div>
                    </div>
                    <div className="mt-4 text-base font-extrabold tracking-tight text-black">
                      {report.headline}
                    </div>
                    <div className="mt-2 max-w-3xl text-sm leading-6 text-[var(--app-muted)]">
                      {report.summary}
                    </div>
                  </div>
                </div>
              </CardBody>
            </GlassCardSection>
          </div>
        </section>

        <section className="mt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {report.drivers.map((d) => (
              <DriverCard
                key={d.id}
                driver={d}
                expanded={!!driverExpanded[d.id]}
                onToggle={() => setDriverExpanded((prev) => ({ ...prev, [d.id]: !prev[d.id] }))}
              />
            ))}
          </div>
        </section>
        {/* Sticky summary appears once this sentinel scrolls out of view. */}
        <div ref={stickySentinelRef} className="h-px w-full" />

        <section className="mt-8">
          <GlassCardSection>
            <CardBody className="p-6">
              <details className="open:[&_summary_svg]:rotate-180">
                <summary className="cursor-pointer list-none">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-base font-extrabold tracking-tight text-black">
                      View all competency areas
                    </div>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                      className="h-5 w-5 shrink-0 text-black/60 transition-transform duration-200"
                    >
                      <path
                        d="M6 9l6 6 6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </summary>

                <div className="mt-4 text-sm leading-6 text-[var(--app-muted)]">
                  Each pillar has an overall score. The driver cards above show the top-level rating, and the breakdown
                  shows per–sub-skill detail.
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  {report.drivers.map((d) => (
                    <GlassCard key={d.id} className="border-white/70">
                      <CardBody className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-extrabold tracking-tight text-black">{d.fullTitle}</div>
                            <div className="mt-1 text-xs font-extrabold tracking-[0.22em] text-gray-500">
                              PILLAR SCORE
                            </div>
                          </div>
                          <div className={cn("shrink-0 text-sm font-extrabold", scoreTextClasses(d.score))}>
                            {d.score.toFixed(1)}/5
                          </div>
                        </div>
                        <div className="mt-4 space-y-2">
                          {d.subSkills.map((s) => (
                            <div key={s.name} className="flex items-center justify-between gap-3">
                              <div className="min-w-0 truncate text-sm text-black">{s.name}</div>
                              <div className={cn("shrink-0 text-sm font-extrabold", scoreTextClasses(s.score))}>
                                {s.score.toFixed(1)}/5
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardBody>
                    </GlassCard>
                  ))}
                </div>
              </details>
            </CardBody>
          </GlassCardSection>
        </section>

        <section className="mt-10">
          <GlassCardSection>
            <CardBody className="p-6">
              <SectionTitle title={report.narrative.title} subtitle={report.narrative.subtitle} />
              <div className="mt-4 max-w-4xl text-sm leading-6 text-[var(--app-muted)]">
                {report.narrative.paragraph}
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs font-extrabold text-gray-800">
                  Strongest: {report.highlightChips.strongest}
                </span>
                <span className="rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs font-extrabold text-gray-800">
                  Biggest gap: {report.highlightChips.biggestGap}
                </span>
              </div>
            </CardBody>
          </GlassCardSection>
        </section>

        <section className="mt-10">
          <SectionTitle title="Your answers — question by question" subtitle="Expand any row to see your answer and coaching opportunities." />
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
          <GlassCardSection>
            <CardBody className="p-6">
              <SectionTitle
                title="Recording and transcript"
                subtitle="Replay your session and scan the transcript for coaching flags."
              />

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <div className="min-w-0">
                  <div className="relative aspect-video w-full overflow-hidden rounded-[24px] border border-white/60 bg-white/50">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-full bg-black/80 px-4 py-2 text-sm font-extrabold text-white hover:bg-black/70"
                        onClick={() => window.alert("Player is a v1 stub.")}
                      >
                        <span className="h-2 w-2 rounded-full bg-teal-400" aria-hidden="true" />
                        Play
                      </button>
                    </div>
                    <div className="absolute bottom-3 left-3 rounded-full bg-white/70 px-3 py-1 text-xs font-extrabold text-gray-800">
                      {fmtDuration(report.meta.durationSeconds)}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-white/60 bg-white/50 p-4">
                    <div className="flex items-center gap-2 text-xs font-extrabold text-gray-700">
                      <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1">±10s</span>
                      <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1">1×</span>
                      <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1">PiP</span>
                    </div>
                    <div className="text-xs font-extrabold text-gray-600">Scrubber (stub)</div>
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="rounded-[24px] border border-white/60 bg-white/50 p-4">
                    <div className="text-xs font-extrabold tracking-[0.22em] text-gray-500">TRANSCRIPT</div>
                    <div className="mt-3 max-h-[320px] space-y-3 overflow-auto pr-1">
                      {report.transcript.map((line, idx) => (
                        <div key={idx} className="rounded-[18px] border border-white/60 bg-white/60 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-xs font-extrabold text-gray-800">{line.speaker}</div>
                            <div className="text-xs font-extrabold text-gray-500">{fmtDuration(line.timeSeconds)}</div>
                          </div>
                          <div className="mt-2 text-sm leading-6 text-black">{line.text}</div>
                          {line.flag ? (
                            <div className="mt-2 inline-flex items-center rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-[11px] font-extrabold text-rose-900">
                              {line.flag}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </GlassCardSection>
        </section>

        <section className="mt-10">
          <GlassCardSection>
            <CardBody className="p-6">
              <SectionTitle
                title="Areas to improve"
                subtitle="A sharper rewrite + delivery notes for your highest-priority gap."
              />

              <div className="mt-6 rounded-[24px] border border-white/60 bg-white/50 p-5">
                <h3 className="text-base font-extrabold tracking-tight text-black">
                  The AI coach has picked the weakest question to help you improve.
                </h3>

                {spotlightQuestion ? (
                  <div className="mt-4 text-sm font-extrabold tracking-tight text-black">
                    “{spotlightQuestion.text}”
                  </div>
                ) : null}

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-extrabold tracking-[0.22em] text-gray-500">
                      <span className="inline-flex h-2 w-2 rounded-full bg-black/40" aria-hidden="true" />
                      YOUR ANSWER
                    </div>
                    <blockquote className="mt-2 rounded-[18px] border border-white/60 bg-white/70 p-4 text-sm leading-6 text-black">
                      {report.spotlight.yourAnswer}
                    </blockquote>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-xs font-extrabold tracking-[0.22em] text-gray-500">
                      <span className="inline-flex h-2 w-2 rounded-full bg-teal-500" aria-hidden="true" />
                      COACH REWRITE
                    </div>
                    <blockquote className="mt-2 whitespace-pre-line rounded-[18px] border border-teal-500/20 bg-teal-500/10 p-4 text-sm leading-6 text-black">
                      {report.spotlight.coachRewrite}
                    </blockquote>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="text-xs font-extrabold tracking-[0.22em] text-gray-500">
                    WHY THIS VERSION IS STRONGER
                  </div>
                  <ul className="mt-3 grid gap-2 text-sm leading-6 text-black">
                    {report.spotlight.whyStronger.map((s) => (
                      <li key={s} className="flex gap-2">
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-teal-500" aria-hidden="true" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <GlassCard className="border-white/70">
                  <CardBody className="p-5">
                    <div className="text-sm font-extrabold tracking-tight text-black">Body language</div>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--app-muted)]">
                      {report.spotlight.delivery.bodyLanguage.map((s) => (
                        <li key={s} className="flex gap-2">
                          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-black/30" aria-hidden="true" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </CardBody>
                </GlassCard>

                <GlassCard className="border-white/70">
                  <CardBody className="p-5">
                    <div className="text-sm font-extrabold tracking-tight text-black">Grammar & phrasing</div>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--app-muted)]">
                      {report.spotlight.delivery.grammarPhrasing.map((s) => (
                        <li key={s} className="flex gap-2">
                          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-black/30" aria-hidden="true" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </CardBody>
                </GlassCard>

                <GlassCard className="border-white/70">
                  <CardBody className="p-5">
                    <div className="text-sm font-extrabold tracking-tight text-black">
                      Gestures & interview presence
                    </div>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--app-muted)]">
                      {report.spotlight.delivery.gesturesPresence.map((s) => (
                        <li key={s} className="flex gap-2">
                          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-black/30" aria-hidden="true" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </CardBody>
                </GlassCard>

                <GlassCard className="border-white/70">
                  <CardBody className="p-5">
                    <div className="text-sm font-extrabold tracking-tight text-black">Filler words & pacing</div>
                    <div className="mt-3 text-sm leading-6 text-[var(--app-muted)]">
                      {report.spotlight.delivery.fillerPacing.summary}
                    </div>
                    <div className="mt-4 text-sm font-extrabold tracking-tight text-black">On-camera presence</div>
                    <div className="mt-2 text-sm leading-6 text-[var(--app-muted)]">
                      {report.spotlight.delivery.fillerPacing.onCameraPresence}
                    </div>
                  </CardBody>
                </GlassCard>
              </div>
            </CardBody>
          </GlassCardSection>
        </section>

        <section className="mt-10">
          <GlassCardSection>
            <CardBody className="p-6">
              <SectionTitle title="What to work on next" subtitle="Suggested trainings based on your highest-leverage gaps." />

              <div className="mt-6 grid gap-4 lg:grid-cols-4">
                <GlassCard className="lg:col-span-2">
                  <CardBody className="p-5">
                    <div className="inline-flex items-center rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1 text-xs font-extrabold text-teal-900">
                      Featured
                    </div>
                    <div className="mt-3 text-lg font-extrabold tracking-tight text-black">
                      {report.trainings.featured.title}
                    </div>
                    <div className="mt-2 text-sm leading-6 text-[var(--app-muted)]">
                      {report.trainings.featured.description}
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-extrabold text-gray-700">
                      <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1">
                        {report.trainings.featured.pillar}
                      </span>
                      <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1">
                        {report.trainings.featured.difficulty}
                      </span>
                      <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1">
                        {report.trainings.featured.durationMinutes} min
                      </span>
                    </div>
                    <div className="mt-4">
                      <Link
                        href={report.trainings.featured.href}
                        className="text-sm font-extrabold text-black underline decoration-black/20 underline-offset-4 hover:decoration-black/40"
                      >
                        Start training
                      </Link>
                    </div>
                  </CardBody>
                </GlassCard>

                {report.trainings.more.map((t) => (
                  <GlassCard key={t.id}>
                    <CardBody className="p-5">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold text-gray-700">
                        <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1">{t.pillar}</span>
                        <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1">
                          {t.durationMinutes} min
                        </span>
                      </div>
                      <div className="mt-3 text-base font-extrabold tracking-tight text-black">{t.title}</div>
                      <div className="mt-2 text-sm leading-6 text-[var(--app-muted)]">{t.description}</div>
                      <div className="mt-4">
                        <Link
                          href={t.href}
                          className="text-sm font-extrabold text-black underline decoration-black/20 underline-offset-4 hover:decoration-black/40"
                        >
                          Start training
                        </Link>
                      </div>
                    </CardBody>
                  </GlassCard>
                ))}
              </div>
            </CardBody>
          </GlassCardSection>
        </section>
      </div>

      <CoachBottomChatBar placeholder="Ask about this report (e.g. “How do I improve Q4?”)" />
    </AppShell>
  );
}

