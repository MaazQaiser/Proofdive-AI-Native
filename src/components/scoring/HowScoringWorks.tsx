import { ChevronDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { SCORING_PALETTE, scoringBadgeClass } from "@/lib/scoringPalette";
import { cn } from "@/lib/utils";

/* Highest band first. A scale is read from the best result down, and it puts
 * the band the reader is aiming for at the start of the row rather than the
 * one they are trying to leave. */
const BANDS = [...SCORING_PALETTE].reverse();

/**
 * How the number was made.
 *
 * Collapsed by default — most people want the result, not the rubric — but
 * one click away for anyone who asks "why Borderline?", which is the
 * question the report never answered. The bands come from
 * `SCORING_PALETTE`, the same table that colours every score in the
 * product, so the ranges shown here cannot drift from the ones actually
 * applied.
 *
 * Shared by the current report and the redesigned one on purpose: the
 * client approved this section on the redesign, so the two must not be
 * allowed to diverge into "nearly the same" explanations of the score.
 */
export function HowScoringWorks({ className }: { className?: string }) {
  return (
    <details
      className={cn(
        "group rounded-[16px] border border-border bg-card open:bg-background",
        className,
      )}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-caption font-semibold text-text-primary [&::-webkit-details-marker]:hidden">
        How scoring works
        <ChevronDown
          className="size-4 text-text-secondary transition-transform group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="border-t border-border px-5 py-4">
        <p className="max-w-[68ch] text-caption leading-relaxed text-text-secondary">
          Every answer is scored from 1.0 to 5.0 against the competency it targets. Each
          Success Driver is the average of its three competencies, and your overall is the
          average of the four drivers. Answers that land in the 3–4 minute window with a
          clear Context → Action → Result shape and one measurable outcome score highest.
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-4">
          {BANDS.map((b) => (
            <li
              key={b.band}
              className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2"
            >
              <Badge variant="outline" className={scoringBadgeClass(b.label)}>
                {b.label}
              </Badge>
              {/* The palette stores a tight range ("4.5–5.0"); it is set here
                  with air around the dash, which is what a range reads as at
                  caption size next to a pill. */}
              <span className="font-gilroy text-caption tabular-nums text-text-secondary">
                {b.range.replace("–", " – ")}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
