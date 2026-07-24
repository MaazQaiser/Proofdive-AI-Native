"use client";

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
  const pillarsCovered = SUCCESS_DRIVER_ORDER.filter((pillar) =>
    selected.some(
      (id) => COMPETENCY_SPECS.find((s) => s.id === id)?.pillar === pillar,
    ),
  ).length;

  function selectedCountFor(pillar: PillarId) {
    return COMPETENCY_SPECS.filter(
      (spec) => spec.pillar === pillar && selected.includes(spec.id),
    ).length;
  }

  return (
    <div className="mt-6 flex w-full flex-col gap-4">
      <div className="text-body-sm font-semibold text-text-secondary">
        {selected.length} selected across {pillarsCovered}/4 Success Drivers
      </div>

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
              badge={
                covered
                  ? `${count} selected`
                  : "Pick at least one"
              }
              className="min-h-[220px]"
            >
              <SuccessDriverMark
                driver={pillar}
                className="text-body-sm"
                iconClassName="size-5"
              />
              <p className="text-caption leading-5 text-text-secondary">
                {meta.description}
              </p>
              <div className="mt-1 flex flex-col gap-2">
                {COMPETENCY_SPECS.filter((spec) => spec.pillar === pillar).map(
                  (spec) => {
                    const isOn = selected.includes(spec.id);
                    return (
                      <label
                        key={spec.id}
                        className={cn(
                          "flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-body-sm transition",
                          "hover:bg-white/50",
                          isOn ? "bg-white/70 font-medium text-text-primary" : "text-text-primary",
                        )}
                      >
                        <Checkbox
                          checked={isOn}
                          onCheckedChange={() => onToggle(spec.id)}
                          className="size-[18px] border-2 border-text-primary/55 bg-white shadow-sm data-[state=checked]:border-primary data-[state=checked]:bg-primary"
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
        <Button onClick={onConfirm}>Confirm selection</Button>
        <Button variant="outline" onClick={onResetToSuggested}>
          Reset to suggested
        </Button>
      </div>
    </div>
  );
}
