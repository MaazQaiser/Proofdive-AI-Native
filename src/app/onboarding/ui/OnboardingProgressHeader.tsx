import { ArrowLeft, Check, Home } from "lucide-react";
import Link from "next/link";

import { ProgressBar } from "@/components/ui/progress-bar";

type OnboardingProgressHeaderProps = {
  /** 0-100 — how far through the flow the current step is. */
  percent: number;
  onBack?: () => void;
  /** Set on the finished ("done") step — swaps Back for a "Go to Home" link
   * and the percent label for a checkmark + "Completed Onboarding" (Figma
   * node 162:436), instead of a stale "100%"/disabled-Back pairing. */
  homeHref?: string;
};

/** Progress row — Figma "nav" (node 4:733): a "← Back" control, the step's
 * percent, and a filled progress bar beneath. Sits directly under the logo.
 *
 * The Back control always renders (dimmed + non-interactive when `onBack`
 * is absent, e.g. on the very first question) rather than being swapped for
 * empty space — an empty left side reads as lopsided next to the percent
 * label on the right, since nothing else balances that side of the row. */
export function OnboardingProgressHeader({
  percent,
  onBack,
  homeHref,
}: OnboardingProgressHeaderProps) {
  return (
    <div className="sticky top-0 z-20 flex w-full flex-col gap-3 bg-background/90 py-2 backdrop-blur-sm">
      <div className="flex w-full items-start justify-between">
        {homeHref ? (
          <Link
            href={homeHref}
            className="flex shrink-0 items-center gap-2.5 pr-2 text-caption font-medium text-primary transition hover:text-primary/80"
          >
            <Home className="size-5" />
            Go to Home
          </Link>
        ) : (
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
        )}
        {homeHref ? (
          <span className="flex shrink-0 items-center gap-1.5 text-caption font-medium text-text-secondary">
            <Check className="size-5 text-primary" />
            Completed Onboarding
          </span>
        ) : (
          <span className="shrink-0 text-caption font-medium text-text-secondary">
            {Math.round(Math.min(100, Math.max(0, percent)))}%
          </span>
        )}
      </div>
      <ProgressBar
        value={percent}
        indicatorClassName="border-none bg-[linear-gradient(90deg,var(--brand-100),var(--brand-600))]"
      />
    </div>
  );
}
