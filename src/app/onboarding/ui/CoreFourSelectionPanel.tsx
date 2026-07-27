"use client";

import { ArrowRight, Undo2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  SuccessDriverCard,
  SuccessDriverMark,
} from "@/components/ui/success-driver-card";
import { SUCCESS_DRIVERS, SUCCESS_DRIVER_ORDER } from "@/lib/successDrivers";
import {
  COMPETENCY_SPECS,
  type CompetencyId,
  type PillarId,
} from "@/lib/storyboardDraft";
import { cn } from "@/lib/utils";

type CoreFourSelectionPanelProps = {
  selected: CompetencyId[];
  onToggle: (id: CompetencyId) => void;
  onConfirm: () => void;
  onResetToSuggested: () => void;
  error: string | null;
};

export function CoreFourSelectionPanel({
  selected,
  onToggle,
  onConfirm,
  onResetToSuggested,
  error,
}: CoreFourSelectionPanelProps) {
  function selectedCountFor(pillar: PillarId) {
    return COMPETENCY_SPECS.filter(
      (spec) => spec.pillar === pillar && selected.includes(spec.id),
    ).length;
  }

  return (
    <div className="mt-6 flex w-full flex-col gap-3">
      <div className="flex w-full flex-col gap-3">
        {SUCCESS_DRIVER_ORDER.map((pillar) => {
          const meta = SUCCESS_DRIVERS[pillar];
          const count = selectedCountFor(pillar);
          const covered = count > 0;

          return (
            <SuccessDriverCard
              key={pillar}
              driver={pillar}
              selected={covered}
            >
              <div className="flex flex-wrap items-center gap-2">
                <SuccessDriverMark
                  driver={pillar}
                  className="text-body-sm"
                  iconClassName="size-5"
                />
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/90 px-2 py-0.5 text-overline font-medium",
                    covered ? "text-text-primary" : "text-destructive",
                  )}
                >
                  <span
                    className={cn(
                      "size-1.5 shrink-0 rounded-full",
                      covered ? "bg-extended-cyan-green" : "bg-destructive",
                    )}
                    aria-hidden
                  />
                  {covered ? `${count} selected` : "Pick at least one"}
                </span>
              </div>
              <p className="text-caption leading-snug text-text-secondary">
                {meta.description}
              </p>
              <div className="flex flex-col gap-1">
                {COMPETENCY_SPECS.filter((spec) => spec.pillar === pillar).map(
                  (spec) => {
                    const isOn = selected.includes(spec.id);
                    return (
                      <label
                        key={spec.id}
                        className={cn(
                          "flex cursor-pointer items-center gap-2.5 rounded-md px-1 py-1 text-body-sm transition",
                          "hover:bg-white/40",
                          isOn
                            ? "font-medium text-text-primary"
                            : "text-text-primary",
                        )}
                      >
                        <Checkbox
                          checked={isOn}
                          onCheckedChange={() => onToggle(spec.id)}
                          className="size-[18px] border-2 border-[#56b8cb] bg-white shadow-none data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                        />
                        {spec.title}
                      </label>
                    );
                  },
                )}
              </div>
            </SuccessDriverCard>
          );
        })}
      </div>

      {error ? <div className="text-body-sm text-destructive">{error}</div> : null}

      <div className="flex flex-wrap gap-3">
        <Button onClick={onConfirm}>
          Confirm selection
          <ArrowRight />
        </Button>
        <Button variant="outline" onClick={onResetToSuggested}>
          <Undo2 />
          Undo
        </Button>
      </div>
    </div>
  );
}
