"use client";

import { useMemo } from "react";
import { ArrowRight, CircleHelp, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MediaListItem } from "@/components/ui/media-list-item";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
 * The Core Four — the product's methodology moment, on the brand Success
 * Driver cards (translucent fill + clipped pillar glow art). All three
 * competencies stay visible per card as a radiogroup, the AI's pick is
 * pre-selected and labeled, and the "why" — role-specific reasoning plus the
 * actual words from the user's posting — lives behind the card's info
 * control so the surface stays calm.
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
      {/* Guide video — placeholder thumb for now; wire the real video when
       * it lands. Reuses the product's media-row pattern so it reads as a
       * familiar course card, not an ad. */}
      <div className="rounded-xl border border-border bg-card p-4">
        <MediaListItem
          imageUrl="/brand/training-campaign-4.png"
          title="New to the four Success Drivers?"
          summary="A quick guide to the framework behind your plan — and the 12 competencies inside it."
          duration="2 min"
        />
      </div>

      <div className="flex w-full flex-col gap-3">
        {SUCCESS_DRIVER_ORDER.map((pillar) => {
          const meta = SUCCESS_DRIVERS[pillar];
          const specs = COMPETENCY_SPECS.filter((s) => s.pillar === pillar);
          const suggestedId = suggestedByPillar[pillar];
          const chosenId =
            selected.find((id) => specs.some((s) => s.id === id)) ?? specs[0]!.id;
          const chosen = specs.find((s) => s.id === chosenId)!;
          const signals = matchedSignalsFor(chosen.id, {
            targetRole,
            jobDescription,
          });

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
                  return (
                    <button
                      key={spec.id}
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
                        <span className="inline-flex shrink-0 items-center gap-1 text-overline font-normal text-text-secondary/80">
                          <Sparkles className="size-3" aria-hidden />
                          AI pick
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>

              {/* Why this pick — detail lives here, off the main surface */}
              <div className="absolute top-4 right-4 z-20">
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      aria-label={`Why ${chosen.title} for ${meta.label}?`}
                      className="grid size-8 place-items-center rounded-full text-text-secondary transition hover:bg-white/70 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                    >
                      <CircleHelp className="size-4" strokeWidth={2} aria-hidden />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-80 bg-card p-4">
                    <p className="text-body-sm font-semibold text-extended-cyan-green">
                      {chosen.title}
                    </p>
                    <p className="mt-1.5 text-caption leading-snug text-text-secondary">
                      {suggestionReasoningFor(chosen.id, { targetRole })}
                    </p>
                    {signals.length ? (
                      <p className="mt-2.5 text-overline text-text-secondary">
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
                  </PopoverContent>
                </Popover>
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
          One competency per driver — your storyboard can add more later.
        </p>
      </div>
    </div>
  );
}
