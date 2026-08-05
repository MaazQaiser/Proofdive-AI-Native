import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";

type OnboardingProgressHeaderProps = {
  /** 0-100 — how far through the flow the current step is. */
  percent: number;
  onBack?: () => void;
};

/** Progress row — Figma "nav" (node 4:733): a "← Back" control, the step's
 * percent, and a filled progress bar beneath. Sits directly under the logo.
 *
 * The Back control always renders (dimmed + non-interactive when `onBack`
 * is absent, e.g. on the very first question) rather than being swapped for
 * empty space — an empty left side reads as lopsided next to the percent
 * label on the right, since nothing else balances that side of the row.
 *
 * Pinned under the logo navbar — the onboarding shell scrolls content below
 * this row, so it stays fixed without needing `sticky`.
 *
 * Not rendered on the finished ("done") step — onboarding is complete, so
 * the progress chrome is omitted. */
export function OnboardingProgressHeader({
  percent,
  onBack,
}: OnboardingProgressHeaderProps) {
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
          {Math.round(Math.min(100, Math.max(0, percent)))}%
        </span>
      </div>
      <ProgressBar
        value={percent}
        indicatorClassName="border-none bg-[linear-gradient(90deg,var(--brand-100),var(--brand-600))]"
      />
    </div>
  );
}
