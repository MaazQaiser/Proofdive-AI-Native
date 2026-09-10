import { ChevronDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  SCORING_BANDS_ASC,
  scoringBadgeClass,
  scoringFillClass,
} from "@/lib/scoringPalette";
import { cn } from "@/lib/utils";

const MIN = 1;
const MAX = 5;
const SPAN = MAX - MIN;

/* Each band's share of the 1-5 track, in ascending order — the track runs
 * 1.0 on the left to 5.0 on the right, so the bands must too. A band runs
 * from its own floor to the next band's floor (the table's `range` stops at
 * 2.4 because scores are shown to one decimal, but the scale itself is
 * continuous), and the top band runs to 5.0. Worked out from the table so
 * the drawing cannot drift from the thresholds `scoringBandForScore`
 * actually applies. */
const SEGMENTS = SCORING_BANDS_ASC.map((b, i) => ({
  band: b.band,
  min: b.min,
  share: ((SCORING_BANDS_ASC[i + 1]?.min ?? MAX) - b.min) / SPAN,
}));

/**
 * The scoring key, drawn as the scale it describes.
 *
 * A legend and nothing else: it says what the four bands are and which
 * stretch of 1-5 each one covers. It deliberately carries no reading of
 * the viewer's own score — where they stand is what the numbers above it
 * are for, and each of those explains its own band on hover.
 *
 * The bands are laid out in PROPORTION to the scores they cover, so "Not
 * ready" really is the widest stretch of the scale and the picture cannot
 * flatter or mislead. The pills are the same ones the report's key uses,
 * deliberately: two screens explaining one scale should not invent two
 * vocabularies. Collapsed by default, and built as the same disclosure the
 * report uses, so opening one teaches you how the other behaves.
 */
export function ScoreScale({ className }: { className?: string }) {
  return (
    <details
      className={cn(
        "group w-full rounded-[16px] border border-border bg-card open:bg-background",
        className,
      )}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-caption font-semibold text-text-primary [&::-webkit-details-marker]:hidden">
        How to read these scores
        <ChevronDown
          className="size-4 shrink-0 text-text-secondary transition-transform group-open:rotate-180"
          aria-hidden
        />
      </summary>

      <div className="border-t border-border px-5 py-4">
        <p className="max-w-[68ch] text-caption leading-relaxed text-text-secondary">
          Every answer is scored 1.0 to 5.0 against the competency it targets. Your
          readiness is the average of the four Success Drivers.
        </p>

        <div className="mt-5">
          <div className="flex h-2 w-full overflow-hidden rounded-full">
            {SEGMENTS.map((seg) => (
              <span
                key={seg.band}
                aria-hidden
                className={cn("h-full", scoringFillClass(seg.min))}
                style={{ width: `${seg.share * 100}%` }}
              />
            ))}
          </div>

          <div className="mt-1.5 flex justify-between font-gilroy text-overline tabular-nums text-text-secondary/70">
            <span>1.0</span>
            <span>5.0</span>
          </div>
        </div>

        {/* The key reads in the same direction as the track above it. */}
        <ul className="mt-4 grid gap-2 sm:grid-cols-4">
          {SCORING_BANDS_ASC.map((b) => (
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
