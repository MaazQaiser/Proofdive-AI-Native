import { ArrowLeft } from "lucide-react";

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
 * Not rendered on the finished ("done") step — onboarding is complete, so
 * the progress chrome is omitted and "Go to Home" lives on the composer. */
export function OnboardingProgressHeader({
  percent,
  onBack,
}: OnboardingProgressHeaderProps) {
  return (
    <div className="sticky top-0 z-20 flex w-full flex-col gap-3 bg-background/90 py-2 backdrop-blur-sm">
      <div className="flex w-full items-start justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={!onBack}
          className="flex shrink-0 items-center gap-2.5 pr-2 text-caption font-medium text-text-secondary transition hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
          aria-label="Go back to previous step"
        >
          <ArrowLeft className="size-5" />
          Back
        </button>
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
