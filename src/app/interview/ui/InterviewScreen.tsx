"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { cn } from "@/components/cn";
import { CoachBottomChatBar } from "@/components/CoachBottomChatBar";
import { CoachFloatingNav } from "@/components/CoachFloatingNav";
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
  const [roleProfile] = useLocalStorageState<RoleProfile | null>(StorageKeys.roleProfile, null);
  const [trainingJourneyProgress] = useLocalStorageState<TrainingJourneyProgress | null>(
    StorageKeys.trainingProgress,
    null,
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

  const trainingComplete = useMemo(() => {
    if (!trainingJourneyProgress) return false;
    if (
      trainingJourneyProgress.roleKey &&
      trainingJourneyProgress.roleKey !== role.trim()
    ) {
      return false;
    }
    return (
      trainingJourneyProgress.phase === "complete" || trainingJourneyProgress.percentComplete >= 100
    );
  }, [trainingJourneyProgress, role]);

  const showPostJourneyMockLanding =
    trainingComplete && hasCreatedStoryboard && !forceFirstMockFlow;

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
    setRecentReports(pickRecentReports(role, 2));
  }, [recentStatsOpen, role]);

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
          <div className="mx-auto w-full max-w-3xl text-left">
          {showPostJourneyMockLanding ? (
            <>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-4 py-2 text-xs font-extrabold tracking-tight text-gray-800">
                <span>Mock interview</span>
                <span className="h-3 w-px bg-black/[.12]" />
                <span>Ready for you</span>
              </div>

              <h2 className="mt-6 text-[40px] font-extrabold leading-[1.08] tracking-tight sm:text-[44px]">
                Hey {name}, glad to see you back
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--app-muted)]">
                You’ve completed training and crafted your story — it’s time to take a full mock
                interview. Pick how you want to practice below.
              </p>

              <div className="mt-8 flex w-full flex-col gap-4">
                <button
                  type="button"
                  onClick={() => openConsent("full_competency")}
                  className="group w-full cursor-pointer rounded-[18px] border border-white/50 bg-white p-5 text-left shadow-[0_12px_30px_rgba(0,0,0,0.06)] transition hover:bg-white/90 active:bg-white/80"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-base font-extrabold tracking-tight text-black">
                        Take a 30-minute mock interview
                      </div>
                      <div className="mt-1 text-sm leading-6 text-[var(--app-muted)]">
                        Full session covering all competency pillars, aligned with your storyboard.
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full border border-black/10 bg-black/[.04] px-3 py-1 text-xs font-extrabold text-gray-800">
                      30 min
                    </span>
                  </div>
                </button>

                <div className="relative w-full">
                  <button
                    type="button"
                    onClick={openSelectivePillarPicker}
                    className="group w-full cursor-pointer rounded-[18px] border border-white/50 bg-white p-5 pr-16 text-left shadow-[0_12px_30px_rgba(0,0,0,0.06)] transition hover:bg-white/90 active:bg-white/80"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-base font-extrabold tracking-tight text-black">
                          Take a short interview
                        </div>
                        <div className="mt-1 text-sm leading-6 text-[var(--app-muted)]">
                          Focus on selected competency pillars when you have limited time.
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs font-extrabold text-gray-800">
                        Short
                      </span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openSelectivePillarPicker();
                    }}
                    className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white/90 text-black/55 shadow-sm transition hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
                    aria-label="Choose competency areas for short interview"
                    title="Choose competencies"
                  >
                    <ShortInterviewClockIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="mt-8 border-t border-black/[0.06] pt-6">
                <button
                  type="button"
                  onClick={() => setRecentStatsOpen((o) => !o)}
                  aria-expanded={recentStatsOpen}
                  className="flex w-full items-center justify-between gap-3 text-left text-base font-extrabold text-black transition hover:text-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/15 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--app-bg)]"
                >
                  <span className="underline decoration-black/20 underline-offset-[6px]">
                    View my recent interview stats
                  </span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className={cn(
                      "h-5 w-5 shrink-0 text-black/50 transition-transform duration-200",
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
                    {recentReports.length === 0 ? (
                      <div className="rounded-[18px] border border-white/50 bg-white/80 p-5 text-sm leading-6 text-[var(--app-muted)] sm:col-span-2">
                        No saved mock reports yet for this role. Finish a mock interview to see session
                        cards here.
                      </div>
                    ) : (
                      recentReports.map((rep) => (
                        <div
                          key={rep.meta.id}
                          className="flex flex-col rounded-[18px] border border-white/50 bg-white p-5 shadow-[0_12px_30px_rgba(0,0,0,0.06)]"
                        >
                          <div className="text-xs font-extrabold tracking-[0.18em] text-[var(--app-muted)]">
                            ROLE
                          </div>
                          <div className="mt-1 text-lg font-extrabold tracking-tight text-black">
                            {rep.meta.roleTitle}
                          </div>
                          <div className="mt-4 text-xs font-extrabold tracking-[0.18em] text-[var(--app-muted)]">
                            SESSION SCORE
                          </div>
                          <div className="mt-1 text-2xl font-extrabold tabular-nums tracking-tight text-black">
                            {rep.overallScore.toFixed(1)}
                            <span className="text-base font-extrabold text-[var(--app-muted)]"> / 5</span>
                          </div>
                          <div className="mt-1 text-xs font-semibold text-[var(--app-muted)]">
                            {rep.overallStatus}
                          </div>
                          <div className="mt-4 text-xs font-extrabold tracking-[0.18em] text-[var(--app-muted)]">
                            SESSION TYPE
                          </div>
                          <div className="mt-1 text-sm font-bold text-black">{sessionTypeLabel(rep)}</div>
                          <div className="mt-4 flex-1" />
                          <Button
                            type="button"
                            variant="secondary"
                            className="mt-2 w-full sm:w-auto"
                            onClick={() => router.push(`/report/${rep.meta.id}`)}
                          >
                            View report
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-4 py-2 text-xs font-extrabold tracking-tight text-gray-800">
            <span>Duration</span>
            <span className="h-3 w-px bg-black/[.12]" />
            <span>10 min</span>
          </div>

          <h2 className="mt-6 text-[44px] font-extrabold leading-[1.05] tracking-tight">
            Hey {name}, welcome to your first Mock Interview
          </h2>

          <p className="mt-4 max-w-xl text-base leading-7 text-[var(--app-muted)]">
            This is a first mock interview. You’ll be judged based on the Proofdive Competency
            Engine.{" "}
            <button
              type="button"
              className="font-bold text-black underline underline-offset-4"
              onClick={() => setIntroLearnModalOpen(true)}
            >
              Learn more
            </button>
            .
          </p>

          <div className="mt-6 w-full max-w-none">
            <div className="rounded-[18px] border border-white/50 bg-white p-5 shadow-[0_12px_30px_rgba(0,0,0,0.06)]">
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

              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-base font-extrabold tracking-tight text-black">
                    Would you like to add a job description for this interview?
                  </div>
                  <div className="mt-1 text-sm leading-6 text-[var(--app-muted)]">
                    Uploading it helps tailor the interview.
                  </div>
                </div>

                <Button variant="secondary" onClick={() => jobDescriptionInputRef.current?.click()}>
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
                <div className="mt-3 text-sm text-[var(--app-muted)]">{jobDescriptionName}</div>
              ) : null}

              <div className="mt-5 border-t border-white/50 pt-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-extrabold tracking-tight text-black">
                      Enable camera
                    </div>
                    <div className="mt-1 text-sm leading-6 text-[var(--app-muted)]">
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
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3EC878]/40",
                      cameraEnabled
                        ? "border-black/10 bg-black"
                        : "border-black/15 bg-white/60 hover:bg-white/80",
                    ].join(" ")}
                  >
                    <span
                      aria-hidden="true"
                      className={[
                        "inline-block h-5 w-5 transform rounded-full bg-white shadow-[0_6px_16px_rgba(0,0,0,0.12)] transition",
                        cameraEnabled ? "translate-x-6" : "translate-x-1",
                      ].join(" ")}
                    />
                  </button>
                </div>
              </div>
            </div>
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
                <Button variant="secondary">Skip interview</Button>
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
            className="w-full max-w-lg rounded-[24px] bg-white p-6 shadow-[0_26px_80px_rgba(0,0,0,0.20)] sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-xs font-extrabold tracking-[0.22em] text-gray-500">SHORT SESSION</div>
            <h2 id="pillar-pick-title" className="mt-2 text-2xl font-extrabold tracking-tight text-black">
              Choose competency areas
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--app-muted)]">
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
                      "rounded-2xl border px-4 py-3 text-left text-sm font-extrabold tracking-tight transition",
                      on
                        ? "border-black bg-black text-white"
                        : "border-white/50 bg-white/80 text-black hover:bg-white",
                    )}
                  >
                    <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-current opacity-70">
                      {on ? "Selected" : "Tap to add"}
                    </span>
                    <span className="mt-1 block">{PILLAR_LABEL[id]}</span>
                  </button>
                );
              })}
            </div>
            {pillarPickError ? (
              <p className="mt-4 text-sm font-semibold text-red-600" role="alert">
                {pillarPickError}
              </p>
            ) : null}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="secondary"
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
          aria-label="Interview consent"
        >
          <div className="w-full max-w-2xl rounded-[24px] bg-white shadow-[0_26px_80px_rgba(0,0,0,0.20)]">
            <div className="p-6 sm:p-8">
              <div className="text-xs font-extrabold tracking-[0.22em] text-gray-500">
                BEFORE WE BEGIN
              </div>
              <div className="mt-3 text-3xl font-extrabold tracking-tight text-black">
                Interview consent
              </div>

              <div className="mt-6 space-y-3 text-sm leading-6 text-[var(--app-muted)]">
                {sessionKind === "selective_pillar" && pendingSelectivePillars && pendingSelectivePillars.length > 0 ? (
                  <div className="rounded-[16px] border border-black/10 bg-black/[0.04] p-4 text-sm font-semibold text-black">
                    Selected focus:{" "}
                    {pendingSelectivePillars.map((id) => PILLAR_LABEL[id]).join(" · ")}
                  </div>
                ) : null}
                <div className="rounded-[16px] border border-white/50 bg-white/40 p-4">
                  Structure your answers using the <span className="font-bold text-black">CAR</span>{" "}
                  method (Context, Action, Result).
                </div>
                <div className="rounded-[16px] border border-white/50 bg-white/40 p-4">
                  Keep responses clear and concise (1–2 minutes max).
                </div>
                <div className="rounded-[16px] border border-white/50 bg-white/40 p-4">
                  Focus on your individual contribution, not just the team.
                </div>
                <div className="rounded-[16px] border border-white/50 bg-white/40 p-4">
                  Position yourself properly if your camera is on — sit centered, well-lit, and not too far.
                </div>
                <div className="rounded-[16px] border border-white/50 bg-white/40 p-4">
                  Ensure a clean, plain background with minimal distractions.
                </div>
              </div>

              <div className="mt-7">
                <div className="text-xs font-extrabold tracking-[0.22em] text-gray-500">
                  SESSION OPTIONS
                </div>

                <div className="mt-4 space-y-3">
                  <button
                    type="button"
                    onClick={() => setCancelRecording((v) => !v)}
                    className="flex w-full items-start justify-between gap-4 rounded-[18px] border border-white/50 bg-white px-4 py-4 text-left hover:bg-white/50 active:bg-white/70"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-extrabold tracking-tight text-black">
                        Cancel recording
                      </div>
                      <div className="mt-1 text-sm leading-6 text-[var(--app-muted)]">
                        Session runs without audio / video capture
                      </div>
                    </div>
                    <div
                      className={[
                        "mt-1 inline-flex h-6 w-11 items-center rounded-full border transition",
                        cancelRecording ? "border-black/10 bg-black" : "border-black/15 bg-white/60",
                      ].join(" ")}
                      aria-hidden="true"
                    >
                      <div
                        className={[
                          "h-5 w-5 rounded-full bg-white shadow-[0_6px_16px_rgba(0,0,0,0.12)] transition",
                          cancelRecording ? "translate-x-5" : "translate-x-0.5",
                        ].join(" ")}
                      />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTurnOffCamera((v) => !v)}
                    className="flex w-full items-start justify-between gap-4 rounded-[18px] border border-white/50 bg-white px-4 py-4 text-left hover:bg-white/50 active:bg-white/70"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-extrabold tracking-tight text-black">
                        Turn off camera
                      </div>
                      <div className="mt-1 text-sm leading-6 text-[var(--app-muted)]">
                        Disables gesture and body movement analysis
                      </div>
                    </div>
                    <div
                      className={[
                        "mt-1 inline-flex h-6 w-11 items-center rounded-full border transition",
                        turnOffCamera ? "border-black/10 bg-black" : "border-black/15 bg-white/60",
                      ].join(" ")}
                      aria-hidden="true"
                    >
                      <div
                        className={[
                          "h-5 w-5 rounded-full bg-white shadow-[0_6px_16px_rgba(0,0,0,0.12)] transition",
                          turnOffCamera ? "translate-x-5" : "translate-x-0.5",
                        ].join(" ")}
                      />
                    </div>
                  </button>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button
                  variant="secondary"
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
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-black/10 bg-[var(--app-surface)] shadow-[0_24px_80px_rgba(0,0,0,0.22)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.08] px-4 py-3">
              <span
                id="interview-intro-video-title"
                className="min-w-0 flex-1 truncate text-sm font-bold text-black"
              >
                Learn about Proofdive
              </span>
              <button
                type="button"
                onClick={closeIntroLearnModal}
                className="inline-flex h-9 min-w-[72px] shrink-0 items-center justify-center rounded-full border border-black/10 bg-black/[0.04] px-3 text-sm font-bold text-black transition hover:bg-black/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/15"
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

