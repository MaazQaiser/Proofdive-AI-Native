"use client";

import {
  AudioLines,
  Check,
  ChevronDown,
  Clock3,
  Hand,
  PersonStanding,
  SpellCheck,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { SuccessDriverCompetencyPill } from "@/components/ui/success-driver-card";
import type { InterviewReport, InterviewReportQuestion } from "@/lib/proofdiveTypes";
import { scoringBadgeClass, scoringTextClass } from "@/lib/scoringPalette";
import { SUCCESS_DRIVERS, type SuccessDriverId } from "@/lib/successDrivers";
import { cn } from "@/lib/utils";

import { answerLength, fmtDuration, fmtIdealRange } from "./reportV2Model";

/* ------------------------------------------------------------------------ */
/* Shared bits                                                               */
/* ------------------------------------------------------------------------ */

/** The question's number, as its own mark — the thing that makes a list of
 *  eight rows scannable, and the same mark the rewrite uses to point back. */
export function QuestionNumber({
  index,
  size = "md",
  className,
}: {
  index: number;
  size?: "md" | "lg";
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-lg bg-brand-1000 font-medium tabular-nums text-extended-blue",
        size === "lg" ? "size-10 text-body-sm" : "size-8 text-caption",
        className,
      )}
    >
      Q{index}
    </span>
  );
}

export function ScoreChip({ score, className }: { score: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-0.5 rounded-full border border-border bg-card px-2 text-overline font-medium",
        className,
      )}
    >
      <span className={scoringTextClass(score)}>{score.toFixed(1)}</span>
      <span className="text-text-secondary/70">/5</span>
    </span>
  );
}

/** Small uppercase label with an optional one-line explainer beneath it —
 *  the report's way of naming a block without a heading-sized title. */
export function FieldLabel({
  children,
  hint,
  className,
}: {
  children: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("leading-tight", className)}>
      <div className="text-overline font-medium uppercase tracking-wide text-text-secondary">
        {children}
      </div>
      {hint ? <div className="mt-0.5 text-caption text-text-secondary/80">{hint}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Question row                                                              */
/* ------------------------------------------------------------------------ */

type QuestionRowProps = {
  q: InterviewReportQuestion;
  open: boolean;
  onToggle: () => void;
  /** This is the answer the rewrite section works on. */
  isSpotlight: boolean;
};

export function QuestionRow({ q, open, onToggle, isSpotlight }: QuestionRowProps) {
  const driver = q.driver as SuccessDriverId;
  const length = answerLength(q);
  const panelId = `q-panel-${q.id}`;

  return (
    <li
      id={`q-${q.id}`}
      className={cn(
        "scroll-mt-32 rounded-[16px] border bg-card transition-colors",
        open ? "border-brand-700" : "border-border",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-start gap-4 rounded-[16px] p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        <QuestionNumber index={q.index} className="mt-0.5" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-caption font-semibold text-text-primary">{q.facet}</span>
            <SuccessDriverCompetencyPill
              variant="filled"
              driver={driver}
              label={SUCCESS_DRIVERS[driver].shortLabel}
            />
            <span className="inline-flex items-center gap-1 text-overline tabular-nums text-text-secondary">
              <Clock3 className="size-3.5" aria-hidden />
              {fmtDuration(q.timeSeconds)}
              {q.idealRangeSeconds && length && length !== "in-range" ? (
                <span className="text-scoring-yellow-fg">
                  {" · "}
                  {length === "short" ? "short of" : "over"} {fmtIdealRange(q.idealRangeSeconds)}
                </span>
              ) : null}
            </span>
            {isSpotlight ? (
              <Badge>
                Weakest answer
              </Badge>
            ) : null}
          </div>
          <p className="mt-2 text-body-sm font-medium leading-6 text-text-primary">“{q.text}”</p>
        </div>

        <div className="flex shrink-0 items-center gap-2 self-center">
          <ScoreChip score={q.score} />
          <Badge variant="outline" className={cn("hidden sm:inline-flex", scoringBadgeClass(q.status))}>
            {q.status}
          </Badge>
          <ChevronDown
            aria-hidden
            className={cn(
              "size-5 text-text-secondary transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </div>
      </button>

      {open ? (
        <div id={panelId} className="border-t border-border px-5 pb-5 pt-4 sm:pl-[4.25rem]">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="min-w-0">
              <FieldLabel>Your answer</FieldLabel>
              <blockquote className="mt-2 border-l-2 border-border pl-4 text-body-sm leading-7 text-text-primary">
                {q.answer}
              </blockquote>
            </div>
            <div className="min-w-0">
              <FieldLabel>Areas for improvement</FieldLabel>
              <ul className="mt-2 flex flex-col gap-2.5">
                {q.improvements.map((imp) => (
                  <li key={imp.title} className="flex gap-2.5 text-body-sm leading-6">
                    <span
                      aria-hidden
                      className="mt-[0.6rem] size-1.5 shrink-0 rounded-full bg-scoring-yellow"
                    />
                    <span className="text-text-secondary">
                      <span className="font-semibold text-text-primary">{imp.title}</span>
                      {" — "}
                      {imp.detail}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </li>
  );
}

/* ------------------------------------------------------------------------ */
/* Spotlight rewrite                                                         */
/* ------------------------------------------------------------------------ */

const CAR_STEPS = ["Context", "Action", "Result"] as const;

const DELIVERY_CARDS: {
  key: keyof InterviewReport["spotlight"]["delivery"];
  title: string;
  icon: LucideIcon;
}[] = [
  { key: "bodyLanguage", title: "Body language", icon: PersonStanding },
  { key: "grammarPhrasing", title: "Grammar & phrasing", icon: SpellCheck },
  { key: "gesturesPresence", title: "Gestures & presence", icon: Hand },
  { key: "fillerPacing", title: "Filler words & pacing", icon: AudioLines },
];

export function SpotlightRewrite({
  report,
  question,
}: {
  report: InterviewReport;
  question: InterviewReportQuestion;
}) {
  const { spotlight } = report;
  const driver = question.driver as SuccessDriverId;
  // The mock's three "why stronger" points map one-to-one onto CAR; label
  // them as such only when the count matches, so real data with two or five
  // points is never mislabelled.
  const carKeyed = spotlight.whyStronger.length === CAR_STEPS.length;

  return (
    <div className="rounded-[16px] border border-border bg-card">
      <div className="px-6 pt-6">
        <div className="flex flex-wrap items-center gap-2">
          <QuestionNumber index={question.index} size="lg" />
          <span className="text-body-sm font-semibold text-text-primary">{question.facet}</span>
          <SuccessDriverCompetencyPill
            variant="filled"
            driver={driver}
            label={SUCCESS_DRIVERS[driver].shortLabel}
          />
          <ScoreChip score={question.score} />
          <Badge variant="outline" className={scoringBadgeClass(question.status)}>
            {question.status}
          </Badge>
        </div>
        <FieldLabel className="mt-5">Interview question</FieldLabel>
        <p className="mt-1.5 max-w-[60ch] text-h4 leading-snug text-text-primary">{question.text}</p>
      </div>

      <div className="mt-6 grid gap-px overflow-hidden border-y border-border bg-border lg:grid-cols-2">
        <div className="bg-card px-6 py-5">
          <FieldLabel hint="What you said">Your answer</FieldLabel>
          <blockquote className="mt-3 border-l-2 border-border pl-4 text-body-sm leading-7 text-text-primary">
            {spotlight.yourAnswer}
          </blockquote>
        </div>
        <div className="bg-brand-1000/60 px-6 py-5">
          <div className="flex items-start justify-between gap-3">
            <FieldLabel hint="How it should sound">Coach rewrite</FieldLabel>
            <Badge>AI Coach</Badge>
          </div>
          <blockquote className="mt-3 whitespace-pre-line border-l-2 border-primary pl-4 text-body-sm leading-7 text-text-primary">
            {spotlight.coachRewrite}
          </blockquote>
        </div>
      </div>

      <div className="px-6 py-5">
        <FieldLabel>Why this version is stronger</FieldLabel>
        <ul className="mt-3 grid gap-2 sm:grid-cols-3">
          {spotlight.whyStronger.map((s, i) => (
            <li
              key={s}
              className="flex gap-3 rounded-lg border border-border bg-background p-3 text-caption leading-relaxed text-text-primary"
            >
              <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <span>
                {carKeyed ? (
                  <span className="font-semibold text-extended-blue">{CAR_STEPS[i]}: </span>
                ) : null}
                {s}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-border px-6 py-5">
        <FieldLabel hint="What the camera and microphone picked up on this answer.">
          Delivery & language
        </FieldLabel>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {DELIVERY_CARDS.map(({ key, title, icon: Icon }) => {
            const value = spotlight.delivery[key];
            const items = Array.isArray(value) ? value : [value.summary];
            const extra = Array.isArray(value) ? null : value.onCameraPresence;
            return (
              <div key={key} className="flex gap-3 rounded-lg border border-border bg-background p-4">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground">
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <div className="text-caption font-semibold text-text-primary">{title}</div>
                  <ul className="mt-1.5 flex flex-col gap-1.5 text-caption leading-relaxed text-text-secondary">
                    {items.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                  {extra ? (
                    <>
                      <div className="mt-3 text-overline font-medium uppercase tracking-wide text-text-secondary">
                        On-camera presence
                      </div>
                      <p className="mt-1 text-caption leading-relaxed text-text-secondary">{extra}</p>
                    </>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
