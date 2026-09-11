import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export type StepIndicatorStep = {
  id: string;
  title: string;
};

type StepIndicatorProps = {
  steps: StepIndicatorStep[];
  /** Index of the current step in `steps`, or `-1` on a prelude before them. */
  currentIndex: number;
  /** Names the sequence for screen readers, e.g. "Interview setup steps". */
  label: string;
  /** `compact` is the dialog fit — smaller dots, tighter labels. */
  size?: "default" | "compact";
  /** When given, a step already behind you becomes a button back to it. */
  onStepSelect?: (index: number) => void;
  className?: string;
};

/**
 * Horizontal step indicator — the product's one "where am I in this flow"
 * control.
 *
 * A step is done (check), current (its number, filled), or ahead (its number,
 * outlined), and the rule between two steps only fills once the earlier one
 * is behind you. Written for the Add Organization wizard and generalised
 * here: a stepped dialog and a stepped full-screen wizard should not be two
 * different pictures of the same idea.
 */
export function StepIndicator({
  steps,
  currentIndex,
  label,
  size = "default",
  onStepSelect,
  className,
}: StepIndicatorProps) {
  const compact = size === "compact";

  return (
    <nav aria-label={label} className={cn("w-full", className)}>
      <ol className="flex w-full items-start">
        {steps.map((step, index) => {
          const isCompleted = currentIndex > index;
          const isCurrent = currentIndex === index;
          const isUpcoming = currentIndex < index;

          return (
            <li
              key={step.id}
              /* Every step takes an equal share, including the last: the
                 spacer either side of each dot is what spaces them evenly and
                 leaves the row margins at both ends. */
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center",
                compact ? "gap-1.5" : "gap-2",
              )}
            >
              <div className="flex w-full items-center">
                {index > 0 ? (
                  <div
                    className={cn(
                      "h-px flex-1",
                      isCompleted || isCurrent ? "bg-primary" : "bg-border",
                    )}
                    aria-hidden
                  />
                ) : (
                  <div className="flex-1" aria-hidden />
                )}
                {(() => {
                  const canReturn = isCompleted && Boolean(onStepSelect);
                  const Dot = canReturn ? "button" : "span";
                  return (
                    <Dot
                      {...(canReturn
                        ? {
                            type: "button" as const,
                            onClick: () => onStepSelect?.(index),
                            "aria-label": `Back to ${step.title}`,
                          }
                        : {})}
                      className={cn(
                        "flex shrink-0 items-center justify-center rounded-full border font-semibold",
                        compact ? "size-6 text-overline" : "size-8 text-caption",
                        (isCompleted || isCurrent) &&
                          "border-primary bg-primary text-primary-foreground",
                        isUpcoming && "border-border bg-background text-muted-foreground",
                        canReturn &&
                          "cursor-pointer transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2",
                      )}
                      aria-current={isCurrent ? "step" : undefined}
                    >
                      {isCompleted ? (
                        <Check className={compact ? "size-3" : "size-3.5"} strokeWidth={2.5} />
                      ) : (
                        index + 1
                      )}
                    </Dot>
                  );
                })()}
                {index < steps.length - 1 ? (
                  <div
                    className={cn("h-px flex-1", isCompleted ? "bg-primary" : "bg-border")}
                    aria-hidden
                  />
                ) : (
                  <div className="flex-1" aria-hidden />
                )}
              </div>
              <span
                className={cn(
                  "max-w-[7.5rem] text-center text-overline leading-snug",
                  isCurrent || isCompleted
                    ? "font-medium text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {step.title}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
