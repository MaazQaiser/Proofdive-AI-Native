import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const ONBOARDING_STEP_LABELS = [
  "Your background",
  "Target",
  "Assessment plan",
  "First session",
] as const;

type OnboardingProgressHeaderProps = {
  /** 0-based index into ONBOARDING_STEP_LABELS. */
  currentIndex: number;
  onBack?: () => void;
};

/** Named-step progress row — "← Back", "Step N of 4", and four labeled
 * segments. Named steps replace the old percent bar: "Step 2 of 4" is
 * honest about remaining cost, where "60%" said nothing about how many
 * questions were left.
 *
 * The Back control always renders (dimmed + non-interactive when `onBack`
 * is absent) rather than being swapped for empty space — an empty left side
 * reads as lopsided next to the step label on the right. */
export function OnboardingProgressHeader({
  currentIndex,
  onBack,
}: OnboardingProgressHeaderProps) {
  const stepNumber = Math.min(currentIndex + 1, ONBOARDING_STEP_LABELS.length);
  return (
    <div className="flex w-full flex-col gap-3 py-2">
      <div className="flex w-full items-start justify-between">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          disabled={!onBack}
          className="h-auto shrink-0 gap-2.5 pl-0! pr-2! text-caption font-medium text-text-secondary hover:bg-transparent hover:text-foreground"
          aria-label="Go back to previous step"
        >
          <ArrowLeft className="size-5" />
          Back
        </Button>
        <span className="shrink-0 text-caption font-medium text-text-secondary">
          Step {stepNumber} of {ONBOARDING_STEP_LABELS.length}
        </span>
      </div>
      <div
        className="grid grid-cols-4 gap-3"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={ONBOARDING_STEP_LABELS.length}
        aria-valuenow={stepNumber}
        aria-valuetext={`Step ${stepNumber} of ${ONBOARDING_STEP_LABELS.length}: ${ONBOARDING_STEP_LABELS[currentIndex]}`}
      >
        {ONBOARDING_STEP_LABELS.map((label, i) => (
          <div key={label} className="flex flex-col gap-2">
            <span
              className={cn(
                "h-1.5 w-full rounded-full",
                i < currentIndex && "bg-primary",
                i === currentIndex &&
                  "bg-[linear-gradient(90deg,var(--brand-100),var(--brand-600))]",
                i > currentIndex && "bg-muted",
              )}
            />
            <span
              className={cn(
                "truncate text-caption",
                i === currentIndex
                  ? "font-medium text-primary"
                  : "text-text-secondary",
                i !== currentIndex && "max-sm:hidden",
              )}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
