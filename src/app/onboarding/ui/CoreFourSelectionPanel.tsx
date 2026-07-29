"use client";

import { useMemo, useState } from "react";
import { ArrowRight, CircleHelp, Undo2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  SuccessDriverCard,
  SuccessDriverMark,
} from "@/components/ui/success-driver-card";
import {
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

type CoreFourSelectionPanelProps = {
  selected: CompetencyId[];
  targetRole: string;
  jobDescription: string;
  onToggle: (id: CompetencyId) => void;
  onConfirm: () => void;
  onResetToSuggested: () => void;
  error: string | null;
  /** Already-captured competencies — checked and not toggleable. */
  lockedIds?: readonly CompetencyId[];
  /** Hide onboarding suggestion tooltips (Add Competency flow). */
  hideSuggestionReasoning?: boolean;
  /** Hide Undo / reset-to-suggested (Add Competency flow). */
  hideReset?: boolean;
  confirmLabel?: string;
  helperText?: string;
  selectionMode?: "singlePerPillar" | "multi";
  onCancel?: () => void;
  cancelLabel?: string;
};

export function CoreFourSelectionPanel({
  selected,
  targetRole,
  jobDescription,
  onToggle,
  onConfirm,
  onResetToSuggested,
  error,
  lockedIds = [],
  hideSuggestionReasoning = false,
  hideReset = false,
  confirmLabel = "Confirm selection",
  helperText = "When you're happy with your selection, proceed to confirm.",
  selectionMode = "singlePerPillar",
  onCancel,
  cancelLabel = "Cancel",
}: CoreFourSelectionPanelProps) {
  const lockedSet = useMemo(() => new Set(lockedIds), [lockedIds]);

  const suggested = useMemo(
    () => suggestCoreFour({ targetRole, jobDescription }),
    [targetRole, jobDescription],
  );

  const suggestedByPillar = useMemo(() => {
    const map = {} as Record<PillarId, CompetencyId>;
    for (const id of suggested) {
      const spec = COMPETENCY_SPECS.find((s) => s.id === id);
      if (spec) map[spec.pillar] = id;
    }
    return map;
  }, [suggested]);

  const [openReasoningPillar, setOpenReasoningPillar] = useState<PillarId | null>(
    null,
  );

  return (
    <div className="mt-6 flex w-full flex-col gap-3">
      <div className="flex w-full flex-col gap-3">
        {SUCCESS_DRIVER_ORDER.map((pillar) => {
          const meta = SUCCESS_DRIVERS[pillar];
          const suggestedId = suggestedByPillar[pillar];
          const suggestedSpec = COMPETENCY_SPECS.find((s) => s.id === suggestedId);
          const reasoning =
            !hideSuggestionReasoning && suggestedId
              ? suggestionReasoningFor(suggestedId, { targetRole })
              : null;
          const reasoningOpen = openReasoningPillar === pillar;

          return (
            <SuccessDriverCard key={pillar} driver={pillar}>
              <div className="flex flex-wrap items-center gap-2 pr-8">
                <SuccessDriverMark
                  driver={pillar}
                  className="text-body-sm"
                  iconClassName="size-5"
                />
              </div>
              <p className="pr-8 text-caption leading-snug text-text-secondary">
                {meta.description}
              </p>
              <div className="flex flex-col gap-1 pr-8 pb-6">
                {COMPETENCY_SPECS.filter((spec) => spec.pillar === pillar).map(
                  (spec) => {
                    const isLocked = lockedSet.has(spec.id);
                    const isOn = selected.includes(spec.id) || isLocked;
                    const isSingle = selectionMode === "singlePerPillar";
                    return (
                      <label
                        key={spec.id}
                        className={cn(
                          "flex items-center gap-2.5 rounded-md px-1 py-1 text-body-sm transition",
                          isLocked
                            ? "cursor-not-allowed opacity-70"
                            : "cursor-pointer hover:bg-white/40",
                          isOn
                            ? "font-medium text-text-primary"
                            : "text-text-primary",
                        )}
                      >
                        {isSingle ? (
                          <span
                            aria-hidden
                            className={cn(
                              "grid size-[18px] shrink-0 place-items-center rounded-full border-2 border-[#56b8cb] bg-white",
                              isOn && "border-primary",
                            )}
                          >
                            <span
                              className={cn(
                                "size-2.5 rounded-full bg-primary transition",
                                isOn ? "opacity-100" : "opacity-0",
                              )}
                            />
                          </span>
                        ) : (
                          <Checkbox
                            checked={isOn}
                            disabled={isLocked}
                            onCheckedChange={() => {
                              if (!isLocked) onToggle(spec.id);
                            }}
                            className="size-[18px] border-2 border-[#56b8cb] bg-white shadow-none data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                          />
                        )}
                        <span className="min-w-0">
                          {spec.title}
                          {isLocked ? (
                            <span className="ml-1.5 text-caption font-normal text-text-secondary">
                              (already added)
                            </span>
                          ) : null}
                        </span>
                      </label>
                    );
                  },
                )}
              </div>

              {reasoning ? (
                <div
                  className="absolute right-3 bottom-3 z-20 sm:right-4 sm:bottom-4"
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                      setOpenReasoningPillar((current) =>
                        current === pillar ? null : current,
                      );
                    }
                  }}
                >
                  <button
                    type="button"
                    aria-label={`Why ${suggestedSpec?.title ?? "this competency"} was suggested`}
                    aria-expanded={reasoningOpen}
                    onClick={() =>
                      setOpenReasoningPillar((current) =>
                        current === pillar ? null : pillar,
                      )
                    }
                    className="grid size-8 place-items-center rounded-full text-text-secondary transition hover:bg-white/70 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                  >
                    <CircleHelp className="size-4" strokeWidth={2} aria-hidden />
                  </button>
                  {reasoningOpen ? (
                    <div
                      role="tooltip"
                      className="absolute right-0 bottom-[calc(100%+8px)] w-[min(18rem,calc(100vw-3rem))] rounded-lg border border-border bg-white p-3 text-left text-caption leading-snug text-text-primary shadow-[0_8px_20px_rgba(14,154,181,0.12)]"
                    >
                      <p className="mb-1 font-medium text-extended-cyan-green">
                        Why we suggested {suggestedSpec?.title}
                      </p>
                      <p>{reasoning}</p>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </SuccessDriverCard>
          );
        })}
      </div>

      <p className="mt-5 text-agent-question text-text-primary">{helperText}</p>

      {error ? <div className="text-body-sm text-destructive">{error}</div> : null}

      <div className="flex flex-wrap gap-3">
        <Button onClick={onConfirm} className="pl-4! pr-2!">
          {confirmLabel}
          <ArrowRight />
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            {cancelLabel}
          </Button>
        ) : null}
        {!hideReset ? (
          <Button variant="outline" onClick={onResetToSuggested}>
            <Undo2 />
            Undo
          </Button>
        ) : null}
      </div>
    </div>
  );
}
