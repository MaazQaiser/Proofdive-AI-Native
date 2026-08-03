"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { AgentPrompt } from "@/components/agents/AgentPrompt";
import { CoachBottomChatBar } from "@/components/CoachBottomChatBar";
import { CoachFloatingNav } from "@/components/CoachFloatingNav";
import { GenericUpgradeModal } from "@/components/GenericUpgradeModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
  GlassBlurSymbol,
  glassCardSurfaceClasses,
} from "@/components/ui/glass-blur-symbol";
import { MediaListItem } from "@/components/ui/media-list-item";
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
import { isFreePlan } from "@/lib/candidateUsage";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import { buildTrainingJourneyProgress, trainingProgressKey } from "@/lib/trainingJourneyProgress";
import type { RoleProfile, TrainingJourneyProgress, TrainingJourneyPhase } from "@/lib/proofdiveTypes";
import { useLocalStorageState } from "@/lib/useLocalStorageState";
import { useCandidateSubscription } from "@/lib/useSubscriberPayments";
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
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const freePlan = isFreePlan(subscription);

  useEffect(() => {
    if (freePlan) setUpgradeModalOpen(true);
    else setUpgradeModalOpen(false);
  }, [freePlan]);

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
      <AppShell>
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
              <Link href="/coach?journey=1">
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
    <AppShell>
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
                  subtextClassName="mt-8 text-agent-question text-text-primary"
                  mode="word"
                />
                <div className="mx-auto mt-6 w-[800px] max-w-full space-y-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {courses.map((course, courseIdx) => {
                      const progress = progressForCourse(course.id);
                      const pct = progress?.percentComplete ?? 0;
                      const isPrimary = courseIdx === 0;
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
                            glassCardSurfaceClasses(variant),
                          )}
                        >
                          <GlassBlurSymbol src={illustrationSrc} variant={variant} />

                          <div className="relative z-10 flex items-start justify-between gap-3">
                            <div
                              className={cn(
                                "min-w-0 pr-2",
                                isPrimary && "[text-shadow:0_1px_2px_rgba(7,62,76,0.28)]",
                              )}
                            >
                              <div
                                className={cn(
                                  "text-[20px] leading-tight font-semibold tracking-tight",
                                  isPrimary
                                    ? "text-primary-foreground"
                                    : "text-text-primary",
                                )}
                              >
                                {course.title}
                              </div>
                              <p
                                className={cn(
                                  "mt-1.5 max-w-[28ch] text-[13px] leading-snug",
                                  isPrimary
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
                                isPrimary
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
                                  isPrimary
                                    ? "text-primary-foreground [text-shadow:0_1px_2px_rgba(7,62,76,0.28)]"
                                    : "text-heading-teal",
                                )}
                              >
                                {pct}%
                              </div>
                              <div
                                className={cn(
                                  "text-overline",
                                  isPrimary
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
                                isPrimary && "bg-white/25",
                              )}
                              indicatorClassName={
                                isPrimary
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
                            "group relative flex w-full overflow-hidden rounded-2xl bg-white p-3 text-left backdrop-blur-xl transition",
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

                          <div className="relative z-10 flex w-full items-center gap-3">
                            <PixelMedia
                              src={pill.imageUrl}
                              className="h-14 w-[4.5rem] shrink-0 rounded-md"
                            />
                            <div className="flex h-14 min-w-0 flex-1 flex-col justify-center gap-0.5">
                              <div className="flex min-w-0 items-center gap-2">
                                <div className="min-w-0 truncate text-[15px] font-semibold leading-tight tracking-tight text-text-primary">
                                  {pill.title}
                                </div>
                                <span
                                  className={cn(
                                    "inline-flex shrink-0 items-center gap-1 rounded-full bg-white/70 px-2 py-0.5 text-overline font-medium",
                                    SUCCESS_DRIVER_SYMBOL_CLASS,
                                  )}
                                >
                                  <SuccessDriverIcon
                                    driver={pill.id}
                                    className="size-3.5"
                                  />
                                  {pill.badge}
                                </span>
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
                  <h2 className="text-h4 mt-4 text-left">
                    {COURSE_ENTRY_HEADING}
                  </h2>
                  <div className="text-h5 mt-4">
                    {selectedCourse.title}
                  </div>
                  <p className="mt-2 text-caption leading-6 text-text-secondary">{selectedCourse.subtitle}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="border-border">
                      {selectedCourse.duration}
                    </Badge>
                    <Badge variant="outline" className="border-border">
                      {selectedCourse.checkpoints} touch points
                    </Badge>
                    <Badge variant="outline" className="border-border">
                      {selectedCourse.chapters.length} chapters
                    </Badge>
                  </div>

                  {(() => {
                    const pct = journeyProgress?.percentComplete ?? 0;
                    return (
                      <div className="mt-5 max-w-md rounded-[20px] border border-brand-800 bg-brand-1000/80 p-4">
                        <div className="flex items-end justify-between gap-3">
                          <div className="text-overline text-text-secondary">
                            {pct >= 100 ? "Complete" : pct > 0 ? "In progress" : "Not started"}
                          </div>
                          <div className="text-[32px] leading-none font-semibold text-heading-teal">
                            {pct}%
                          </div>
                        </div>
                        <ProgressBar
                          value={pct}
                          className="mt-3"
                          aria-label="Course progress"
                        />
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
                          className={cn(
                            "w-full overflow-hidden rounded-[20px] border px-4 py-4",
                            idx % 2 === 0
                              ? "border-brand-800 bg-[linear-gradient(90deg,var(--brand-1000),#fff_48%)]"
                              : "border-border bg-white",
                          )}
                        >
                          <MediaListItem
                            imageUrl={ch.imageUrl}
                            title={`${idx + 1}. ${ch.title}`}
                            summary={ch.summary}
                            duration={ch.duration}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mx-auto mt-6 w-[800px] max-w-full">
                  <Button
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
                    className="w-full sm:w-auto"
                  >
                    {journeyProgress ? "Continue" : "Start course"}
                  </Button>
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

