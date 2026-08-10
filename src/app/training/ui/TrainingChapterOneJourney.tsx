"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { Briefcase, Check, ClipboardCheck, ListChecks, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IconButton } from "@/components/ui/icon-button";
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

function CoachBlock({ children }: { children: ReactNode }) {
  return (
    <div className="whitespace-pre-wrap text-body font-semibold leading-7 text-text-primary/90">
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
      { id: "v" as const, label: "Video", icon: Video },
      { id: "q" as const, label: "Quiz", icon: ListChecks },
      { id: "c" as const, label: "Case", icon: Briefcase },
      { id: "a" as const, label: "Assessment", icon: ClipboardCheck },
    ];

    return steps.map((step, idx) => {
      const done =
        (idx === 0 &&
          (phase === "post_video" ||
            phase === "quiz" ||
            phase === "after_quiz" ||
            phase === "case" ||
            phase === "after_case" ||
            phase === "assessment" ||
            phase === "complete")) ||
        (idx === 1 &&
          (phase === "after_quiz" ||
            phase === "case" ||
            phase === "after_case" ||
            phase === "assessment" ||
            phase === "complete")) ||
        (idx === 2 &&
          (phase === "after_case" || phase === "assessment" || phase === "complete")) ||
        false;
      const active =
        !done &&
        ((idx === 0 && (phase === "video_intro" || phase === "video")) ||
          (idx === 1 && (phase === "quiz" || phase === "post_video")) ||
          (idx === 2 && (phase === "case" || phase === "after_quiz")) ||
          (idx === 3 && (phase === "assessment" || phase === "after_case")));
      return { ...step, idx, active, done };
    });
  }, [phase]);

  const activeStepIndex = timelineSteps.findIndex((s) => s.active);
  const currentStepNumber = (activeStepIndex >= 0 ? activeStepIndex : timelineSteps.filter((s) => s.done).length) + 1;
  const currentStepLabel =
    timelineSteps.find((s) => s.active)?.label ??
    timelineSteps.find((s) => !s.done)?.label ??
    "Complete";
  const progressPct = percentForTrainingPhase(phase);

  return (
    <div className="mt-6 w-full">
      <div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackToOverview}
            aria-label="Back to course overview"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-secondary transition hover:bg-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]/30"
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
          <p className="text-overline text-text-secondary">
            CHAPTER 1
          </p>
        </div>
        <h2 className="text-h5 mt-1">
          {chapterTitle}
        </h2>
        <p className="mt-1 max-w-2xl text-caption leading-6 text-text-secondary">
          {chapterSummary}
        </p>
      </div>

      {chapter2Placeholder ? (
        <Card className="gap-0 py-0 mt-8">
          <CardContent className="p-6">
            <p className="text-caption font-semibold leading-6 text-text-secondary">
              Chapter 2 is coming soon.
            </p>
            <div className="mt-4">
              <Button type="button" variant="secondary" onClick={() => setChapter2Placeholder(false)}>
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 flex flex-col gap-6">
          <div className="min-w-0 w-full space-y-6">
            {showTimeline ? (
              <Card
                className={cn(
                  "gap-0 overflow-hidden rounded-[16px] border-0 py-0",
                  "bg-[linear-gradient(114.96deg,rgba(255,255,255,0.8)_0%,rgba(255,255,255,0.5)_98.96%)]",
                )}
              >
                <CardContent className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-overline text-extended-cyan-green">Module progress</p>
                      <p className="mt-1 text-[18px] font-semibold tracking-[-0.4px] text-heading-teal">
                        Step {Math.min(currentStepNumber, timelineSteps.length)} of{" "}
                        {timelineSteps.length}
                      </p>
                    </div>
                    <p
                      className="shrink-0 text-[28px] font-semibold leading-none tracking-[-1px] tabular-nums text-heading-teal"
                      aria-hidden
                    >
                      {progressPct}
                      <span className="text-[16px] font-medium text-text-secondary">%</span>
                    </p>
                  </div>

                  {/* Segmented rail — clearer than a single bar for discrete steps */}
                  <div
                    className="mt-5 grid grid-cols-4 gap-1.5"
                    role="progressbar"
                    aria-valuenow={progressPct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Module progress: step ${Math.min(currentStepNumber, timelineSteps.length)} of ${timelineSteps.length}, ${currentStepLabel}`}
                  >
                    {timelineSteps.map(({ id, done, active }) => (
                      <div
                        key={`seg-${id}`}
                        className={cn(
                          "h-1.5 rounded-full transition-colors duration-300 ease-out motion-reduce:transition-none",
                          done
                            ? "bg-primary"
                            : active
                              ? "bg-brand-400"
                              : "bg-[#dde7e9]",
                        )}
                      />
                    ))}
                  </div>

                  <ol className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-2">
                    {timelineSteps.map(({ id, label, idx, active, done, icon: StepIcon }) => (
                      <li
                        key={id}
                        className={cn(
                          "flex min-w-0 items-center gap-2.5 rounded-xl px-2.5 py-2.5 transition-colors duration-200 motion-reduce:transition-none",
                          active
                            ? "bg-brand-1000 ring-1 ring-brand-500/40"
                            : done
                              ? "bg-white/60"
                              : "bg-transparent",
                        )}
                        aria-current={active ? "step" : undefined}
                      >
                        <span
                          className={cn(
                            "grid size-8 shrink-0 place-items-center rounded-full text-overline font-semibold transition-colors duration-200",
                            done
                              ? "bg-primary text-primary-foreground"
                              : active
                                ? "bg-primary text-primary-foreground"
                                : "border border-[#dde7e9] bg-white text-text-secondary",
                          )}
                        >
                          {done ? (
                            <Check className="size-3.5 stroke-[2.5]" aria-hidden />
                          ) : active ? (
                            <StepIcon className="size-3.5" aria-hidden />
                          ) : (
                            <span aria-hidden>{idx + 1}</span>
                          )}
                        </span>
                        <div className="min-w-0">
                          <p
                            className={cn(
                              "truncate text-[13px] font-semibold leading-4",
                              done || active ? "text-text-primary" : "text-text-secondary",
                            )}
                          >
                            {label}
                          </p>
                          <p className="mt-0.5 text-[11px] leading-4 text-text-secondary">
                            {done ? "Done" : active ? "Now" : "Up next"}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </CardContent>
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
                  <Card className="gap-0 py-0">
                    <CardContent className="p-5 sm:p-6">
                      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-surface">
                        <div
                          className="absolute inset-0 bg-cover bg-center opacity-40"
                          style={{
                            backgroundImage: 'url("/brand/training-campaign-3.png")',
                          }}
                          aria-hidden
                        />
                        <div className="relative flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
                          <IconButton
                            variant="solid"
                            size="2xl"
                            onClick={() => setVideoStarted(true)}
                            aria-label="Play video"
                          >
                            <svg
                              className="ml-1"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              aria-hidden
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </IconButton>
                          <span className="text-overline text-text-secondary">
                            Video
                          </span>
                          <p className="text-caption font-semibold text-text-secondary">
                            Lesson player placeholder
                          </p>
                          <p className="max-w-sm text-caption leading-5 text-text-secondary">
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
                    </CardContent>
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
                  <Card className="gap-0 overflow-hidden rounded-[16px] border-[#dde7e9] py-0">
                    <CardContent className="p-5 sm:p-6">
                    <div className="flex items-center gap-2">
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                        <ListChecks className="size-4" aria-hidden />
                      </span>
                      <h3 className="text-body-sm font-semibold text-extended-cyan-green">
                        Quick quiz · 3 questions
                      </h3>
                    </div>
                    <div className="mt-5 divide-y divide-[#dde7e9]">
                      {QUIZ.map((item, qi) => (
                        <fieldset
                          key={qi}
                          className="py-5 first:pt-0 last:pb-0"
                        >
                          <legend className="sr-only">
                            Question {qi + 1}
                          </legend>
                          <div className="flex items-center gap-3">
                            <span className="grid size-8 shrink-0 place-items-center text-overline font-semibold text-extended-cyan-green">
                              {qi + 1}
                            </span>
                            <p className="text-body-sm font-semibold text-extended-cyan-green">
                              {item.q}
                            </p>
                          </div>
                          <div className="mt-3 space-y-2">
                            {item.options.map((opt, oi) => {
                              const selected = quizAnswers[qi] === oi;
                              return (
                                <label
                                  key={opt}
                                  className={cn(
                                    "flex cursor-pointer items-center gap-3 rounded-lg p-3 text-caption transition-colors",
                                    "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring/40",
                                    selected
                                      ? "bg-extended-light-cyan/40"
                                      : "bg-transparent hover:bg-extended-light-cyan/30",
                                  )}
                                >
                                  <input
                                    type="radio"
                                    className="sr-only"
                                    name={`quiz-q-${qi}`}
                                    checked={selected}
                                    onChange={() =>
                                      setQuizAnswers((prev) => ({
                                        ...prev,
                                        [qi]: oi,
                                      }))
                                    }
                                  />
                                  <span
                                    className={cn(
                                      "grid size-4 shrink-0 place-items-center rounded-full border",
                                      selected
                                        ? "border-primary bg-primary"
                                        : "border-[#dde7e9] bg-white",
                                    )}
                                    aria-hidden
                                  >
                                    {selected ? (
                                      <span className="size-1.5 rounded-full bg-white" />
                                    ) : null}
                                  </span>
                                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#f5f5f3] text-overline font-semibold text-extended-cyan">
                                    {String.fromCharCode(65 + oi)}
                                  </span>
                                  <span className="min-w-0 leading-snug text-text-primary">
                                    {opt}
                                  </span>
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
                        <span className="self-center text-caption font-semibold text-text-secondary">
                          Score: {quizScore}/{QUIZ.length}
                        </span>
                      ) : null}
                    </div>
                    </CardContent>
                  </Card>
                ) : null}

                {phase === "after_quiz" ? (
                  <div className="space-y-6">
                    <CoachBlock>{AFTER_QUIZ}</CoachBlock>
                    <CoachBlock>{CASE_INTRO}</CoachBlock>
                    {quizSubmitted && quizScore !== null ? (
                      <p className="text-overline text-text-secondary">
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
                  <Card className="gap-0 py-0">
                    <CardContent className="p-5 sm:p-6">
                      <h3 className="text-h6">Case practice</h3>
                      <p className="mt-2 text-caption leading-6 text-text-secondary">
                        Work through a short scenario the way you would in an interview. State your
                        structure, assumptions, and recommendation.
                      </p>
                      <div className="mt-4 rounded-2xl border border-dashed border-border bg-surface p-4 text-caption text-text-secondary">
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
                    </CardContent>
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
                  <Card className="gap-0 py-0">
                    <CardContent className="p-5 sm:p-6">
                      <h3 className="text-h6">Assessment (up to 600 words)</h3>
                      <p className="mt-2 text-caption leading-6 text-text-secondary">
                        Summarize how you would apply this chapter in an interview setting. Aim for
                        clarity and structure.
                      </p>
                      <label
                        htmlFor="chapter-assessment"
                        className="mt-4 block text-overline text-text-secondary"
                      >
                        Your response
                      </label>
                      <textarea
                        id="chapter-assessment"
                        value={assessmentText}
                        onChange={(e) => setAssessmentText(e.target.value)}
                        rows={12}
                        className={cn(
                          "mt-2 w-full resize-y rounded-2xl border border-border bg-white px-4 py-3 text-caption leading-6 outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--ring)]/40",
                          overWordLimit && "border-destructive/60 focus-visible:ring-destructive/30",
                        )}
                        placeholder="Write your assessment…"
                      />
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-overline text-text-secondary">
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
                    </CardContent>
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
                          router.push("/coach");
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
