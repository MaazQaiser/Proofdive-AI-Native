"use client";

import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/ui/logo";
import type { CoachJourneyModel } from "@/lib/coachJourneyModel";
import { scoringBadgeClass } from "@/lib/scoringPalette";
import { cn } from "@/lib/utils";

/**
 * The guided journey — three steps, each carrying the state its own module
 * reports.
 *
 * The client signed this reading off on the redesigned Home and asked for it
 * on the current one, so it lives here rather than in either page: one card,
 * one truth about where the candidate is. What it says, and why:
 *
 * — HOW MANY ARE DONE, as three segments and a count. A bar that can only
 *   ever read 0, 1, 2 or 3 is exactly as precise as the truth is.
 * — WHICH ONE IS NEXT, from `pickRecommendedNextStep` — the same picker the
 *   onboarding plan and the FAQ bot use, so Home never disagrees with them.
 * — A WAY INTO EACH, so the card is navigation and not a progress read-out.
 */
export function JourneyCard({
  model,
  intro,
  className,
}: {
  model: CoachJourneyModel;
  /** One line under the heading, naming what the three steps are built for. */
  intro?: React.ReactNode;
  className?: string;
}) {
  const { steps, recommended, doneCount } = model;

  return (
    <section className={cn("w-full", className)} aria-label="Your guided journey">
      {/* Top-aligned so the count sits on the heading's line: with an intro
          under the heading, `items-end` dropped it level with that sentence
          and the two crowded each other. */}
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
        <div className="min-w-0">
          <h3 className="text-[20px] font-medium leading-7 tracking-[-1px] text-text-secondary">
            Your guided journey
          </h3>
          {intro ? (
            <p className="mt-1 text-body-sm leading-6 text-text-secondary">{intro}</p>
          ) : null}
        </div>
        {/* Progress as three segments, one per step — a bar that can only ever
            say 0, 1, 2 or 3, which is exactly as precise as the truth. */}
        <div className="flex items-center gap-2 pt-1.5 text-overline font-medium uppercase tracking-wide text-text-secondary">
          <span className="flex gap-1" aria-hidden>
            {steps.map((s) => (
              <span
                key={s.id}
                className={cn(
                  "h-1.5 w-7 rounded-full",
                  s.status === "done"
                    ? "bg-primary"
                    : s.status === "in_progress"
                      ? "bg-primary/40"
                      : "bg-muted",
                )}
              />
            ))}
          </span>
          {doneCount} of 3 done
        </div>
      </div>

      {/* `overflow-hidden` so the highlighted row's tint is clipped to the
          card's own radius when it is the first or last row. */}
      <ol className="mt-3 flex w-full flex-col overflow-hidden rounded-xl border border-border bg-card px-4">
        {steps.map((step) => {
          const isNext = step.id === recommended.id;
          const done = step.status === "done";
          return (
            <li
              key={step.id}
              className={cn(
                // No `w-full`: a stretched flex child already fills the list, and
                // 100% + a negative margin would leave the highlight 32px short of
                // the card's right edge.
                "flex flex-col gap-3 border-b border-border py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between",
                isNext && "-mx-4 border-b-0 bg-brand-1000/60 px-4",
              )}
            >
              <div className="flex min-w-0 flex-1 items-start gap-4">
                {/* The numeral stays in every state (client likes it) — the
                    "Done" badge already says done, a check beside it said it
                    twice. Ink carries the state instead: full brand on the
                    next step, soft brand on done, quiet on not-started. */}
                <span
                  aria-hidden
                  className={cn(
                    "flex w-8 shrink-0 self-stretch items-center justify-center font-gilroy text-[52px] font-normal leading-[52px] tracking-[-1.04px] tabular-nums",
                    isNext ? "text-brand-500" : done ? "text-brand-500/50" : "text-text-secondary/40",
                  )}
                >
                  {step.index}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-[18px] font-medium leading-[27px] tracking-[-1.3px] text-text-primary">
                      {step.title}
                    </h4>
                    {/* A step can be both done and the recommended next move
                        (the mock, once everything else is complete). It keeps
                        the highlight and the filled button, but says "Done" —
                        "Up next" beside a check mark contradicts itself. */}
                    {isNext && !done ? (
                      <Badge className="border-transparent bg-primary text-primary-foreground">
                        <LogoMark className="size-3" />
                        Up next
                      </Badge>
                    ) : done ? (
                      <Badge className={cn(scoringBadgeClass("Ready"), "border-transparent")}>
                        Done
                      </Badge>
                    ) : step.status === "in_progress" ? (
                      <Badge>
                        In progress{step.percent != null ? ` · ${step.percent}%` : ""}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-[16px] font-normal leading-6 text-text-secondary">
                    {step.detail ?? step.subtitle}
                  </p>
                  {step.percent != null ? (
                    <div className="h-1 w-full max-w-[16rem] overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,var(--brand-100),var(--brand-600))]"
                        style={{ width: `${step.percent}%` }}
                      />
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2 pl-12 sm:pl-0">
                {step.secondary ? (
                  <Button asChild variant="ghost" size="sm" className="text-text-secondary">
                    <Link href={step.secondary.href}>
                      {step.secondary.label === "Add competency" ? <Plus aria-hidden /> : null}
                      {step.secondary.label}
                    </Link>
                  </Button>
                ) : null}
                {isNext ? (
                  <Button asChild size="sm">
                    <Link href={recommended.ctaHref}>
                      {step.primary.label}
                      <ArrowUpRight aria-hidden />
                    </Link>
                  </Button>
                ) : (
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="text-extended-dark-cyan hover:text-extended-dark-cyan"
                  >
                    <Link href={step.primary.href}>
                      {step.primary.label}
                      <ArrowUpRight aria-hidden />
                    </Link>
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
