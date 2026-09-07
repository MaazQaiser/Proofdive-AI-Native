"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { AgentPrompt } from "@/components/agents/AgentPrompt";
import { CoachBottomChatBar } from "@/components/CoachBottomChatBar";
import { CoachFloatingNav } from "@/components/CoachFloatingNav";
import { COACH_HUB_CONTENT_TOP_CLASS } from "@/components/coachNavLayout";
import { GenericUpgradeModal } from "@/components/GenericUpgradeModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
  GlassBlurSymbol,
  glassCardSurfaceClasses,
} from "@/components/ui/glass-blur-symbol";
import { PixelMedia } from "@/components/ui/pixel-media";
import {
  SUCCESS_DRIVER_SYMBOL_CLASS,
} from "@/components/ui/success-driver-card";
import { SuccessDriverIcon } from "@/components/ui/success-driver-icon";
import { TrainingChapterOneJourney } from "@/app/training/ui/TrainingChapterOneJourney";
import { TRAINING_CAMPAIGN } from "@/app/training/ui/trainingVisuals";
import {
  COURSE_ENTRY_HEADING,
  OPTION_COMPETENCY_PILLARS_DESC,
  OPTION_COMPETENCY_PILLARS_TITLE,
  OPTION_INTERVIEW_ESSENTIALS_DESC,
  OPTION_INTERVIEW_ESSENTIALS_TITLE,
  entryIntro,
} from "@/app/training/trainingCopy";
import { hasMasterclassAccess } from "@/lib/candidateUsage";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import { buildTrainingJourneyProgress, trainingProgressKey } from "@/lib/trainingJourneyProgress";
import type { RoleProfile, TrainingJourneyProgress, TrainingJourneyPhase } from "@/lib/proofdiveTypes";
import { useLocalStorageState } from "@/lib/useLocalStorageState";
import { usePaymentBundles } from "@/lib/usePaymentBundles";
import {
  useCandidateEntitlements,
  useCandidateSubscription,
} from "@/lib/useSubscriberPayments";
import { cn } from "@/lib/utils";
import { ArrowRight, ArrowUpRight } from "lucide-react";

type TrainingCourse = {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  checkpoints: number;
  chapters: Array<{ title: string; summary: string; duration: string; imageUrl: string }>;
};

type SuggestedPillar = {
  id: "thinking" | "action" | "people";
  title: string;
  summary: string;
  badge: string;
  duration: string;
  suggestion: string;
  courseId: "competency-pillars";
  imageUrl: string;
};

const PILLAR_MEDIA: Record<SuggestedPillar["id"], string> = {
  thinking: TRAINING_CAMPAIGN[1],
  action: TRAINING_CAMPAIGN[4],
  people: TRAINING_CAMPAIGN[5],
};

const CHAPTER_MEDIA = [
  TRAINING_CAMPAIGN[1],
  TRAINING_CAMPAIGN[2],
  TRAINING_CAMPAIGN[3],
  TRAINING_CAMPAIGN[4],
  TRAINING_CAMPAIGN[5],
] as const;

export function TrainingScreen() {
  const [roleProfile] = useLocalStorageState<RoleProfile | null>(
    StorageKeys.roleProfile,
    null,
  );
  const [subscription] = useCandidateSubscription();
  const [entitlements] = useCandidateEntitlements();
  const { bundles } = usePaymentBundles();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const activeBundle =
    subscription.bundleId != null
      ? bundles.find((b) => b.id === subscription.bundleId) ?? null
      : null;
  const masterclassAccess = hasMasterclassAccess(subscription, entitlements, activeBundle);

  useEffect(() => {
    if (!masterclassAccess) setUpgradeModalOpen(true);
    else setUpgradeModalOpen(false);
  }, [masterclassAccess]);

  const [journeyProgressMap, setJourneyProgressMap] = useLocalStorageState<
    Record<string, TrainingJourneyProgress>
  >(StorageKeys.trainingProgress, {});

  const role = roleProfile?.targetRole?.trim() ?? "";
  const name = roleProfile?.name?.trim() ?? "";

  const progressForCourse = useCallback(
    (courseId: string): TrainingJourneyProgress | null =>
      journeyProgressMap[trainingProgressKey(role, courseId)] ?? null,
    [journeyProgressMap, role],
  );

  const courses = useMemo<TrainingCourse[]>(
    () => [
      {
        id: "interview-essentials",
        title: OPTION_INTERVIEW_ESSENTIALS_TITLE,
        subtitle: OPTION_INTERVIEW_ESSENTIALS_DESC,
        duration: "45 min",
        checkpoints: 5,
        chapters: [
          {
            title: "The estimation framework",
            summary: "How to structure any estimate in minutes.",
            duration: "8 min",
            imageUrl: CHAPTER_MEDIA[0],
          },
          {
            title: "Assumptions that sound credible",
            summary: "Pick realistic baselines + ranges.",
            duration: "7 min",
            imageUrl: CHAPTER_MEDIA[1],
          },
          {
            title: "Mental math shortcuts",
            summary: "Do clean math under pressure.",
            duration: "9 min",
            imageUrl: CHAPTER_MEDIA[2],
          },
          {
            title: "Communicating your reasoning",
            summary: "Make it easy for an interviewer to follow.",
            duration: "10 min",
            imageUrl: CHAPTER_MEDIA[3],
          },
          {
            title: "Practice set",
            summary: "5 example prompts with checkpoints.",
            duration: "11 min",
            imageUrl: CHAPTER_MEDIA[4],
          },
        ],
      },
      {
        id: "competency-pillars",
        title: OPTION_COMPETENCY_PILLARS_TITLE,
        subtitle: OPTION_COMPETENCY_PILLARS_DESC,
        duration: "2 hrs",
        checkpoints: 4,
        chapters: [
          {
            title: "Thinking",
            summary: "Clarity, structure, tradeoffs, and judgment.",
            duration: "28 min",
            imageUrl: CHAPTER_MEDIA[0],
          },
          {
            title: "Action",
            summary: "Execution, prioritization, and results.",
            duration: "30 min",
            imageUrl: CHAPTER_MEDIA[3],
          },
          {
            title: "People",
            summary: "Stakeholders, influence, and collaboration.",
            duration: "27 min",
            imageUrl: CHAPTER_MEDIA[4],
          },
          {
            title: "Mastery",
            summary: "Craft, depth, and continuous improvement.",
            duration: "35 min",
            imageUrl: CHAPTER_MEDIA[2],
          },
        ],
      },
    ],
    [],
  );

  const suggestedForYou = useMemo<SuggestedPillar[]>(
    () => [
      {
        id: "thinking",
        title: "Break the Problem",
        summary: "Break down complex problems into clear, structured steps.",
        badge: "Thinking",
        duration: "35 min",
        suggestion: "Interview question: Walk me through how you’d break down an ambiguous problem from scratch.",
        courseId: "competency-pillars",
        imageUrl: PILLAR_MEDIA.thinking,
      },
      {
        id: "action",
        title: "Make It Happen",
        summary: "Turn ideas into action and drive results that matter.",
        badge: "Action",
        duration: "50 min",
        suggestion: "Interview question: Tell me about a time you delivered results under tight constraints.",
        courseId: "competency-pillars",
        imageUrl: PILLAR_MEDIA.action,
      },
      {
        id: "people",
        title: "Bring People Along",
        summary: "Align stakeholders, manage resistance, and move things forward together.",
        badge: "People",
        duration: "40 min",
        suggestion: "Interview question: Describe a time you aligned stakeholders who disagreed. What did you do first?",
        courseId: "competency-pillars",
        imageUrl: PILLAR_MEDIA.people,
      },
    ],
    [],
  );

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const selectedCourse = courses.find((c) => c.id === selectedCourseId) ?? null;
  const [startedCourseId, setStartedCourseId] = useState<string | null>(null);
  const didHydrateResume = useRef(false);

  const reportTrainingPhase = useCallback(
    (phase: TrainingJourneyPhase) => {
      if (!selectedCourse || !role) return;
      const key = trainingProgressKey(role, selectedCourse.id);
      setJourneyProgressMap((prev) => ({
        ...prev,
        [key]: buildTrainingJourneyProgress({
          courseId: selectedCourse.id,
          courseTitle: selectedCourse.title,
          phase,
          roleKey: role,
        }),
      }));
    },
    [selectedCourse, setJourneyProgressMap, role],
  );

  useEffect(() => {
    if (didHydrateResume.current || !role) return;
    const incomplete = Object.values(journeyProgressMap)
      .filter((p) => (p.roleKey ?? "").trim() === role)
      .filter((p) => p.phase !== "complete" && p.percentComplete < 100)
      .filter((p) => courses.some((c) => c.id === p.courseId))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    const toResume = incomplete[0];
    if (!toResume) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resume in-progress course after localStorage loads
    setSelectedCourseId(toResume.courseId);
    setStartedCourseId(toResume.courseId);
    didHydrateResume.current = true;
  }, [journeyProgressMap, courses, role]);

  const journeyProgress = selectedCourse ? progressForCourse(selectedCourse.id) : null;
  const journeyInitialPhase: TrainingJourneyPhase | null = journeyProgress?.phase ?? null;

  if (!role) {
    return (
      <AppShell contentTopClassName={COACH_HUB_CONTENT_TOP_CLASS}>
        <CoachFloatingNav />
        <div className="pb-44">
          <Card>
            <CardHeader>
              <h3 className="text-h6">First, set a target role.</h3>
              <p className="mt-1 text-caption text-text-secondary">
                Training is personalized per role. Once you pick a role, I’ll generate modules and track your progress.
              </p>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Link href="/onboarding">
                <Button>Go to onboarding</Button>
              </Link>
              <Link href="/coach">
                <Button variant="outline">Back to Coach</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <CoachBottomChatBar />
      </AppShell>
    );
  }

  return (
    <AppShell contentTopClassName={COACH_HUB_CONTENT_TOP_CLASS}>
      <CoachFloatingNav />
      <div className="space-y-6 pb-44">
        <div className="mx-auto w-[800px] max-w-full">
          <div className="p-0">
            {!selectedCourse ? (
              <>
                <AgentPrompt
                  promptKey="training-module-pick"
                  prompt={entryIntro(name)}
                  ariaLabel="Training prompt"
                  headingClassName="text-agent-heading text-heading-teal"
                  subtextClassName="mt-3 text-agent-question text-text-primary"
                  mode="word"
                />
                <div className="mx-auto mt-6 w-[800px] max-w-full space-y-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {courses.map((course, courseIdx) => {
                      const progress = progressForCourse(course.id);
                      const pct = progress?.percentComplete ?? 0;
                      const isPrimary = courseIdx === 0;
                      const isImageBg = course.id === "competency-pillars";
                      const useLightType = isPrimary;
                      const variant = isPrimary ? "primary" : "gray";
                      const illustrationSrc = isPrimary
                        ? "/brand/illustration-1.svg"
                        : "/brand/illustration-4.svg";
                      const progressLabel = pct >= 1 ? "completed" : "Not started";
                      return (
                        <button
                          key={course.id}
                          type="button"
                          onClick={() => setSelectedCourseId(course.id)}
                          className={cn(
                            "group relative flex min-h-[168px] flex-col overflow-hidden rounded-2xl p-4 text-left backdrop-blur-xl transition sm:p-5",
                            "duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.985]",
                            "motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100",
                            "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                            isImageBg
                              ? [
                                  "bg-white",
                                  "shadow-[-4px_-4px_20px_rgba(14,154,181,0.08),inset_0_1px_0_rgba(255,255,255,0.72)]",
                                  "hover:shadow-[-4px_-4px_24px_rgba(14,154,181,0.12),inset_0_1px_0_rgba(255,255,255,0.8)]",
                                ]
                              : glassCardSurfaceClasses(variant),
                          )}
                        >
                          {isImageBg ? (
                            <>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src="/brand/competency-pillars-card-bg.png"
                                alt=""
                                className="pointer-events-none absolute inset-0 z-0 size-full scale-110 object-cover object-[center_55%] -translate-y-1"
                                aria-hidden
                              />
                              <div
                                className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-[72%] bg-[linear-gradient(90deg,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.55)_55%,transparent_100%)]"
                                aria-hidden
                              />
                            </>
                          ) : (
                            <GlassBlurSymbol src={illustrationSrc} variant={variant} />
                          )}

                          <div className="relative z-10 flex items-start justify-between gap-3">
                            <div
                              className={cn(
                                "min-w-0 pr-2",
                                useLightType && "[text-shadow:0_1px_2px_rgba(7,62,76,0.28)]",
                              )}
                            >
                              <div
                                className={cn(
                                  "text-[20px] leading-tight font-semibold tracking-tight",
                                  useLightType
                                    ? "text-primary-foreground"
                                    : "text-text-primary",
                                )}
                              >
                                {course.title}
                              </div>
                              <p
                                className={cn(
                                  "mt-1.5 max-w-[28ch] text-[13px] leading-snug",
                                  useLightType
                                    ? "text-primary-foreground/90"
                                    : "text-text-secondary",
                                )}
                              >
                                {course.subtitle}
                              </p>
                            </div>
                            <span
                              className={cn(
                                "grid size-8 shrink-0 place-items-center rounded-full backdrop-blur-sm",
                                useLightType
                                  ? "bg-white/20 text-primary-foreground"
                                  : "bg-white/70 text-primary shadow-sm",
                              )}
                              aria-hidden
                            >
                              <ArrowUpRight
                                className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                strokeWidth={2.25}
                              />
                            </span>
                          </div>

                          <div className="relative z-10 mt-auto pt-5">
                            <div className="flex items-end justify-between gap-3">
                              <div
                                className={cn(
                                  "text-[28px] leading-none font-semibold tracking-tight",
                                  useLightType
                                    ? "text-primary-foreground [text-shadow:0_1px_2px_rgba(7,62,76,0.28)]"
                                    : "text-heading-teal",
                                )}
                              >
                                {pct}%
                              </div>
                              <div
                                className={cn(
                                  "text-overline",
                                  useLightType
                                    ? "text-primary-foreground/90"
                                    : "text-text-secondary",
                                )}
                              >
                                {progressLabel}
                              </div>
                            </div>
                            <ProgressBar
                              value={pct}
                              className={cn(
                                "mt-2.5",
                                useLightType && "bg-white/25",
                              )}
                              indicatorClassName={
                                useLightType
                                  ? "border-white/40 bg-primary-foreground"
                                  : undefined
                              }
                              aria-label={`${course.title} progress`}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <section aria-label="Suggested for you">
                    <div className="text-caption font-semibold text-text-primary">
                      Suggested for you
                    </div>
                    <div className="mt-1 text-caption leading-5 text-text-secondary">
                      Based on your recent session, these will help you improve where it matters most.
                    </div>
                    <div className="mt-3 flex w-full flex-col gap-3">
                      {suggestedForYou.map((pill) => (
                        <button
                          key={pill.id}
                          type="button"
                          onClick={() => setSelectedCourseId(pill.courseId)}
                          className={cn(
                            "group relative flex w-full overflow-hidden rounded-2xl bg-white p-4 text-left backdrop-blur-xl transition",
                            "shadow-[0_8px_20px_rgba(14,154,181,0.08),inset_0_1px_0_rgba(255,255,255,0.72)]",
                            "hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(14,154,181,0.12),inset_0_1px_0_rgba(255,255,255,0.8)]",
                            "duration-200 ease-out active:scale-[0.985]",
                            "motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100",
                            "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                          )}
                        >
                          <GlassBlurSymbol
                            src="/brand/illustration-4.svg"
                            variant="gray"
                            className="-right-14 bottom-0 top-auto size-[7.5rem] translate-y-0 sm:-right-16 sm:size-[8.5rem]"
                          />

                          <div className="relative z-10 flex w-full items-center gap-4">
                            <PixelMedia
                              src={pill.imageUrl}
                              className="h-14 w-[4.5rem] shrink-0 rounded-md"
                            />
                            <div className="flex min-h-14 min-w-0 flex-1 flex-col justify-center gap-1.5">
                              <div className="flex min-w-0 items-center gap-2.5">
                                <div className="min-w-0 truncate text-[15px] font-semibold leading-tight tracking-tight text-text-primary">
                                  {pill.title}
                                </div>
                                <Badge className={SUCCESS_DRIVER_SYMBOL_CLASS}>
                                  <SuccessDriverIcon
                                    driver={pill.id}
                                    className="size-3.5!"
                                  />
                                  {pill.badge}
                                </Badge>
                              </div>
                              <p className="line-clamp-2 text-[12px] leading-tight text-text-secondary">
                                {pill.summary}
                              </p>
                            </div>
                            <div className="flex h-14 shrink-0 items-center gap-2.5">
                              <span className="text-caption text-text-secondary tabular-nums">
                                {pill.duration}
                              </span>
                              <ArrowRight
                                className="size-4 text-primary transition-transform duration-200 group-hover:translate-x-0.5"
                                strokeWidth={2.25}
                                aria-hidden
                              />
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
                </div>
              </>
            ) : startedCourseId === selectedCourse.id ? (
              <TrainingChapterOneJourney
                name={name}
                course={selectedCourse}
                initialPhase={journeyInitialPhase}
                onPhaseChange={reportTrainingPhase}
                onBackToOverview={() => setStartedCourseId(null)}
              />
            ) : (
              <>
                <div className="relative mx-auto mt-6 w-[800px] max-w-full">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCourseId(null)}
                    className="-ml-1 gap-1 px-2 text-caption font-semibold"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-4 w-4 shrink-0"
                      aria-hidden
                    >
                      <path
                        d="M15 18l-6-6 6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Back
                  </Button>
                  <h2 className="mt-4 text-left text-agent-heading text-heading-teal">
                    {COURSE_ENTRY_HEADING}
                  </h2>

                  {(() => {
                    const pct = journeyProgress?.percentComplete ?? 0;
                    const status =
                      pct >= 100 ? "Complete" : pct > 0 ? "In progress" : "Not started";
                    const ctaLabel = journeyProgress ? "Continue" : "Start course";
                    return (
                      <div
                        data-slot="card"
                        className={cn(
                          "relative mt-5 overflow-hidden rounded-[28px] bg-[#0c1f26] bg-cover bg-center bg-no-repeat text-white",
                          "shadow-[0_8px_20px_rgba(14,154,181,0.08),inset_0_1px_0_rgba(255,255,255,0.72)]",
                        )}
                        style={{ backgroundImage: "url(/brand/training-course-hero-bg.png)" }}
                      >
                        <div className="relative z-[1] px-6 pb-6 pt-7 sm:px-8 sm:pb-8 sm:pt-8">
                          <h3 className="max-w-[34rem] text-[26px] font-semibold leading-8 tracking-[-0.5px] text-white sm:text-[30px] sm:leading-9">
                            {selectedCourse.title}
                          </h3>
                          <p className="mt-2 max-w-[36rem] text-[15px] leading-6 text-white/80">
                            {selectedCourse.subtitle}
                          </p>

                          <div className="mt-4 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center rounded-md bg-white/10 px-2.5 py-1 text-[12px] font-medium text-white/95">
                              {selectedCourse.duration}
                            </span>
                            <span className="inline-flex items-center rounded-md bg-white/10 px-2.5 py-1 text-[12px] font-medium text-white/95">
                              {selectedCourse.checkpoints} touch points
                            </span>
                            <span className="inline-flex items-center rounded-md bg-white/10 px-2.5 py-1 text-[12px] font-medium text-white/95">
                              {selectedCourse.chapters.length} chapters
                            </span>
                          </div>

                          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                            <Button
                              type="button"
                              onClick={() => {
                                if (!selectedCourse) return;
                                const key = trainingProgressKey(role, selectedCourse.id);
                                setJourneyProgressMap((prev) => ({
                                  ...prev,
                                  [key]: buildTrainingJourneyProgress({
                                    courseId: selectedCourse.id,
                                    courseTitle: selectedCourse.title,
                                    phase: "video_intro",
                                    roleKey: role,
                                  }),
                                }));
                                setStartedCourseId(selectedCourse.id);
                              }}
                              className="h-10 shrink-0 gap-2 rounded-full bg-white px-5 text-[14px] font-semibold text-extended-cyan-green hover:bg-brand-1000 hover:text-extended-cyan-green"
                            >
                              <ArrowRight className="size-4" aria-hidden />
                              {ctaLabel}
                            </Button>
                            <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
                              <ProgressBar
                                value={pct}
                                className="h-1 min-w-0 bg-white/20"
                                indicatorClassName="h-1 border-0 bg-brand-400"
                                aria-label="Course progress"
                              />
                              <p className="text-[11px] leading-none text-brand-700">
                                <span className="font-semibold text-white">{pct}%</span>
                                <span className="ml-1.5">{status}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="mt-8">
                    <div className="text-overline text-text-secondary">
                      CHAPTERS
                    </div>
                    <div className="mt-3 flex w-full flex-col gap-3">
                      {selectedCourse.chapters.map((ch, idx) => (
                        <div
                          key={`${selectedCourse.id}-ch-${idx}`}
                          data-slot="card"
                          className={cn(
                            "group relative flex w-full overflow-hidden rounded-2xl bg-white p-4 text-left backdrop-blur-xl transition",
                            "shadow-[0_8px_20px_rgba(14,154,181,0.08),inset_0_1px_0_rgba(255,255,255,0.72)]",
                            "hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(14,154,181,0.12),inset_0_1px_0_rgba(255,255,255,0.8)]",
                            "duration-200 ease-out",
                            "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                          )}
                        >
                          <div className="relative z-10 flex w-full items-center gap-4">
                            <PixelMedia
                              src={ch.imageUrl}
                              className="h-14 w-[4.5rem] shrink-0 rounded-md"
                            />
                            <div className="flex min-h-14 min-w-0 flex-1 flex-col justify-center gap-1.5">
                              <div className="min-w-0 truncate text-[15px] font-semibold leading-tight tracking-tight text-text-primary">
                                {idx + 1}. {ch.title}
                              </div>
                              <p className="line-clamp-2 text-[12px] leading-tight text-text-secondary">
                                {ch.summary}
                              </p>
                            </div>
                            <span className="flex h-14 shrink-0 items-center text-caption text-text-secondary tabular-nums">
                              {ch.duration}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <CoachBottomChatBar />
      <GenericUpgradeModal open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen} />
    </AppShell>
  );
}

