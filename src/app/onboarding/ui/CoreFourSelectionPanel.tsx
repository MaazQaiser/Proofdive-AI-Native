"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { COMPETENCY_SPECS, PILLAR_LABEL, type CompetencyId, type PillarId } from "@/lib/storyboardDraft";

const PILLAR_ORDER: PillarId[] = ["thinking", "action", "people", "mastery"];

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
  const pillarsCovered = PILLAR_ORDER.filter((pillar) =>
    selected.some((id) => COMPETENCY_SPECS.find((s) => s.id === id)?.pillar === pillar),
  ).length;

  return (
    <div className="mt-6 flex w-full flex-col gap-4">
      <div className="text-body-sm font-semibold text-text-secondary">
        {selected.length} selected across {pillarsCovered}/4 Success Drivers
      </div>

      {PILLAR_ORDER.map((pillar) => (
        <Card key={pillar}>
          <CardContent className="flex flex-col gap-3">
            <div className="text-body-sm font-semibold text-text-primary">
              {PILLAR_LABEL[pillar]}
            </div>
            <div className="flex flex-col gap-2">
              {COMPETENCY_SPECS.filter((spec) => spec.pillar === pillar).map((spec) => (
                <label
                  key={spec.id}
                  className="flex cursor-pointer items-center gap-2 text-body-sm text-text-primary"
                >
                  <Checkbox
                    checked={selected.includes(spec.id)}
                    onCheckedChange={() => onToggle(spec.id)}
                  />
                  {spec.title}
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

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
