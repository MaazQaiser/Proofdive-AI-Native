import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * What the AI is doing right now, named.
 *
 * The flow already had this shape on the resume-parse screen and a generic
 * shimmer everywhere else; this is that screen's own pattern, extracted, so
 * every wait in the product speaks the same language instead of each one
 * inventing a loading state.
 *
 * One rule for using it: **the steps must be what the code actually does.**
 * A named sequence that does not correspond to real work is worse than a
 * spinner — it is a spinner that also lies. Each caller's steps are derived
 * from the function it is waiting on, which is also why the lists differ per
 * screen rather than being one global five-step story.
 *
 * `role="status"` carries an implicit polite live region, so the current step
 * is announced as it changes — the shimmer it replaces announced nothing.
 */
export function AiProgressStatus({
  title,
  subtitle,
  ariaLabel,
  steps,
  activeIndex,
  caption,
  className,
}: {
  /** Omitted where the screen's own heading already names the work. */
  title?: string;
  subtitle?: string;
  ariaLabel: string;
  steps: readonly string[];
  /** Index of the step in progress; everything before it is done. */
  activeIndex: number;
  /** Honest expectation-setting under the bar (duration, what happens next). */
  caption?: string;
  className?: string;
}) {
  /* Deliberately derived from the step index rather than a fake percentage:
     the bar says "you are here in a known sequence", which is true, instead of
     implying a precision about completion that nothing here measures. The
     +0.6 puts the fill inside the current step rather than at its start. */
  const percent = Math.min(
    100,
    Math.round(((Math.min(activeIndex, steps.length - 1) + 0.6) / steps.length) * 100),
  );

  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className={cn("flex w-full flex-col gap-5", className)}
    >
      {title || subtitle ? (
        <div className="flex flex-col gap-1">
          {title ? (
            <p className="text-body-sm font-medium text-heading-teal">{title}</p>
          ) : null}
          {subtitle ? (
            <p className="text-caption text-text-secondary">{subtitle}</p>
          ) : null}
        </div>
      ) : null}

      <ul className="flex flex-col gap-2.5">
        {steps.map((label, i) => {
          const isDone = i < activeIndex;
          const isCurrent = i === activeIndex;
          return (
            <li
              key={label}
              className={cn(
                "flex items-center gap-2.5 text-body-sm transition-colors duration-300",
                isDone
                  ? "text-foreground"
                  : isCurrent
                    ? "text-text-secondary"
                    : "text-text-secondary/50",
              )}
            >
              {isDone ? (
                <Check className="size-4 shrink-0 text-primary" aria-hidden />
              ) : (
                <span
                  aria-hidden
                  className={cn(
                    "size-2 shrink-0 rounded-full border transition-colors duration-300",
                    isCurrent ? "border-primary" : "border-border",
                  )}
                />
              )}
              {label}
              {isCurrent ? "…" : ""}
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col gap-2">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,var(--brand-100),var(--brand-600))] transition-[width] duration-700 ease-out motion-reduce:transition-none"
            style={{ width: `${percent}%` }}
          />
        </div>
        {caption ? (
          <p className="text-caption text-text-secondary">{caption}</p>
        ) : null}
      </div>
    </div>
  );
}
