"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { cn } from "@/components/cn";
import { CoachBottomChatBar } from "@/components/CoachBottomChatBar";
import { CoachFloatingNav } from "@/components/CoachFloatingNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
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

function ShortInterviewClockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

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
      const status = score >= 3.5 ? "Ready" : score >= 2.5 ? "Borderline" : "Not ready";
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
      <div className="flex min-h-[70vh] w-full flex-col items-stretch justify-start pb-44">
        <div className="flex w-full flex-1 items-center justify-center">
          <div className="mx-auto w-[800px] max-w-full text-left">
          {showPostJourneyMockLanding ? (
            <>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-overline text-text-secondary">
                <span>Mock interview</span>
                <span className="h-3 w-px bg-border" />
                <span>Ready for you</span>
              </div>

              <h2 className="mt-6 text-agent-heading text-heading-teal">
                Hey {name}, glad to see you back
              </h2>
              <h4 className="mt-1 mb-[14px] max-w-2xl text-agent-question text-text-primary">
                You’ve completed training and crafted your story. It’s time to take a full mock
                interview. Pick how you want to practice below.
              </h4>

              <div className="mt-8 flex w-full flex-col gap-4">
                <button
                  type="button"
                  onClick={() => openConsent("full_competency")}
                  className="group w-full cursor-pointer rounded-xl border border-border bg-card p-5 text-left shadow-sm transition hover:bg-muted"
                >
                  <div className="flex w-full flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-body-sm font-semibold text-text-primary">
                        Take a 30-minute mock interview
                      </div>
                      <div className="mt-1 text-caption leading-6 text-text-secondary">
                        Full session covering all competency pillars, aligned with your storyboard.
                      </div>
                    </div>
                    <Badge variant="outline" className="border-border shrink-0">
                      30 min
                    </Badge>
                  </div>
                </button>

                <div className="relative w-full">
                  <button
                    type="button"
                    onClick={openSelectivePillarPicker}
                    className="group w-full cursor-pointer rounded-xl border border-border bg-card p-5 pr-16 text-left shadow-sm transition hover:bg-muted"
                  >
                    <div className="flex w-full flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-body-sm font-semibold text-text-primary">
                          Take a short interview
                        </div>
                        <div className="mt-1 text-caption leading-6 text-text-secondary">
                          Focus on selected competency pillars when you have limited time.
                        </div>
                      </div>
                      <Badge variant="outline" className="border-border shrink-0">
                        Short
                      </Badge>
                    </div>
                  </button>
                </div>
              </div>

              <div className="mt-8 border-t border-border pt-6">
                <button
                  type="button"
                  onClick={() => setRecentStatsOpen((o) => !o)}
                  aria-expanded={recentStatsOpen}
                  className="flex w-full items-center justify-between gap-3 text-left text-body-sm font-semibold text-text-primary transition hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2"
                >
                  <span className="underline decoration-border underline-offset-[6px]">
                    View my recent interview stats
                  </span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className={cn(
                      "h-5 w-5 shrink-0 text-text-secondary transition-transform duration-200",
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
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {recentStatsCards.map((c) => (
                      <Card key={c.key} className="flex flex-col">
                        <CardContent className="flex flex-1 flex-col">
                          <div className="text-overline text-text-secondary">
                            ROLE
                          </div>
                          <div className="text-body font-semibold mt-1 text-text-primary">
                            {c.roleTitle}
                          </div>
                          <div className="mt-4 text-overline text-text-secondary">
                            SESSION SCORE
                          </div>
                          <div className="text-h5 mt-1 leading-none tabular-nums text-text-primary">
                            {c.scoreText}
                            <span className="text-body-sm text-text-secondary"> / 5</span>
                          </div>
                          <div className="mt-1 text-overline text-text-secondary">
                            {c.status}
                          </div>
                          <div className="mt-4 text-overline text-text-secondary">
                            SESSION TYPE
                          </div>
                          <div className="mt-1 text-caption font-semibold text-text-primary">{c.sessionType}</div>
                          <div className="mt-4 flex-1" />
                          <Button
                            type="button"
                            variant="outline"
                            className="mt-2 w-full sm:w-auto"
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
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-overline text-text-secondary">
            <span>Duration</span>
            <span className="h-3 w-px bg-border" />
            <span>10 min</span>
          </div>

          <h2 className="mt-6 text-agent-heading text-heading-teal">
            Hey {name}, welcome to your first Mock Interview
          </h2>

          <h4 className="mt-1 mb-[14px] max-w-xl text-agent-question text-text-primary">
            This is a first mock interview. You’ll be judged based on the Proofdive Competency
            Engine.{" "}
            <button
              type="button"
              className="font-bold text-text-primary underline underline-offset-4"
              onClick={() => setIntroLearnModalOpen(true)}
            >
              Learn more
            </button>
            .
          </h4>

          <div className="mt-6 w-full max-w-none">
            <Card>
              <CardContent>
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
                <div className="flex items-start gap-3">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-text-secondary">
                    <path
                      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="min-w-0 text-caption leading-6 text-text-secondary">
                    Using the job description from your profile to tailor this interview.
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-body-sm font-semibold text-text-primary">
                        Would you like to add a job description for this interview?
                      </div>
                      <div className="mt-1 text-caption leading-6 text-text-secondary">
                        Uploading it helps tailor the interview.
                      </div>
                    </div>

                    <Button variant="outline" onClick={() => jobDescriptionInputRef.current?.click()}>
                      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
                        <path
                          d="M12 15V3m0 0 4 4m-4-4-4 4"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Upload job description
                    </Button>
                  </div>

                  {jobDescriptionName ? (
                    <div className="mt-3 text-caption text-text-secondary">{jobDescriptionName}</div>
                  ) : null}
                </>
              )}

              <div className="mt-5 border-t border-border pt-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-caption font-semibold text-text-primary">
                      Enable camera
                    </div>
                    <div className="mt-1 text-caption leading-6 text-text-secondary">
                      Optional: it captures video for gesture and presence for detailed analytics.
                    </div>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={cameraEnabled}
                    onClick={() => setCameraEnabled((v) => !v)}
                    className={[
                      "relative mt-1 inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                      cameraEnabled
                        ? "border-primary bg-primary"
                        : "border-border bg-muted hover:bg-muted/80",
                    ].join(" ")}
                  >
                    <span
                      aria-hidden="true"
                      className={[
                        "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition",
                        cameraEnabled ? "translate-x-6" : "translate-x-1",
                      ].join(" ")}
                    />
                  </button>
                </div>
              </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-10">
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => {
                  setSessionKind("first_time");
                  setConsentOpen(true);
                }}
              >
                Start mock interview
              </Button>
              <Link href="/coach?welcome=1">
                <Button variant="outline">Skip interview</Button>
              </Link>
            </div>
          </div>
            </>
          )}
        </div>
      </div>
      </div>

      {pillarPickOpen ? (
        <div
          className="fixed inset-0 z-[105] flex items-center justify-center bg-black/40 p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pillar-pick-title"
          onClick={() => {
            setPillarPickOpen(false);
            setSelectivePillarIds([]);
            setPillarPickError(null);
          }}
        >
          <div
            className="w-full max-w-lg rounded-[24px] bg-card p-6 shadow-[0_26px_80px_rgba(0,0,0,0.20)] sm:p-8"
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
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-text-primary hover:bg-muted",
                    )}
                  >
                    <span className="block text-overline uppercase text-current opacity-70">
                      {on ? "Selected" : "Tap to add"}
                    </span>
                    <span className="mt-1 block">{PILLAR_LABEL[id]}</span>
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
      ) : null}

      {consentOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Interview Consent & Instructions"
        >
          <div className="w-full max-w-2xl rounded-[24px] bg-card shadow-[0_26px_80px_rgba(0,0,0,0.20)]">
            <div className="p-6 sm:p-8">
              <div className="text-overline text-text-secondary">
                BEFORE WE BEGIN
              </div>
              <div className="text-h5 mt-3 text-text-primary">
                Interview Consent & Instructions
              </div>

              <div className="mt-6 space-y-1.5 text-caption leading-6 text-text-secondary">
                {sessionKind === "selective_pillar" && pendingSelectivePillars && pendingSelectivePillars.length > 0 ? (
                  <div className="rounded-[16px] border border-border bg-muted p-4 text-caption font-semibold text-text-primary">
                    Selected focus:{" "}
                    {pendingSelectivePillars.map((id) => PILLAR_LABEL[id]).join(" · ")}
                  </div>
                ) : null}
                <div className="mb-0 rounded-[16px] border border-border bg-muted p-4">
                  Structure your answers using the <span className="font-bold text-text-primary">CAR</span>{" "}
                  method (Context, Action, Result).
                </div>
                <div className="rounded-[16px] border border-border bg-muted p-4">
                  Keep responses clear and concise (1–2 minutes max).
                </div>
                <div className="rounded-[16px] border border-border bg-muted p-4">
                  Focus on your individual contribution, not just the team.
                </div>
                <div className="rounded-[16px] border border-border bg-muted p-4">
                  Position yourself properly if your camera is on. Sit centered, well-lit, and not too far.
                </div>
                <div className="rounded-[16px] border border-border bg-muted px-4 py-1">
                  Ensure a clean, plain background with minimal distractions.
                </div>
              </div>

              <div className="mt-7">
                <div className="text-overline text-text-secondary">
                  SESSION OPTIONS
                </div>

                <div className="mt-4 space-y-3">
                  <button
                    type="button"
                    onClick={() => setCancelRecording((v) => !v)}
                    className="flex w-full items-start justify-between gap-4 rounded-xl border border-border bg-card px-4 py-4 text-left hover:bg-muted"
                  >
                    <div className="min-w-0">
                      <div className="text-caption font-semibold text-text-primary">
                        Cancel recording
                      </div>
                      <div className="mt-1 text-caption leading-6 text-text-secondary">
                        Session runs without audio / video capture
                      </div>
                    </div>
                    <div
                      className={[
                        "mt-1 inline-flex h-6 w-11 items-center rounded-full border transition",
                        cancelRecording ? "border-primary bg-primary" : "border-border bg-muted",
                      ].join(" ")}
                      aria-hidden="true"
                    >
                      <div
                        className={[
                          "h-5 w-5 rounded-full bg-white shadow-sm transition",
                          cancelRecording ? "translate-x-5" : "translate-x-0.5",
                        ].join(" ")}
                      />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTurnOffCamera((v) => !v)}
                    className="flex w-full items-start justify-between gap-4 rounded-xl border border-border bg-card px-4 py-4 text-left hover:bg-muted"
                  >
                    <div className="min-w-0">
                      <div className="text-caption font-semibold text-text-primary">
                        Turn off camera
                      </div>
                      <div className="mt-1 text-caption leading-6 text-text-secondary">
                        Disables gesture and body movement analysis
                      </div>
                    </div>
                    <div
                      className={[
                        "mt-1 inline-flex h-6 w-11 items-center rounded-full border transition",
                        turnOffCamera ? "border-primary bg-primary" : "border-border bg-muted",
                      ].join(" ")}
                      aria-hidden="true"
                    >
                      <div
                        className={[
                          "h-5 w-5 rounded-full bg-white shadow-sm transition",
                          turnOffCamera ? "translate-x-5" : "translate-x-0.5",
                        ].join(" ")}
                      />
                    </div>
                  </button>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
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
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {introLearnModalOpen ? (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4 sm:p-8"
          onClick={closeIntroLearnModal}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="interview-intro-video-title"
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-[0_24px_80px_rgba(0,0,0,0.22)]"
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
      ) : null}

      <CoachBottomChatBar />
    </AppShell>
  );
}

