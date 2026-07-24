"use client";

import { useRouter } from "next/navigation";
import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react";

import { Button } from "@/components/Button";
import { Card, CardBody, NestedCard } from "@/components/Card";
import { cn } from "@/components/cn";
import {
  AFTER_CASE,
  AFTER_QUIZ,
  AFTER_VIDEO,
  CTA_CONTINUE_CH2,
  CTA_PLAY_VIDEO,
  CTA_START_ASSESSMENT,
  CTA_START_CASE,
  CTA_START_QUIZ,
  CTA_TAKE_A_BREAK,
  CASE_INTRO,
  CH1_VIDEO_INTRO,
  chapterComplete,
  FINAL_ASSESSMENT,
} from "@/app/training/trainingCopy";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import { parseTrainingJourneyPhase, percentForTrainingPhase } from "@/lib/trainingJourneyProgress";
import type { TrainingJourneyPhase } from "@/lib/proofdiveTypes";

type CourseLite = {
  id: string;
  title: string;
  chapters: Array<{ title: string; summary: string }>;
};

const QUIZ = [
  {
    q: "What should you lock in first when giving an estimate?",
    options: [
      "A final number",
      "Structure and assumptions",
      "The interviewer’s mood",
      "Speed only",
    ],
    correct: 1,
  },
  {
    q: "Why do ranges and baselines matter in interview estimates?",
    options: [
      "They replace all math",
      "They show judgment and credibility",
      "They guarantee accuracy",
      "They shorten the answer to one word",
    ],
    correct: 1,
  },
  {
    q: "What is a good goal for communicating your estimate?",
    options: [
      "Sound as technical as possible",
      "Make reasoning easy to follow",
      "Avoid tradeoffs",
      "Finish in under 10 seconds always",
    ],
    correct: 1,
  },
] as const;

function countWords(s: string) {
  const t = s.trim();
  if (!t) return 0;
  return t.split(/\s+/).length;
}

/** Segment between step `leftIdx` and `leftIdx + 1` is complete (filled line). */
function segmentCompleteBetween(leftIdx: number, phase: TrainingJourneyPhase): boolean {
  if (leftIdx === 0) {
    return (
      phase === "post_video" ||
      phase === "quiz" ||
      phase === "after_quiz" ||
      phase === "case" ||
      phase === "after_case" ||
      phase === "assessment" ||
      phase === "complete"
    );
  }
  if (leftIdx === 1) {
    return (
      phase === "after_quiz" ||
      phase === "case" ||
      phase === "after_case" ||
      phase === "assessment" ||
      phase === "complete"
    );
  }
  if (leftIdx === 2) {
    return phase === "after_case" || phase === "assessment" || phase === "complete";
  }
  return false;
}

function CoachBlock({ children }: { children: ReactNode }) {
  return (
    <div className="whitespace-pre-wrap text-body font-semibold leading-7 text-[var(--app-fg)]/90">
      {children}
    </div>
  );
}

export function TrainingChapterOneJourney({
  name,
  course,
  initialPhase,
  onPhaseChange,
  onBackToOverview,
}: {
  name: string;
  course: CourseLite;
  initialPhase?: TrainingJourneyPhase | null;
  onPhaseChange?: (phase: TrainingJourneyPhase) => void;
  onBackToOverview: () => void;
}) {
  const router = useRouter();
  const chapterTitle = course.chapters[0]?.title ?? "Chapter 1";
  const chapterSummary = course.chapters[0]?.summary ?? "";

  const [phase, setPhase] = useState<TrainingJourneyPhase>(() =>
    parseTrainingJourneyPhase(initialPhase),
  );

  useEffect(() => {
    if (initialPhase == null) return;
    const nextPhase = parseTrainingJourneyPhase(initialPhase);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- controlled sync with persisted phase prop
    setPhase((prev) => (prev === nextPhase ? prev : nextPhase));
  }, [initialPhase]);

  useEffect(() => {
    onPhaseChange?.(phase);
  }, [phase, onPhaseChange]);
  const [videoStarted, setVideoStarted] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [assessmentText, setAssessmentText] = useState("");
  const [chapter2Placeholder, setChapter2Placeholder] = useState(false);

  const wordCount = useMemo(() => countWords(assessmentText), [assessmentText]);
  const overWordLimit = wordCount > 600;

  const quizScore = useMemo(() => {
    if (!quizSubmitted) return null;
    let ok = 0;
    QUIZ.forEach((item, i) => {
      if (quizAnswers[i] === item.correct) ok += 1;
    });
    return ok;
  }, [quizAnswers, quizSubmitted]);

  const showTimeline = phase !== "complete" && !chapter2Placeholder;

  const timelineSteps = useMemo(() => {
    const steps = [
      { id: "v" as const, label: "Video" },
      { id: "q" as const, label: "Quiz" },
      { id: "c" as const, label: "Case" },
      { id: "a" as const, label: "Final assessment" },
    ];
    const atVideo = phase === "video_intro" || phase === "video" || phase === "post_video";
    const atQuiz = phase === "quiz" || phase === "after_quiz";
    const atCase = phase === "case" || phase === "after_case";
    const atAssess = phase === "assessment";

    return steps.map((step, idx) => {
      const active =
        (idx === 0 && atVideo) ||
        (idx === 1 && atQuiz) ||
        (idx === 2 && atCase) ||
        (idx === 3 && atAssess);
      const done =
        (idx === 0 && (phase === "post_video" || atQuiz || atCase || atAssess)) ||
        (idx === 1 && (phase === "after_quiz" || atCase || atAssess)) ||
        (idx === 2 && (phase === "after_case" || atAssess)) ||
        false;
      return { ...step, idx, active, done };
    });
  }, [phase]);

  return (
    <div className="mx-auto mt-6 w-full max-w-[672px]">
      <div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackToOverview}
            aria-label="Back to course overview"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--app-muted)] transition hover:bg-[var(--app-hairline)] hover:text-[var(--app-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]/30"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <p className="text-overline text-[var(--app-muted)]">
            CHAPTER 1
          </p>
        </div>
        <h2 className="text-h5 mt-1">
          {chapterTitle}
        </h2>
        <p className="mt-1 max-w-2xl text-caption leading-6 text-[var(--app-muted)]">
          {chapterSummary}
        </p>
      </div>

      {chapter2Placeholder ? (
        <Card className="mt-8">
          <CardBody className="p-6">
            <p className="text-caption font-semibold leading-6 text-[var(--app-muted)]">
              Chapter 2 is coming soon.
            </p>
            <div className="mt-4">
              <Button type="button" variant="secondary" onClick={() => setChapter2Placeholder(false)}>
                Back
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="mt-8 flex flex-col gap-6">
          <div className="min-w-0 w-full space-y-6">
            {showTimeline ? (
              <Card>
                <CardBody className="p-4">
                  <div className="mb-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-overline text-[var(--app-muted)]">Module progress</span>
                      <span className="text-overline text-[var(--app-muted)]">
                        {percentForTrainingPhase(phase)}%
                      </span>
                    </div>
                    <div
                      className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--app-hairline)]"
                      role="progressbar"
                      aria-valuenow={percentForTrainingPhase(phase)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label="Module progress"
                    >
                      <div
                        className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
                        style={{ width: `${percentForTrainingPhase(phase)}%` }}
                      />
                    </div>
                  </div>
                  <div
                    className="flex w-full flex-wrap items-start justify-center gap-y-3 sm:flex-nowrap"
                    aria-label="Chapter progress"
                  >
                    {timelineSteps.map(({ id, label, idx, active, done }) => (
                      <Fragment key={id}>
                        {idx > 0 ? (
                          <div
                            aria-hidden
                            className={cn(
                              "mx-0.5 mt-[18px] hidden h-0.5 min-w-[10px] flex-1 rounded-full sm:block",
                              segmentCompleteBetween(idx - 1, phase)
                                ? "bg-primary"
                                : "bg-[var(--app-hairline)]",
                            )}
                          />
                        ) : null}
                        <div
                          className="flex w-[46%] min-w-[5.5rem] max-w-[10rem] shrink-0 flex-col items-center sm:w-auto sm:min-w-[4.75rem] sm:max-w-[7.5rem] sm:flex-1"
                          aria-current={active ? "step" : undefined}
                        >
                          <div
                            className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-caption font-semibold transition",
                              done
                                ? "border-primary bg-primary text-primary-foreground"
                                : active
                                  ? "border-primary bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2 ring-offset-[var(--app-surface)]"
                                  : "border-[var(--app-hairline)] bg-white text-[var(--app-muted)]",
                            )}
                          >
                            {idx + 1}
                          </div>
                          <p
                            className={cn(
                              "mt-2 w-full px-0.5 text-center text-overline leading-snug",
                              active || done ? "text-[var(--app-fg)]" : "text-[var(--app-muted)]",
                            )}
                          >
                            {label}
                          </p>
                        </div>
                      </Fragment>
                    ))}
                  </div>
                </CardBody>
              </Card>
            ) : null}

            <div className="w-full min-w-0 space-y-6">
                {phase === "video_intro" ? (
                  <div className="space-y-6">
                    <CoachBlock>{CH1_VIDEO_INTRO}</CoachBlock>
                    <div>
                      <Button type="button" onClick={() => { setVideoStarted(true); setPhase("video"); }}>
                        {CTA_PLAY_VIDEO}
                      </Button>
                    </div>
                  </div>
                ) : null}

                {phase === "video" ? (
                  <Card>
                    <CardBody className="p-5 sm:p-6">
                      <div className="aspect-video w-full overflow-hidden rounded-2xl bg-[var(--app-surface-nested)]">
                        <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => setVideoStarted(true)}
                            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]/40"
                            aria-label="Play video"
                          >
                            <svg
                              className="ml-1 h-7 w-7"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              aria-hidden
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </button>
                          <span className="text-overline uppercase text-[var(--app-muted)]">
                            Video
                          </span>
                          <p className="text-caption font-semibold text-[var(--app-muted)]">
                            Lesson player placeholder
                          </p>
                          <p className="max-w-sm text-caption leading-5 text-[var(--app-muted)]">
                            Replace with your hosted lesson (embed URL, Mux, or Vimeo).
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => {
                            setVideoStarted(true);
                            setPhase("post_video");
                          }}
                        >
                          Mark video as watched
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                ) : null}

                {phase === "post_video" ? (
                  <div className="space-y-6">
                    <CoachBlock>{AFTER_VIDEO}</CoachBlock>
                    <div>
                      <Button
                        type="button"
                        onClick={() => setPhase("quiz")}
                        disabled={!videoStarted}
                      >
                        {CTA_START_QUIZ}
                      </Button>
                    </div>
                  </div>
                ) : null}

                {phase === "quiz" ? (
                  <Card>
                    <CardBody className="p-5 sm:p-6">
                    <h3 className="text-h6">Quick quiz (3 questions)</h3>
                    <div className="mt-5 space-y-6">
                      {QUIZ.map((item, qi) => (
                        <fieldset
                          key={qi}
                          className="rounded-[20px] border border-[var(--app-hairline)] bg-[var(--app-surface-nested)] p-4"
                        >
                          <legend className="text-body-sm font-semibold text-[var(--app-fg)]">
                            {qi + 1}. {item.q}
                          </legend>
                          <div className="mt-3 space-y-2">
                            {item.options.map((opt, oi) => {
                              const selected = quizAnswers[qi] === oi;
                              return (
                                <label
                                  key={opt}
                                  className={cn(
                                    "flex cursor-pointer items-start gap-2 rounded-2xl border px-3 py-2 text-caption transition",
                                    selected
                                      ? "border-[var(--app-fg)] bg-white"
                                      : "border-transparent bg-white/60 hover:bg-white",
                                  )}
                                >
                                  <input
                                    type="radio"
                                    className="mt-1"
                                    name={`quiz-q-${qi}`}
                                    checked={selected}
                                    onChange={() =>
                                      setQuizAnswers((prev) => ({
                                        ...prev,
                                        [qi]: oi,
                                      }))
                                    }
                                  />
                                  <span>{opt}</span>
                                </label>
                              );
                            })}
                          </div>
                        </fieldset>
                      ))}
                    </div>
                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        onClick={() => {
                          setQuizSubmitted(true);
                          setPhase("after_quiz");
                        }}
                        disabled={Object.keys(quizAnswers).length < QUIZ.length}
                      >
                        Submit quiz
                      </Button>
                      {quizSubmitted && quizScore !== null ? (
                        <span className="self-center text-caption font-semibold text-[var(--app-muted)]">
                          Score: {quizScore}/{QUIZ.length}
                        </span>
                      ) : null}
                    </div>
                    </CardBody>
                  </Card>
                ) : null}

                {phase === "after_quiz" ? (
                  <div className="space-y-6">
                    <CoachBlock>{AFTER_QUIZ}</CoachBlock>
                    <CoachBlock>{CASE_INTRO}</CoachBlock>
                    {quizSubmitted && quizScore !== null ? (
                      <p className="text-overline text-[var(--app-muted)]">
                        Score: {quizScore}/{QUIZ.length}
                      </p>
                    ) : null}
                    <div>
                      <Button type="button" onClick={() => setPhase("case")}>
                        {CTA_START_CASE}
                      </Button>
                    </div>
                  </div>
                ) : null}

                {phase === "case" ? (
                  <Card>
                    <CardBody className="p-5 sm:p-6">
                      <h3 className="text-h6">Case practice</h3>
                      <p className="mt-2 text-caption leading-6 text-[var(--app-muted)]">
                        Work through a short scenario the way you would in an interview. State your
                        structure, assumptions, and recommendation.
                      </p>
                      <div className="mt-4 rounded-2xl border border-dashed border-[var(--app-hairline-strong)] bg-[var(--app-surface-nested)] p-4 text-caption text-[var(--app-muted)]">
                        Scenario placeholder. Connect your case prompt or exercise here.
                      </div>
                      <div className="mt-4">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setPhase("after_case")}
                        >
                          Mark case complete
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                ) : null}

                {phase === "after_case" ? (
                  <div className="space-y-6">
                    <CoachBlock>{AFTER_CASE}</CoachBlock>
                    <CoachBlock>{FINAL_ASSESSMENT}</CoachBlock>
                    <div>
                      <Button type="button" onClick={() => setPhase("assessment")}>
                        {CTA_START_ASSESSMENT}
                      </Button>
                    </div>
                  </div>
                ) : null}

                {phase === "assessment" ? (
                  <Card>
                    <CardBody className="p-5 sm:p-6">
                      <h3 className="text-h6">Assessment (up to 600 words)</h3>
                      <p className="mt-2 text-caption leading-6 text-[var(--app-muted)]">
                        Summarize how you would apply this chapter in an interview setting. Aim for
                        clarity and structure.
                      </p>
                      <label
                        htmlFor="chapter-assessment"
                        className="mt-4 block text-overline text-[var(--app-muted)]"
                      >
                        Your response
                      </label>
                      <textarea
                        id="chapter-assessment"
                        value={assessmentText}
                        onChange={(e) => setAssessmentText(e.target.value)}
                        rows={12}
                        className={cn(
                          "mt-2 w-full resize-y rounded-2xl border border-[var(--app-hairline)] bg-white px-4 py-3 text-caption leading-6 outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--ring)]/40",
                          overWordLimit && "border-destructive/60 focus-visible:ring-destructive/30",
                        )}
                        placeholder="Write your assessment…"
                      />
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-overline text-[var(--app-muted)]">
                        <span className={cn(overWordLimit && "font-semibold text-destructive")}>
                          {wordCount} / 600 words
                        </span>
                      </div>
                      <div className="mt-4">
                        <Button
                          type="button"
                          onClick={() => setPhase("complete")}
                          disabled={overWordLimit || wordCount === 0}
                        >
                          Complete chapter
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                ) : null}

                {phase === "complete" ? (
                  <div className="space-y-6">
                    <CoachBlock>{chapterComplete(name)}</CoachBlock>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button type="button" onClick={() => setChapter2Placeholder(true)}>
                        {CTA_CONTINUE_CH2}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          try {
                            const payload = {
                              courseId: course.id,
                              courseTitle: course.title,
                              percentComplete: 34,
                              phase: "quiz" as const,
                              updatedAt: new Date().toISOString(),
                            };
                            window.localStorage.setItem(StorageKeys.trainingProgress, JSON.stringify(payload));
                          } catch {
                            // ignore localStorage write failures
                          }
                          router.push("/coach?journey=1");
                        }}
                      >
                        {CTA_TAKE_A_BREAK}
                      </Button>
                    </div>
                  </div>
                ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
