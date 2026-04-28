"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { Card, CardBody } from "@/components/Card";
import { AgentPrompt } from "@/components/agents/AgentPrompt";
import { CoachBottomChatBar } from "@/components/CoachBottomChatBar";
import { CoachFloatingNav } from "@/components/CoachFloatingNav";
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
import { buildTrainingJourneyProgress } from "@/lib/trainingJourneyProgress";
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
  const [journeyProgress, setJourneyProgress] = useLocalStorageState<TrainingJourneyProgress | null>(
    StorageKeys.trainingProgress,
    null,
  );

  const role = roleProfile?.targetRole?.trim() ?? "";
  const name = roleProfile?.name?.trim() ?? "";
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
        suggestion: "Interview question: Describe a time you aligned stakeholders who disagreed—what did you do first?",
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
      setJourneyProgress(
        buildTrainingJourneyProgress({
          courseId: selectedCourse.id,
          courseTitle: selectedCourse.title,
          phase,
          roleKey: role,
        }),
      );
    },
    [selectedCourse, setJourneyProgress, role],
  );

  useEffect(() => {
    if (didHydrateResume.current || !journeyProgress) return;
    if (journeyProgress.roleKey && journeyProgress.roleKey !== role) return;
    if (journeyProgress.percentComplete >= 100) return;
    if (journeyProgress.phase === "complete") return;
    if (!courses.some((c) => c.id === journeyProgress.courseId)) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resume in-progress course after localStorage loads
    setSelectedCourseId(journeyProgress.courseId);
    setStartedCourseId(journeyProgress.courseId);
    didHydrateResume.current = true;
  }, [journeyProgress, courses, role]);

  const journeyInitialPhase: TrainingJourneyPhase | null =
    selectedCourse &&
    journeyProgress?.courseId === selectedCourse.id &&
    (!journeyProgress.roleKey || journeyProgress.roleKey === role)
      ? journeyProgress.phase
      : null;

  if (!role) {
    return (
      <AppShell>
        <CoachFloatingNav />
        <div className="pb-44">
          <Card>
            <CardBody>
              <h2 className="text-4xl font-extrabold tracking-tight">First, set a target role.</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--app-muted)]">
                Training is personalized per role. Once you pick a role, I’ll generate modules and track your progress.
              </p>
              <div className="mt-6 flex gap-2">
                <Link href="/onboarding">
                  <Button>Go to onboarding</Button>
                </Link>
                <Link href="/coach?journey=1">
                  <Button variant="secondary">Back to Coach</Button>
                </Link>
              </div>
            </CardBody>
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
        <div className="px-6">
          <div className="p-0">
            {!selectedCourse ? (
              <>
                <AgentPrompt
                  promptKey="training-module-pick"
                  prompt={entryIntro(name)}
                  ariaLabel="Training prompt"
                />
                <div className="mx-auto mt-6 flex w-full max-w-3xl flex-col gap-4">
                  {courses.map((course) => (
                    <div key={course.id} className="flex flex-col gap-4">
                      <button
                        type="button"
                        onClick={() => setSelectedCourseId(course.id)}
                        className="rounded-[22px] border border-white/50 bg-white px-5 py-5 text-left shadow-[0_12px_30px_rgba(0,0,0,0.08)] transition hover:bg-white/70"
                      >
                        <div className="text-lg font-extrabold tracking-tight">{course.title}</div>
                        <div className="mt-2 text-sm leading-6 text-[var(--app-muted)]">
                          {course.subtitle}
                        </div>
                      </button>

                      {course.id === "competency-pillars" ? (
                        <section aria-label="Suggested for you" className="px-1">
                          <div className="text-sm font-extrabold tracking-tight text-gray-900">
                            Suggested for you
                          </div>
                          <div className="mt-1 text-xs leading-5 text-[var(--app-muted)]">
                            Based on your recent session, these will help you improve where it matters most.
                          </div>
                          <div className="mt-3 flex flex-col gap-3">
                            {suggestedForYou.map((pill) => (
                              <button
                                key={pill.id}
                                type="button"
                                onClick={() => setSelectedCourseId(pill.courseId)}
                                className="group w-full rounded-2xl border border-white/50 bg-white px-4 py-4 text-left shadow-[0_12px_30px_rgba(0,0,0,0.06)] transition hover:bg-white/70"
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
                                    <div className="absolute bottom-2 left-2 inline-flex items-center rounded-lg bg-white/80 px-2 py-1 text-[10px] font-extrabold tracking-tight text-gray-900">
                                      {pill.duration}
                                    </div>
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <div className="text-sm font-extrabold tracking-tight">{pill.title}</div>
                                      <span className="inline-flex items-center rounded-full border border-white/70 bg-white px-2.5 py-1 text-[11px] font-semibold tracking-tight text-gray-800 shadow-[0_4px_14px_rgba(0,0,0,0.06)]">
                                        {pill.badge}
                                      </span>
                                    </div>
                                    <div className="mt-1 text-xs leading-5 text-[var(--app-muted)]">
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
                  ))}
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
                <div className="relative mx-auto mt-6 w-full max-w-3xl">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setSelectedCourseId(null)}
                    className="-ml-1 !h-9 inline-flex items-center gap-1 !px-2 !text-sm font-bold"
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
                  <h2 className="mt-4 text-left text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
                    {COURSE_ENTRY_HEADING}
                  </h2>
                  <div className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
                    {selectedCourse.title}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--app-muted)]">{selectedCourse.subtitle}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full border border-white/70 bg-white px-3 py-1 text-xs font-semibold tracking-tight text-gray-800 shadow-[0_4px_14px_rgba(0,0,0,0.06)]">
                      {selectedCourse.duration}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-white/70 bg-white px-3 py-1 text-xs font-semibold tracking-tight text-gray-800 shadow-[0_4px_14px_rgba(0,0,0,0.06)]">
                      {selectedCourse.checkpoints} touch points
                    </span>
                    <span className="inline-flex items-center rounded-full border border-white/70 bg-white px-3 py-1 text-xs font-semibold tracking-tight text-gray-800 shadow-[0_4px_14px_rgba(0,0,0,0.06)]">
                      {selectedCourse.chapters.length} chapters
                    </span>
                  </div>

                  <div className="mt-8">
                    <div className="text-xs font-semibold tracking-[0.18em] text-[var(--app-muted)]">
                      CHAPTERS
                    </div>
                    <div className="mt-3 flex w-full flex-col gap-3">
                      {selectedCourse.chapters.map((ch, idx) => (
                        <div
                          key={`${selectedCourse.id}-ch-${idx}`}
                          className="w-full rounded-2xl border border-white/50 bg-white px-5 py-4 shadow-[0_12px_30px_rgba(0,0,0,0.06)]"
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className="relative h-14 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100"
                              style={{
                                backgroundImage: `url("${ch.imageUrl}")`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                              }}
                              aria-hidden
                            >
                              <div className="absolute inset-0 bg-black/10" />
                              <div className="absolute bottom-1.5 left-1.5 inline-flex items-center rounded-lg bg-white/80 px-2 py-1 text-[10px] font-extrabold tracking-tight text-gray-900">
                                {ch.duration}
                              </div>
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-extrabold tracking-tight">
                                {idx + 1}. {ch.title}
                              </div>
                              <div className="mt-1 text-xs leading-5 text-[var(--app-muted)]">{ch.summary}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mx-auto mt-6 w-full max-w-3xl">
                  <Button
                    onClick={() => {
                      if (!selectedCourse) return;
                      setJourneyProgress(
                        buildTrainingJourneyProgress({
                          courseId: selectedCourse.id,
                          courseTitle: selectedCourse.title,
                          phase: "video_intro",
                          roleKey: role,
                        }),
                      );
                      setStartedCourseId(selectedCourse.id);
                    }}
                    className="w-full sm:w-auto"
                  >
                    Start course
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

