import { ArrowLeft } from "lucide-react";

import { ProgressBar } from "@/components/ui/progress-bar";

type OnboardingProgressHeaderProps = {
  /** 0-100 — how far through the flow the current step is. */
  percent: number;
  onBack?: () => void;
};

/** Progress row — Figma "nav" (node 4:733): a "← Back" control, the step's
 * percent, and a filled progress bar beneath. Sits directly under the logo. */
export function OnboardingProgressHeader({ percent, onBack }: OnboardingProgressHeaderProps) {
  return (
    <div className="flex w-full flex-col gap-4 py-4">
      <div className="flex w-full items-start justify-between">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="flex shrink-0 items-center gap-2.5 pr-2 text-caption font-medium text-text-secondary transition hover:text-foreground"
            aria-label="Go back to previous step"
          >
            <ArrowLeft className="size-5" />
            Back
          </button>
        ) : (
          <span />
        )}
        <span className="shrink-0 text-caption font-medium text-text-secondary">
          {Math.round(Math.min(100, Math.max(0, percent)))}%
        </span>
      </div>
      <ProgressBar value={percent} />
    </div>
  );
}
