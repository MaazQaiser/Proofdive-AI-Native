"use client";

import { useMemo } from "react";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PixelMedia } from "@/components/ui/pixel-media";
import {
  SuccessDriverCard,
  SuccessDriverMark,
} from "@/components/ui/success-driver-card";
import {
  matchedSignalsFor,
  suggestCoreFour,
  suggestionReasoningFor,
} from "@/lib/coreFourSuggestion";
import { SUCCESS_DRIVERS, SUCCESS_DRIVER_ORDER } from "@/lib/successDrivers";
import {
  COMPETENCY_SPECS,
  type CompetencyId,
  type PillarId,
} from "@/lib/storyboardDraft";
import { cn } from "@/lib/utils";

type AssessmentPlanPanelProps = {
  targetRole: string;
  jobDescription: string;
  /** Current selection — one competency per pillar. */
  selected: CompetencyId[];
  onSelect: (id: CompetencyId) => void;
  onConfirm: () => void;
  error: string | null;
};

/**
 * Compact guide-video card for the plan step's header row — sits top-right
 * beside the agent heading, so the framework explainer is offered where the
 * decision starts without pushing the four cards down the page. Built on the
 * brand PixelMedia thumb (stepped corner + play mark, same language as the
 * training screens) so it reads as a video at a glance; placeholder until
 * the real video lands.
 */
export function SuccessDriversGuideCard({
  className,
  onPlay,
}: {
  className?: string;
  /** Wire the real video here when it lands; the card is already a button. */
  onPlay?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPlay}
      aria-label="Play the two-minute guide to the four Success Drivers"
      className={cn(
        "group block w-full cursor-pointer overflow-hidden rounded-xl border border-border bg-card text-left",
        "shadow-[0_16px_40px_-28px_rgba(4,32,39,0.45)]",
        // Hover: gentle lift + deeper shadow, the classic "this plays" cue,
        // kept small so it invites without shouting. Motion-reduce users get
        // the color/shadow change only.
        "transition-all duration-300 ease-out",
        "hover:-translate-y-1 hover:border-brand-400 hover:shadow-[0_24px_56px_-24px_rgba(4,32,39,0.5)]",
        "focus-visible:outline-none focus-visible:-translate-y-1 focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "active:translate-y-0 active:shadow-[0_16px_40px_-28px_rgba(4,32,39,0.45)]",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:focus-visible:translate-y-0",
        className,
      )}
    >
      <span className="block overflow-hidden">
        <PixelMedia
          src="/brand/training-campaign-4.png"
          className="aspect-video w-full transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </span>
      <span className="block px-3.5 pb-3 pt-2.5">
        <span className="block text-overline font-medium uppercase tracking-wide text-text-secondary">
          Quick guide · 2 min
        </span>
        <span className="mt-0.5 block text-caption font-semibold leading-snug text-text-primary transition-colors duration-300 group-hover:text-extended-blue">
          New to the four Success Drivers?
        </span>
      </span>
    </button>
  );
}

/**
 * The Core Four — the product's methodology moment, on the brand Success
 * Driver cards (translucent fill + clipped pillar glow art). All three
 * competencies stay visible per card as a radiogroup, the AI's pick is
 * pre-selected and labeled, and the "why" — role-specific reasoning plus the
 * actual words from the user's posting — sits inline under the selected
 * option only, so the evidence stays attached to the choice without
 * loading up the unselected rows.
 */
export function AssessmentPlanPanel({
  targetRole,
  jobDescription,
  selected,
  onSelect,
  onConfirm,
  error,
}: AssessmentPlanPanelProps) {
  const suggestedByPillar = useMemo(() => {
    const map = {} as Record<PillarId, CompetencyId>;
    for (const id of suggestCoreFour({ targetRole, jobDescription })) {
      const spec = COMPETENCY_SPECS.find((s) => s.id === id);
      if (spec) map[spec.pillar] = id;
    }
    return map;
  }, [targetRole, jobDescription]);

  return (
    <div className="mt-6 flex w-full flex-col gap-5">
      <div className="flex w-full flex-col gap-3">
        {SUCCESS_DRIVER_ORDER.map((pillar) => {
          const meta = SUCCESS_DRIVERS[pillar];
          const specs = COMPETENCY_SPECS.filter((s) => s.pillar === pillar);
          const suggestedId = suggestedByPillar[pillar];
          const chosenId =
            selected.find((id) => specs.some((s) => s.id === id)) ?? specs[0]!.id;

          return (
            <SuccessDriverCard key={pillar} driver={pillar}>
              <div className="flex h-6 flex-wrap items-center gap-2 pr-10">
                <SuccessDriverMark
                  driver={pillar}
                  className="text-body-sm leading-6"
                  iconClassName="size-5"
                />
              </div>
              <p className="pr-10 text-caption leading-[19.25px] text-text-secondary">
                {meta.description}
              </p>

              <div
                role="radiogroup"
                aria-label={`${meta.label} competency`}
                className="flex flex-col gap-1 pr-10"
              >
                {specs.map((spec) => {
                  const isOn = spec.id === chosenId;
                  const isSuggested = spec.id === suggestedId;
                  const signals = matchedSignalsFor(spec.id, {
                    targetRole,
                    jobDescription,
                  });
                  return (
                    <div key={spec.id}>
                      <button
                        type="button"
                        role="radio"
                        aria-checked={isOn}
                        onClick={() => onSelect(spec.id)}
                        className={cn(
                          "flex h-9 w-full items-center gap-2.5 rounded-md px-1 py-1 text-left text-body-sm leading-6 text-text-primary transition",
                          "hover:bg-white/40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                          isOn && "font-medium",
                        )}
                      >
                        <span
                          aria-hidden
                          className={cn(
                            "grid size-4 shrink-0 place-items-center rounded-full border-[1.5px] border-[#56b8cb] bg-white",
                            isOn && "border-primary",
                          )}
                        >
                          <span
                            className={cn(
                              "size-[9px] rounded-full bg-primary transition",
                              isOn ? "opacity-100" : "opacity-0",
                            )}
                          />
                        </span>
                        <span className="min-w-0 truncate">{spec.title}</span>
                        {isSuggested ? (
                          // Same pill language as the "AI draft" badge on the
                          // spec panel (shared AI-provenance semantic), toned
                          // down so it labels without competing with the
                          // option text.
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-secondary/60 px-2 py-0.5 text-overline font-normal text-secondary-foreground/90">
                            <Sparkles className="size-2.5" aria-hidden />
                            AI pick
                          </span>
                        ) : null}
                      </button>

                      {/* Why this pick — inline under the selected option
                          only, hanging off its radio dot via a short rail so
                          the reasoning reads as part of the choice, not a
                          separate surface. Always mounted so a swap animates:
                          the grid-rows 0fr→1fr trick height-tweens to auto
                          while the old block collapses in step — one gentle
                          move, no jump cut. */}
                      <div
                        aria-hidden={!isOn}
                        className={cn(
                          "grid transition-[grid-template-rows,opacity] duration-250 ease-out motion-reduce:transition-none",
                          isOn
                            ? "grid-rows-[1fr] opacity-100"
                            : "grid-rows-[0fr] opacity-0",
                        )}
                      >
                        <div className="overflow-hidden">
                          <div className="mt-0.5 mb-1 ml-[11px] border-l-[1.5px] border-[#56b8cb]/50 pl-[19px] pr-2">
                            <p className="text-caption leading-snug text-text-secondary">
                              {suggestionReasoningFor(spec.id, { targetRole })}
                            </p>
                            {signals.length ? (
                              <p className="mt-1 text-overline text-text-secondary">
                                <span className="font-medium uppercase tracking-wide">
                                  From your posting:
                                </span>{" "}
                                {signals.map((signal, i) => (
                                  <span key={signal}>
                                    {i > 0 ? " · " : ""}
                                    <span className="font-semibold text-extended-blue">
                                      “{signal}”
                                    </span>
                                  </span>
                                ))}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SuccessDriverCard>
          );
        })}
      </div>

      {error ? (
        <p role="alert" className="text-caption text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <Button
          onClick={onConfirm}
          className="h-11 rounded-md pl-6! pr-4! text-body-sm font-medium"
        >
          Confirm selection
          <ArrowRight />
        </Button>
        <p className="text-caption text-text-secondary">
          This isn&apos;t final. You can add more competencies later from your storyboard.
        </p>
      </div>
    </div>
  );
}
