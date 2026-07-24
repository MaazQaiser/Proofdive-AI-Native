"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { AgentPrompt } from "@/components/agents/AgentPrompt";
import { CoachBottomChatBar } from "@/components/CoachBottomChatBar";
import { CoachFloatingNav } from "@/components/CoachFloatingNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { TrainingChapterOneJourney } from "@/app/training/ui/TrainingChapterOneJourney";
import {
  COURSE_ENTRY_HEADING,
  OPTION_COMPETENCY_PILLARS_DESC,
  OPTION_COMPETENCY_PILLARS_TITLE,
  OPTION_INTERVIEW_ESSENTIALS_DESC,
  OPTION_INTERVIEW_ESSENTIALS_TITLE,
  entryIntro,
} from "@/app/training/trainingCopy";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import { buildTrainingJourneyProgress, trainingProgressKey } from "@/lib/trainingJourneyProgress";
import type { RoleProfile, TrainingJourneyProgress, TrainingJourneyPhase } from "@/lib/proofdiveTypes";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

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
  accent: { from: string; to: string };
  courseId: "competency-pillars";
};

const PILLAR_UNSPLASH: Record<SuggestedPillar["id"], string> = {
  thinking: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=240&h=192&q=80",
  action: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=240&h=192&q=80",
  people: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=240&h=192&q=80",
};

export function TrainingScreen() {
  const [roleProfile] = useLocalStorageState<RoleProfile | null>(
    StorageKeys.roleProfile,
    null,
  );
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
            imageUrl:
              "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=240&h=192&q=80",
          },
          {
            title: "Assumptions that sound credible",
            summary: "Pick realistic baselines + ranges.",
            duration: "7 min",
            imageUrl:
              "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=240&h=192&q=80",
          },
          {
            title: "Mental math shortcuts",
            summary: "Do clean math under pressure.",
            duration: "9 min",
            imageUrl:
              "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=240&h=192&q=80",
          },
          {
            title: "Communicating your reasoning",
            summary: "Make it easy for an interviewer to follow.",
            duration: "10 min",
            imageUrl:
              "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=240&h=192&q=80",
          },
          {
            title: "Practice set",
            summary: "5 example prompts with checkpoints.",
            duration: "11 min",
            imageUrl:
              "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=240&h=192&q=80",
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
            imageUrl:
              "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=240&h=192&q=80",
          },
          {
            title: "Action",
            summary: "Execution, prioritization, and results.",
            duration: "30 min",
            imageUrl:
              "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=240&h=192&q=80",
          },
          {
            title: "People",
            summary: "Stakeholders, influence, and collaboration.",
            duration: "27 min",
            imageUrl:
              "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=240&h=192&q=80",
          },
          {
            title: "Mastery",
            summary: "Craft, depth, and continuous improvement.",
            duration: "35 min",
            imageUrl:
              "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=240&h=192&q=80",
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
        accent: { from: "#7C3AED", to: "#60A5FA" },
        courseId: "competency-pillars",
      },
      {
        id: "action",
        title: "Make It Happen",
        summary: "Turn ideas into action and drive results that matter.",
        badge: "Action",
        duration: "50 min",
        suggestion: "Interview question: Tell me about a time you delivered results under tight constraints.",
        accent: { from: "#F97316", to: "#FDE047" },
        courseId: "competency-pillars",
      },
      {
        id: "people",
        title: "Bring People Along",
        summary: "Align stakeholders, manage resistance, and move things forward together.",
        badge: "People",
        duration: "40 min",
        suggestion: "Interview question: Describe a time you aligned stakeholders who disagreed. What did you do first?",
        accent: { from: "#10B981", to: "#22D3EE" },
        courseId: "competency-pillars",
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
                  subtextClassName="mt-16 text-agent-question text-text-primary"
                  mode="word"
                />
                <div className="mx-auto mt-6 w-[800px] max-w-full space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    {courses.map((course) => {
                      const progress = progressForCourse(course.id);
                      const pct = progress?.percentComplete ?? 0;
                      return (
                        <button
                          key={course.id}
                          type="button"
                          onClick={() => setSelectedCourseId(course.id)}
                          className="rounded-xl border border-border bg-card px-5 py-5 text-left transition hover:bg-muted"
                        >
                          <div className="text-h6">{course.title}</div>
                          <div className="mt-2 text-caption leading-6 text-text-secondary">
                            {course.subtitle}
                          </div>
                          <div className="mt-4">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-overline text-text-secondary">
                                {pct >= 100 ? "Complete" : pct > 0 ? "In progress" : "Not started"}
                              </span>
                              <span className="text-overline text-text-secondary">{pct}%</span>
                            </div>
                            <ProgressBar
                              value={pct}
                              className="mt-1.5"
                              aria-label={`${course.title} progress`}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {true ? (
                        <section aria-label="Suggested for you" className="px-1">
                          <div className="text-caption font-semibold text-text-primary">
                            Suggested for you
                          </div>
                          <div className="mt-1 text-caption leading-5 text-text-secondary">
                            Based on your recent session, these will help you improve where it matters most.
                          </div>
                          <div className="mt-3 flex flex-col gap-3">
                            {suggestedForYou.map((pill) => (
                              <button
                                key={pill.id}
                                type="button"
                                onClick={() => setSelectedCourseId(pill.courseId)}
                                className="group w-full rounded-xl border border-border bg-card px-4 py-4 text-left transition hover:bg-muted"
                              >
                                <div className="flex items-start gap-4">
                                  <div
                                    className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl"
                                    style={{
                                      backgroundImage: `url("${PILLAR_UNSPLASH[pill.id]}")`,
                                      backgroundSize: "cover",
                                      backgroundPosition: "center",
                                    }}
                                    aria-hidden
                                  >
                                    <div className="absolute inset-0 bg-black/10" />
                                    <div className="absolute bottom-2 left-2 inline-flex items-center rounded-lg bg-white/80 px-2 py-1 text-overline text-text-primary">
                                      {pill.duration}
                                    </div>
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <div className="text-caption font-semibold">{pill.title}</div>
                                      <Badge variant="outline" className="border-border">
                                        {pill.badge}
                                      </Badge>
                                    </div>
                                    <div className="mt-1 text-caption leading-5 text-text-secondary">
                                      {pill.summary}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </section>
                  ) : null}
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
                      <div className="mt-5 max-w-md">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-overline text-text-secondary">
                            {pct >= 100 ? "Complete" : pct > 0 ? "In progress" : "Not started"}
                          </span>
                          <span className="text-overline text-text-secondary">{pct}%</span>
                        </div>
                        <ProgressBar value={pct} className="mt-1.5" aria-label="Course progress" />
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
                          className="w-full rounded-xl border border-border bg-card px-5 py-4"
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className="relative h-14 w-16 shrink-0 overflow-hidden rounded-xl bg-muted"
                              style={{
                                backgroundImage: `url("${ch.imageUrl}")`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                              }}
                              aria-hidden
                            >
                              <div className="absolute inset-0 bg-black/10" />
                              <div className="absolute bottom-1.5 left-1.5 inline-flex items-center rounded-lg bg-white/80 px-2 py-1 text-overline text-text-primary">
                                {ch.duration}
                              </div>
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="text-caption font-semibold">
                                {idx + 1}. {ch.title}
                              </div>
                              <div className="mt-1 text-caption leading-5 text-text-secondary">{ch.summary}</div>
                            </div>
                          </div>
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
    </AppShell>
  );
}

