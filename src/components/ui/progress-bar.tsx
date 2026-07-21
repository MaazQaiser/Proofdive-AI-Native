import * as React from "react";

import { cn } from "@/lib/utils";

type ProgressBarProps = React.ComponentProps<"div"> & {
  /** 0-100. Clamped. */
  value: number;
  /** Overrides the fill's border/background (default teal) — e.g. a scoring-band color. */
  indicatorClassName?: string;
};

/** Linear progress bar — Figma "progress" (node 25:7586): teal fill over a
 * light-gray track, e.g. the onboarding step indicator. */
function ProgressBar({ className, value, indicatorClassName, ...props }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      data-slot="progress-bar"
      className={cn("relative h-2 w-full rounded-full bg-surface", className)}
      {...props}
    >
      <div
        className={cn(
          "h-2 rounded-full border border-brand-500 bg-primary transition-[width] duration-300 ease-out",
          indicatorClassName,
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export { ProgressBar };
