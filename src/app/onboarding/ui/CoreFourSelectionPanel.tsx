"use client";

import { useMemo } from "react";
import { ArrowRight, Check, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

/** Shared footer-button metrics — matches the plan step's Confirm, which is
 *  this screen's reference. Padding differs per button (a trailing arrow needs
 *  less room on the right), so only the size lives here. */
const FOOTER_BUTTON = "h-11 rounded-md text-body-sm font-medium";

type CoreFourSelectionPanelProps = {
  selected: CompetencyId[];
  targetRole: string;
  jobDescription: string;
  onToggle: (id: CompetencyId) => void;
  onConfirm: () => void;
  error: string | null;
  /** Already-captured competencies — checked and not toggleable. */
  lockedIds?: readonly CompetencyId[];
  confirmLabel?: string;
  helperText?: string;
  onCancel?: () => void;
  cancelLabel?: string;
};

/**
 * Add competencies — the onboarding plan step's card pattern, with checkboxes.
 *
 * The plan step (AssessmentPlanPanel) had the better anatomy and this screen
 * was diverging from it: same Success Driver cards, but the "why" was hidden
 * behind a help icon in the card's corner, so the reasoning that should drive
 * the choice was a click away from the choice. Here it works the way the plan
 * step works — the reasoning, and the words matched from the user's own
 * posting, sit inline under a checked option, attached to it by a short rail.
 *
 * The one deliberate difference is selection: the plan step takes one
 * competency per pillar (a radiogroup), this takes any number (checkboxes),
 * because it is adding to a Dive rather than composing the Core Four. That is
 * also why several reasoning blocks can be open at once — each belongs to a
 * row the user has actually chosen, so they open and close with it.
 */
export function CoreFourSelectionPanel({
  selected,
  targetRole,
  jobDescription,
  onToggle,
  onConfirm,
  error,
  lockedIds = [],
  confirmLabel = "Confirm selection",
  helperText = "Confirm when your selection matches the work you are targeting.",
  onCancel,
  cancelLabel = "Cancel",
}: CoreFourSelectionPanelProps) {
  const lockedSet = useMemo(() => new Set(lockedIds), [lockedIds]);

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
                role="group"
                aria-label={`${meta.label} competencies`}
                className="flex flex-col gap-1 pr-10"
              >
                {specs.map((spec) => {
                  const isLocked = lockedSet.has(spec.id);
                  const isOn = isLocked || selected.includes(spec.id);
                  const isSuggested = spec.id === suggestedId;
                  const signals = matchedSignalsFor(spec.id, {
                    targetRole,
                    jobDescription,
                  });

                  return (
                    <div key={spec.id}>
                      {/* One control per row, exactly as the plan step does it
                          — the whole row is the target, so the label and the
                          box can never disagree about what was clicked. */}
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={isOn}
                        aria-disabled={isLocked}
                        onClick={() => {
                          if (!isLocked) onToggle(spec.id);
                        }}
                        className={cn(
                          "flex h-9 w-full items-center gap-2.5 rounded-md px-1 py-1 text-left text-body-sm leading-6 text-text-primary transition",
                          "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                          isLocked
                            ? "cursor-not-allowed opacity-70"
                            : "hover:bg-[var(--hover-veil)]",
                          isOn && "font-medium",
                        )}
                      >
                        {/* The plan step's dot, squared off: same size, same
                            stroke, same fill token — a checkbox rather than a
                            radio because more than one can be on. */}
                        <span
                          aria-hidden
                          className={cn(
                            "grid size-4 shrink-0 place-items-center rounded-[5px] border-[1.5px] border-brand-400 bg-card transition",
                            isOn && "border-primary bg-primary",
                          )}
                        >
                          <Check
                            className={cn(
                              "size-3 text-primary-foreground transition",
                              isOn ? "opacity-100" : "opacity-0",
                            )}
                            strokeWidth={3}
                          />
                        </span>
                        <span className="min-w-0 truncate">{spec.title}</span>
                        {isLocked ? (
                          <span className="shrink-0 text-caption font-normal text-text-secondary">
                            already added
                          </span>
                        ) : null}
                        {isSuggested ? (
                          <Badge className="shrink-0">
                            <Sparkles aria-hidden />
                            Recommended
                          </Badge>
                        ) : null}
                      </button>

                      {/* Why this one — inline under a checked option, hanging
                          off the box via a short rail. Always mounted so the
                          0fr→1fr grid trick can height-tween to auto: opening
                          one while another closes reads as a single move. */}
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
                          <div className="mt-0.5 mb-1 ml-[11px] border-l-[1.5px] border-brand-400/50 pl-[19px] pr-2">
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

      <p className="text-agent-question text-text-primary">{helperText}</p>

      {error ? (
        <p role="alert" className="text-caption text-destructive">
          {error}
        </p>
      ) : null}

      {/* Both buttons take the same metrics from one constant — a row where
          the secondary is shorter than the primary reads as a mistake, and
          two separate className strings is exactly how they drift apart. */}
      <div className="flex flex-wrap items-center gap-3">
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className={cn(FOOTER_BUTTON, "px-6!")}
          >
            {cancelLabel}
          </Button>
        ) : null}
        <Button onClick={onConfirm} className={cn(FOOTER_BUTTON, "pl-6! pr-4!")}>
          {confirmLabel}
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
}
