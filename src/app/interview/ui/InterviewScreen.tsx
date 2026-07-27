"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, ClipboardCheck, Clock3, ListChecks, MicOff, Video, VideoOff } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { cn } from "@/components/cn";
import { CoachBottomChatBar } from "@/components/CoachBottomChatBar";
import { CoachFloatingNav } from "@/components/CoachFloatingNav";
import { TypingText } from "@/components/TypingText";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CardButton } from "@/components/ui/card-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SuccessDriverIcon } from "@/components/ui/success-driver-icon";
import { Switch } from "@/components/ui/switch";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import { scoringBadgeClass, scoringTextClass } from "@/lib/scoringPalette";
import type {
  InterviewReport,
  InterviewSessionKind,
  RoleProfile,
  StoryboardFromCraft,
  TrainingJourneyProgress,
} from "@/lib/proofdiveTypes";
import {
  createStoryboardDraft,
  normalizeStoryboardDocument,
  overallCompetencyStrength,
  PILLAR_LABEL,
  type PillarId,
  type StoryboardDraftDocument,
  type StoryboardDraftStore,
} from "@/lib/storyboardDraft";
import { ONBOARDING_INTRO_VIDEO_SRC } from "@/lib/onboardingIntroVideo";
import { hasCompletedAnyTrainingForRole } from "@/lib/trainingJourneyProgress";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

function parseReportsMap(raw: string | null): Record<string, InterviewReport> | null {
  try {
    if (!raw) return null;
    const v = JSON.parse(raw) as Record<string, InterviewReport>;
    return v && typeof v === "object" ? v : null;
  } catch {
    return null;
  }
}

function pickRecentReports(roleFilter: string, limit: number): InterviewReport[] {
  if (typeof window === "undefined") return [];
  const map = parseReportsMap(window.localStorage.getItem(StorageKeys.reports));
  if (!map) return [];
  const rf = roleFilter.trim();
  let list = Object.values(map);
  if (rf) list = list.filter((r) => (r.meta?.roleTitle ?? "").trim() === rf);
  return [...list]
    .sort((a, b) => new Date(b.meta.createdAt).getTime() - new Date(a.meta.createdAt).getTime())
    .slice(0, limit);
}

function sessionTypeLabel(report: InterviewReport): string {
  const min = Math.max(0, Math.round(report.meta.durationSeconds / 60));
  if (min >= 28) return "Full competency mock · 30 min";
  if (min >= 8) return "Mock session · 10 min";
  return `Mock session · ${min} min`;
}

const SELECTIVE_PILLAR_IDS: PillarId[] = ["thinking", "action", "people", "mastery"];

const CONSENT_TIPS: ReactNode[] = [
  <>
    Structure your answers using the <span className="font-semibold text-text-primary">CAR</span>{" "}
    method (Context, Action, Result).
  </>,
  <>Keep responses clear and concise (1–2 minutes max).</>,
  <>Focus on your individual contribution, not just the team.</>,
  <>Position yourself properly if your camera is on. Sit centered, well-lit, and not too far.</>,
  <>Ensure a clean, plain background with minimal distractions.</>,
];

export function InterviewScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  /** When set (e.g. coach “quick interview” CTA), always show the first-time 10 min flow even if post-journey landing would apply. */
  const forceFirstMockFlow =
    searchParams.get("first") === "1" || searchParams.get("first")?.toLowerCase() === "true";
  /** When set (e.g. coach journey “Start interview”), show the “welcome back” landing. */
  const forceWelcomeBackLanding =
    searchParams.get("welcomeBack") === "1" || searchParams.get("welcomeBack")?.toLowerCase() === "true";
  const [roleProfile] = useLocalStorageState<RoleProfile | null>(StorageKeys.roleProfile, null);
  const [trainingJourneyProgressMap] = useLocalStorageState<Record<string, TrainingJourneyProgress>>(
    StorageKeys.trainingProgress,
    {},
  );
  const [draftStore] = useLocalStorageState<StoryboardDraftStore>(StorageKeys.storyboardDraft, {
    version: 1,
    byRole: {},
  });
  const [fromCraft] = useLocalStorageState<StoryboardFromCraft | null>(
    StorageKeys.storyboardFromCraft,
    null,
  );

  const name = roleProfile?.name?.trim() || "there";
  const role = roleProfile?.targetRole?.trim() ?? "";

  const storyDraftDocument = useMemo<StoryboardDraftDocument>(() => {
    if (!role) return createStoryboardDraft("");
    const raw = draftStore.byRole[role] ?? createStoryboardDraft(role);
    return normalizeStoryboardDocument(raw);
  }, [draftStore, role]);

  const storyOverallScore = useMemo(
    () => overallCompetencyStrength(storyDraftDocument),
    [storyDraftDocument],
  );

  const hasCreatedStoryboard = useMemo(() => {
    if (!role) return false;
    if (fromCraft && fromCraft.v === 1 && fromCraft.role === role) return true;
    return storyOverallScore > 0;
  }, [role, fromCraft, storyOverallScore]);

  const trainingComplete = useMemo(
    () => hasCompletedAnyTrainingForRole(trainingJourneyProgressMap, role),
    [trainingJourneyProgressMap, role],
  );

  const showPostJourneyMockLanding =
    (forceWelcomeBackLanding || (trainingComplete && hasCreatedStoryboard)) && !forceFirstMockFlow;

  const [jobDescriptionName, setJobDescriptionName] = useState<string>("");
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const jobDescriptionInputRef = useRef<HTMLInputElement | null>(null);
  const [consentOpen, setConsentOpen] = useState(false);
  const [cancelRecording, setCancelRecording] = useState(false);
  const [turnOffCamera, setTurnOffCamera] = useState(false);
  const [sessionKind, setSessionKind] = useState<InterviewSessionKind | null>(null);
  const [introLearnModalOpen, setIntroLearnModalOpen] = useState(false);
  const introLearnVideoRef = useRef<HTMLVideoElement>(null);
  const [recentStatsOpen, setRecentStatsOpen] = useState(false);
  const [recentReports, setRecentReports] = useState<InterviewReport[]>([]);
  const [recentDemoSeed, setRecentDemoSeed] = useState(0);
  const [pillarPickOpen, setPillarPickOpen] = useState(false);
  const [selectivePillarIds, setSelectivePillarIds] = useState<PillarId[]>([]);
  const [pillarPickError, setPillarPickError] = useState<string | null>(null);
  const [pendingSelectivePillars, setPendingSelectivePillars] = useState<PillarId[] | null>(null);

  const closeIntroLearnModal = useCallback(() => {
    const v = introLearnVideoRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
    setIntroLearnModalOpen(false);
  }, []);

  useEffect(() => {
    if (!introLearnModalOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeIntroLearnModal();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [introLearnModalOpen, closeIntroLearnModal]);

  useEffect(() => {
    if (!introLearnModalOpen) return;
    void introLearnVideoRef.current?.play().catch(() => {});
  }, [introLearnModalOpen]);

  useEffect(() => {
    if (!recentStatsOpen) return;
    setRecentDemoSeed(Date.now());
    setRecentReports(pickRecentReports(role, 2));
  }, [recentStatsOpen, role]);

  const recentStatsCards = useMemo(() => {
    if (recentReports.length > 0) {
      return recentReports.map((rep) => ({
        key: rep.meta.id,
        roleTitle: rep.meta.roleTitle,
        scoreText: rep.overallScore.toFixed(1),
        status: rep.overallStatus,
        sessionType: sessionTypeLabel(rep),
        onView: () => router.push(`/report/${rep.meta.id}`),
      }));
    }

    // Demo cards (when there are no saved reports yet)
    const roleTitle = role || "Software Engineer";
    const rng = (n: number) => {
      const x = Math.sin((recentDemoSeed + n) * 999) * 10000;
      return x - Math.floor(x);
    };
    const mk = (i: number) => {
      const score = 1.6 + rng(i) * 2.6;
      const status = score >= 4.5 ? "Star" : score >= 3.5 ? "Pass" : score >= 2.5 ? "Borderline" : "Not ready";
      const mins = score >= 3.2 ? 30 : 10;
      return {
        key: `demo-${i}`,
        roleTitle,
        scoreText: score.toFixed(1),
        status,
        sessionType: mins === 30 ? "Full competency mock · 30 min" : "Mock session · 10 min",
        onView: () => router.push("/report"),
      };
    };
    return [mk(1), mk(2)];
  }, [recentReports, recentDemoSeed, role, router]);

  function openConsent(nextKind: InterviewSessionKind) {
    setSessionKind(nextKind);
    setConsentOpen(true);
  }

  function openSelectivePillarPicker() {
    setPillarPickError(null);
    setSelectivePillarIds([]);
    setPillarPickOpen(true);
  }

  function toggleSelectivePillar(id: PillarId) {
    setSelectivePillarIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
    setPillarPickError(null);
  }

  function confirmSelectivePillarsAndConsent() {
    if (selectivePillarIds.length === 0) {
      setPillarPickError("Pick at least one competency area to continue.");
      return;
    }
    setPendingSelectivePillars([...selectivePillarIds]);
    setPillarPickOpen(false);
    openConsent("selective_pillar");
  }

  return (
    <AppShell>
      <CoachFloatingNav />
      <div className="flex min-h-[70vh] w-full flex-col items-stretch justify-center pb-44">
        <div className="flex w-full flex-1 items-center justify-center">
          <div className="mx-auto w-[800px] max-w-full text-left">
          {showPostJourneyMockLanding ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-caption text-text-secondary">Mock interview</span>
                <Badge
                  variant="outline"
                  className="rounded-full border-scoring-green/25 bg-scoring-green/15 text-caption text-scoring-green-fg"
                >
                  <CheckCircle2 className="size-3" aria-hidden />
                  Ready for you
                </Badge>
              </div>

              <h1 className="mt-3 text-h3 text-heading-teal">
                <TypingText
                  key={`interview-welcome-${name}`}
                  text={`Hey ${name}, glad to see you back`}
                  mode="word"
                  cursor={false}
                  baseWordDelayMs={120}
                  startDelayMs={220}
                />
              </h1>
              <p className="mt-1 max-w-lg text-caption leading-relaxed text-text-secondary">
                Training and storyboard are done. Choose a full mock or a shorter
                session focused on selected competencies.
              </p>

              <div className="mt-4 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                <CardButton
                  variant="primary"
                  icon={<Clock3 />}
                  title="30-minute full mock"
                  subtitle="All competency pillars, aligned with your storyboard."
                  illustrationSrc="/brand/illustration-1.svg"
                  onClick={() => openConsent("full_competency")}
                />
                <CardButton
                  variant="gray"
                  icon={<ListChecks />}
                  title="Short interview"
                  subtitle="Focus on selected competency pillars when time is tight."
                  illustrationSrc="/brand/illustration-4.svg"
                  onClick={openSelectivePillarPicker}
                />
              </div>

              <div className="mt-5 border-t border-border pt-3">
                <button
                  type="button"
                  onClick={() => setRecentStatsOpen((o) => !o)}
                  aria-expanded={recentStatsOpen}
                  className="flex w-full cursor-pointer items-center justify-between gap-3 text-left text-caption font-medium text-text-secondary transition hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2"
                >
                  <span className="underline decoration-border underline-offset-[5px]">
                    View my recent interview stats
                  </span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className={cn(
                      "h-4 w-4 shrink-0 text-text-secondary transition-transform duration-200",
                      recentStatsOpen && "rotate-180",
                    )}
                    aria-hidden
                  >
                    <path
                      d="M6 9l6 6 6-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                {recentStatsOpen ? (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {recentStatsCards.map((c) => (
                      <Card key={c.key} className="flex flex-col py-4">
                        <CardContent className="flex flex-1 flex-col gap-0 px-4">
                          <div className="text-overline text-text-secondary">
                            ROLE
                          </div>
                          <div className="mt-0.5 text-body-sm font-semibold text-text-primary">
                            {c.roleTitle}
                          </div>
                          <div className="mt-3 text-overline text-text-secondary">
                            SESSION SCORE
                          </div>
                          <div
                            className={cn(
                              "mt-0.5 text-h5 leading-none tabular-nums",
                              scoringTextClass(Number.parseFloat(c.scoreText)),
                            )}
                          >
                            {c.scoreText}
                            <span className="text-body-sm text-text-secondary"> / 5</span>
                          </div>
                          <div className="mt-1.5">
                            <span
                              className={cn(
                                "inline-flex rounded-full border px-2 py-0.5 text-overline",
                                scoringBadgeClass(c.status),
                              )}
                            >
                              {c.status}
                            </span>
                          </div>
                          <div className="mt-3 text-overline text-text-secondary">
                            SESSION TYPE
                          </div>
                          <div className="mt-0.5 text-caption font-semibold text-text-primary">
                            {c.sessionType}
                          </div>
                          <div className="mt-3 flex-1" />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-1 w-full sm:w-auto"
                            onClick={c.onView}
                          >
                            View report
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <>
              <Badge
                variant="outline"
                className="rounded-full border-border bg-card text-caption text-text-secondary"
              >
                Duration · 10 min
              </Badge>

              <h1 className="mt-3 text-h3 text-heading-teal">
                <TypingText
                  key={`interview-first-${name}`}
                  text={`Hey ${name}, welcome to your first Mock Interview`}
                  mode="word"
                  cursor={false}
                  baseWordDelayMs={120}
                  startDelayMs={220}
                />
              </h1>

              <p className="mt-1 max-w-lg text-caption leading-relaxed text-text-secondary">
                This is a first mock interview. You’ll be judged based on the Proofdive Competency
                Engine.{" "}
                <button
                  type="button"
                  className="font-semibold text-text-primary underline underline-offset-2"
                  onClick={() => setIntroLearnModalOpen(true)}
                >
                  Learn more
                </button>
                .
              </p>

              <Card className="mt-4 gap-0 py-4">
                <CardContent className="space-y-3 px-4">
                  <input
                    ref={jobDescriptionInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(e) => {
                      const file = e.currentTarget.files?.[0];
                      setJobDescriptionName(file?.name ?? "");
                    }}
                  />

                  {roleProfile?.jobDescription ? (
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2
                        className="mt-0.5 size-4 shrink-0 text-scoring-green"
                        aria-hidden
                      />
                      <p className="min-w-0 text-caption leading-snug text-text-secondary">
                        Using the job description from your profile to tailor this interview.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="text-caption font-semibold text-text-primary">
                          Add a job description?
                        </div>
                        <div className="mt-0.5 text-caption leading-snug text-text-secondary">
                          Optional — helps tailor the interview.
                        </div>
                        {jobDescriptionName ? (
                          <div className="mt-1.5 text-overline text-text-secondary">
                            {jobDescriptionName}
                          </div>
                        ) : null}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                        onClick={() => jobDescriptionInputRef.current?.click()}
                      >
                        Upload JD
                      </Button>
                    </div>
                  )}

                  <div className="border-t border-border pt-3">
                    <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-muted/40 p-3 transition-colors hover:bg-muted/70 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring/40">
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 text-caption font-semibold text-text-primary">
                            <Video className="size-3.5 text-text-secondary" aria-hidden />
                            Enable camera
                          </span>
                          <Badge
                            variant="secondary"
                            className="rounded-full px-2 py-0 text-[10px] font-semibold uppercase tracking-wide"
                          >
                            Optional
                          </Badge>
                        </span>
                        <span className="mt-1 block text-caption leading-snug text-text-secondary">
                          Captures video for gesture and presence analytics.
                        </span>
                      </span>
                      <Switch
                        checked={cameraEnabled}
                        onCheckedChange={setCameraEnabled}
                        className="mt-0.5"
                        aria-label="Enable camera"
                      />
                    </label>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-5 flex flex-wrap gap-2.5">
                <Button
                  size="sm"
                  onClick={() => {
                    setSessionKind("first_time");
                    setConsentOpen(true);
                  }}
                >
                  Start mock interview
                </Button>
                <Link href="/coach?welcome=1">
                  <Button variant="outline" size="sm">
                    Skip interview
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
      </div>

      {pillarPickOpen
        ? createPortal(
        <div
          className="fixed inset-0 z-[105] overflow-y-auto bg-black/40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pillar-pick-title"
          onClick={() => {
            setPillarPickOpen(false);
            setSelectivePillarIds([]);
            setPillarPickError(null);
          }}
        >
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
          <div
            className="w-full max-w-lg rounded-lg border border-border bg-card p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-overline text-text-secondary">SHORT SESSION</div>
            <h2 id="pillar-pick-title" className="text-h5 mt-2 text-text-primary">
              Choose competency areas
            </h2>
            <p className="mt-2 text-caption leading-6 text-text-secondary">
              Select one or more pillars. The short interview will emphasize those areas.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {SELECTIVE_PILLAR_IDS.map((id) => {
                const on = selectivePillarIds.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleSelectivePillar(id)}
                    className={cn(
                      "rounded-2xl border px-4 py-3 text-left text-caption font-semibold transition",
                      on
                        ? "border-extended-cyan-green bg-[color-mix(in_srgb,var(--extended-cyan-green)_9%,white)] text-extended-cyan-green"
                        : "border-border bg-card text-text-primary hover:bg-muted",
                    )}
                  >
                    <span className="block text-overline uppercase text-current opacity-70">
                      {on ? "Selected" : "Tap to add"}
                    </span>
                    <span className="mt-2 flex items-center gap-2">
                      <SuccessDriverIcon
                        driver={id}
                        className="size-5 text-extended-cyan-green"
                      />
                      <span>{PILLAR_LABEL[id]}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            {pillarPickError ? (
              <p className="mt-4 text-caption font-semibold text-destructive" role="alert">
                {pillarPickError}
              </p>
            ) : null}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setPillarPickOpen(false);
                  setSelectivePillarIds([]);
                  setPillarPickError(null);
                }}
                className="sm:w-auto"
              >
                Cancel
              </Button>
              <Button type="button" onClick={confirmSelectivePillarsAndConsent} className="sm:w-auto">
                Take interview
              </Button>
            </div>
          </div>
          </div>
        </div>,
            document.body,
          )
        : null}

      <Dialog
        open={consentOpen}
        onOpenChange={(open) => {
          if (open) return;
          setConsentOpen(false);
          setSessionKind(null);
          setPendingSelectivePillars(null);
        }}
      >
        <DialogContent
          showCloseButton={false}
          onPointerDownOutside={(e) => e.preventDefault()}
          className="flex max-h-[min(92dvh,40rem)] w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-md border-border p-0 sm:max-w-md"
        >
          <DialogHeader className="gap-2 bg-gradient-to-br from-primary to-extended-dark-cyan-green px-5 py-4 text-left">
            <div
              className="flex size-8 items-center justify-center rounded-md bg-white/15 text-primary-foreground ring-1 ring-white/25"
              aria-hidden
            >
              <ClipboardCheck className="size-4" strokeWidth={1.75} />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-body-sm font-semibold text-primary-foreground">
                Interview consent & instructions
              </DialogTitle>
              <DialogDescription className="text-caption leading-snug text-primary-foreground/85">
                Quick prep, then choose how this session captures audio and video.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
            {sessionKind === "selective_pillar" &&
            pendingSelectivePillars &&
            pendingSelectivePillars.length > 0 ? (
              <div className="rounded-md border border-border bg-muted/70 px-3 py-2 text-caption font-semibold text-text-primary">
                Selected focus:{" "}
                {pendingSelectivePillars.map((id) => PILLAR_LABEL[id]).join(" · ")}
              </div>
            ) : null}

            <ul className="list-disc space-y-1.5 pl-4 text-caption leading-snug text-text-secondary marker:text-text-secondary">
              {CONSENT_TIPS.map((tip, index) => (
                <li key={index} className="pl-0.5">
                  {tip}
                </li>
              ))}
            </ul>

            <div>
              <p className="text-overline text-text-secondary">Session options</p>
              <div className="mt-2 space-y-2">
                <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-card p-3 transition-colors hover:bg-muted/50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring/40">
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 text-caption font-semibold text-text-primary">
                        <MicOff className="size-3.5 text-text-secondary" aria-hidden />
                        Cancel recording
                      </span>
                      <Badge
                        variant="secondary"
                        className="rounded-full px-2 py-0 text-[10px] font-semibold uppercase tracking-wide"
                      >
                        Optional
                      </Badge>
                    </span>
                    <span className="mt-1 block text-caption leading-snug text-text-secondary">
                      Session runs without audio / video capture
                    </span>
                  </span>
                  <Switch
                    checked={cancelRecording}
                    onCheckedChange={setCancelRecording}
                    className="mt-0.5"
                    aria-label="Cancel recording"
                  />
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-card p-3 transition-colors hover:bg-muted/50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring/40">
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 text-caption font-semibold text-text-primary">
                        <VideoOff className="size-3.5 text-text-secondary" aria-hidden />
                        Turn off camera
                      </span>
                      <Badge
                        variant="secondary"
                        className="rounded-full px-2 py-0 text-[10px] font-semibold uppercase tracking-wide"
                      >
                        Optional
                      </Badge>
                    </span>
                    <span className="mt-1 block text-caption leading-snug text-text-secondary">
                      Disables gesture and body movement analysis
                    </span>
                  </span>
                  <Switch
                    checked={turnOffCamera}
                    onCheckedChange={setTurnOffCamera}
                    className="mt-0.5"
                    aria-label="Turn off camera"
                  />
                </label>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 border-t border-border bg-muted/30 px-5 py-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setConsentOpen(false);
                setSessionKind(null);
                setPendingSelectivePillars(null);
              }}
              className="sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                try {
                  const kind: InterviewSessionKind = sessionKind ?? "first_time";
                  const payload: Record<string, unknown> = {
                    cancelRecording,
                    turnOffCamera,
                    cameraEnabled,
                    sessionKind: kind,
                  };
                  if (
                    kind === "selective_pillar" &&
                    pendingSelectivePillars &&
                    pendingSelectivePillars.length > 0
                  ) {
                    payload.selectivePillars = pendingSelectivePillars;
                  }
                  window.localStorage.setItem(
                    StorageKeys.interviewSessionPrefs,
                    JSON.stringify(payload),
                  );
                } catch {
                  // ignore
                }
                setConsentOpen(false);
                setSessionKind(null);
                setPendingSelectivePillars(null);
                router.push("/interview/live");
              }}
              className="sm:w-auto"
            >
              I understand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {introLearnModalOpen
        ? createPortal(
        <div
          className="fixed inset-0 z-[110] overflow-y-auto bg-black/40"
          onClick={closeIntroLearnModal}
          role="presentation"
        >
          <div className="flex min-h-full items-center justify-center p-4 sm:p-8">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="interview-intro-video-title"
            className="relative w-full max-w-2xl overflow-hidden rounded-lg border border-border bg-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
              <span
                id="interview-intro-video-title"
                className="min-w-0 flex-1 truncate text-caption font-semibold text-text-primary"
              >
                Learn about Proofdive
              </span>
              <button
                type="button"
                onClick={closeIntroLearnModal}
                className="inline-flex h-9 min-w-[72px] shrink-0 items-center justify-center rounded-full border border-border bg-muted px-3 text-caption font-semibold text-text-primary transition hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                Close
              </button>
            </div>
            <div className="bg-black p-2 sm:p-3">
              <video
                ref={introLearnVideoRef}
                className="mx-auto max-h-[min(52vh,480px)] w-full rounded-lg object-contain"
                controls
                playsInline
                src={ONBOARDING_INTRO_VIDEO_SRC}
              />
            </div>
          </div>
          </div>
        </div>,
            document.body,
          )
        : null}

      <CoachBottomChatBar compactWhenIdle />
    </AppShell>
  );
}

