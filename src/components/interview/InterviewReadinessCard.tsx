"use client";

import { cn } from "@/components/cn";
import { Badge } from "@/components/ui/badge";
import { SuccessDriverInfoTip } from "@/components/ui/success-driver-card";
import { SuccessDriverIcon } from "@/components/ui/success-driver-icon";
import type { InterviewReport } from "@/lib/proofdiveTypes";
import {
  scoringBadgeClass,
  scoringBandEntry,
  scoringBandForScore,
  scoringLabelForScore,
} from "@/lib/scoringPalette";
import {
  SUCCESS_DRIVER_ORDER,
  SUCCESS_DRIVERS,
  type SuccessDriverId,
} from "@/lib/successDrivers";

const READINESS_MAX = 5;

export type InterviewReadinessPillar = {
  id: SuccessDriverId;
  label: string;
  score: number | null;
};

/** Bright scoring fills for large readiness numerals (Figma color/scoring/*). */
function readinessScoreTextClass(score: number | null | undefined): string {
  const type = "font-gilroy";
  if (score == null || !Number.isFinite(score)) return `${type} text-text-secondary`;
  const band = scoringBandForScore(score);
  if (band === "cyan") return `${type} text-scoring-cyan`;
  if (band === "green") return `${type} text-scoring-green`;
  if (band === "yellow") return `${type} text-scoring-yellow`;
  return `${type} text-scoring-red`;
}

/**
 * Status pill for Interview Readiness.
 *
 * Deliberately not its own palette: this card and the scoring key sit on the
 * same Home screen, so "Not ready" here and "Not ready" in the key have to be
 * the same tag. `scoringBadgeClass` is that tag.
 */
function readinessStatusPillClass(scoreOrLabel: number | string | null): string {
  if (scoreOrLabel == null) {
    return "bg-muted text-muted-foreground";
  }
  return scoringBadgeClass(scoreOrLabel);
}

/**
 * A score, and what its band means, on hover or keyboard focus.
 *
 * The number alone tells nobody whether 2.5 is a near miss or a long way
 * off — the report answers that in its scoring key, and the client asked
 * for the same answer wherever the numbers appear. A button, like the
 * product's other info tips, so it is reachable by keyboard and not only
 * by a mouse; it does nothing on click, hence `cursor-help`.
 *
 * `align` decides which edge the bubble hangs from: the pillar scores sit
 * hard against the card's right edge, where a centred bubble would run off.
 */
function ScoreWithBandTip({
  score,
  label,
  align = "left",
  children,
}: {
  score: number | null;
  label: string;
  align?: "left" | "right";
  children: React.ReactNode;
}) {
  if (score == null || !Number.isFinite(score)) {
    return <>{children}</>;
  }
  const band = scoringBandEntry(score);
  return (
    <button
      type="button"
      className="group/band relative inline-flex cursor-help items-baseline gap-1 rounded-lg font-gilroy whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      aria-label={`${label} ${score.toFixed(1)} out of ${READINESS_MAX} — ${band.label}. ${band.meaning}`}
    >
      {children}
      <span
        role="tooltip"
        className={cn(
          /* `whitespace-normal` is load-bearing: the button around the
             numerals is `whitespace-nowrap` so "2.4 /5" cannot break, and
             the bubble inherits that — without this the sentence runs
             straight out of its own background. */
          "pointer-events-none absolute top-full z-20 mt-2 w-max max-w-[260px] rounded-xl bg-foreground px-3 py-2 text-left font-sans text-caption leading-4 font-normal tracking-normal whitespace-normal text-background opacity-0 transition group-hover/band:opacity-100 group-focus-visible/band:opacity-100",
          align === "right" ? "right-0" : "left-0",
        )}
      >
        <span className="font-semibold">
          {band.label} · {band.range.replace("–", " – ")}
        </span>
        <span className="mt-1 block opacity-90">{band.meaning}</span>
      </span>
    </button>
  );
}

export function readinessPillarsFromReport(report: InterviewReport): InterviewReadinessPillar[] {
  return SUCCESS_DRIVER_ORDER.map((id) => {
    const driver = report.drivers.find((d) => d.id === id);
    return {
      id,
      label: SUCCESS_DRIVERS[id].shortLabel,
      score: driver && driver.score > 0 ? driver.score : null,
    };
  });
}

type Props = {
  overall: number | null;
  pillars: InterviewReadinessPillar[];
  title?: string;
  className?: string;
  children?: React.ReactNode;
};

export function InterviewReadinessCard({
  overall,
  pillars,
  title = "Interview readiness",
  className,
  children,
}: Props) {
  const overallText = overall == null ? "—" : overall.toFixed(1);
  const bandText = overall != null ? scoringLabelForScore(overall) : "—";
  const bandClass = readinessStatusPillClass(overall);

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-2.5 rounded-[20px] border-[0.5px] border-solid border-border",
        "px-6 py-4 backdrop-blur-[42px]",
        "bg-[linear-gradient(114.96deg,var(--glass-from)_0%,var(--glass-to)_98.96%)]",
        className,
      )}
    >
      <div className="flex w-full flex-wrap items-center justify-between gap-4 py-4">
        <div className="flex min-w-0 flex-1 items-baseline gap-2">
          <ScoreWithBandTip score={overall} label={title}>
            <span
              className={cn(
                "cap-baseline text-[64px] font-normal leading-none tracking-[-3.2px] tabular-nums",
                readinessScoreTextClass(overall),
              )}
            >
              {overallText}
            </span>
            <span className="cap-baseline text-[48px] font-normal leading-none tracking-[-2.4px] text-text-secondary/60">
              /{READINESS_MAX}
            </span>
          </ScoreWithBandTip>
          <span className="cap-baseline text-[16px] font-medium tracking-[-0.5px] text-text-primary">
            {title}
          </span>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-x-2.5 gap-y-0">
          <span className="text-[16px] font-medium tracking-[-0.5px] text-text-primary">
            You are currently
          </span>
          {/* The product's one tag chrome, not a hand-rolled pill: this badge
              and the scoring key's badges sit on the same screen saying the
              same word, so they have to be the same object. */}
          <Badge variant="outline" className={bandClass}>
            {bandText}
          </Badge>
        </div>
      </div>

      <div className="flex w-full flex-col">
        {pillars.map(({ id, label, score }) => {
          const displayScore = score != null && score > 0 ? score : null;
          return (
            <div
              key={id}
              className="flex w-full items-center gap-4 border-t border-extended-green py-[18px]"
            >
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <SuccessDriverIcon driver={id} className="size-4 shrink-0 text-text-primary" />
                <span className="truncate text-[16px] font-medium tracking-[-0.5px] text-text-primary">
                  {label}
                </span>
                <SuccessDriverInfoTip driver={id} />
              </div>
              <ScoreWithBandTip score={displayScore} label={label} align="right">
                <span
                  className={cn(
                    "cap-baseline w-[72px] text-right text-[32px] font-medium leading-none tracking-[-1.6px] tabular-nums",
                    readinessScoreTextClass(displayScore),
                  )}
                >
                  {displayScore != null ? displayScore.toFixed(1) : "—"}
                </span>
                <span className="cap-baseline text-[24px] font-medium leading-none tracking-[-1.2px] text-text-secondary/60">
                  /{READINESS_MAX}
                </span>
              </ScoreWithBandTip>
            </div>
          );
        })}
      </div>
      {children}
    </div>
  );
}
