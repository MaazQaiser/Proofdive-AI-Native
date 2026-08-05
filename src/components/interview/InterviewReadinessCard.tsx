"use client";

import { cn } from "@/components/cn";
import { SuccessDriverInfoTip } from "@/components/ui/success-driver-card";
import { SuccessDriverIcon } from "@/components/ui/success-driver-icon";
import type { InterviewReport } from "@/lib/proofdiveTypes";
import {
  scoringBandForScore,
  scoringLabelForScore,
  type ScoringBand,
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

/** Status pill matching Figma Interview Readiness (solid border + 25% fill). */
function readinessStatusPillClass(scoreOrLabel: number | string | null): string {
  if (scoreOrLabel == null) {
    return "border-border bg-muted text-muted-foreground";
  }
  const band: ScoringBand =
    typeof scoreOrLabel === "number"
      ? scoringBandForScore(scoreOrLabel)
      : labelToScoringBand(scoreOrLabel);
  if (band === "cyan") {
    return "border-scoring-cyan bg-scoring-cyan/25 text-scoring-cyan-fg";
  }
  if (band === "green") {
    return "border-scoring-green bg-scoring-green/25 text-scoring-green";
  }
  if (band === "yellow") {
    return "border-scoring-yellow bg-scoring-yellow/25 text-scoring-yellow-fg";
  }
  return "border-scoring-red bg-scoring-red/25 text-scoring-red";
}

function labelToScoringBand(label: string): ScoringBand {
  const n = label.trim().toLowerCase();
  if (n === "star") return "cyan";
  if (n === "pass" || n === "ready") return "green";
  if (n === "borderline") return "yellow";
  return "red";
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
        "flex w-full flex-col gap-2.5 rounded-[20px] border-[0.5px] border-solid border-[#dde7e9]",
        "px-6 py-4 backdrop-blur-[42px]",
        "bg-[linear-gradient(114.96deg,rgba(255,255,255,0.8)_0%,rgba(255,255,255,0.5)_98.96%)]",
        className,
      )}
    >
      <div className="flex w-full items-center justify-between gap-4 py-4">
        <div className="flex min-w-0 flex-1 items-baseline gap-2">
          <div className="flex shrink-0 items-baseline gap-1 font-gilroy whitespace-nowrap">
            <span
              className={cn(
                "cap-baseline text-[64px] font-normal leading-none tracking-[-3.2px] tabular-nums",
                readinessScoreTextClass(overall),
              )}
            >
              {overallText}
            </span>
            <span className="cap-baseline text-[48px] font-normal leading-none tracking-[-2.4px] text-[#abadb2]">
              /{READINESS_MAX}
            </span>
          </div>
          <span className="cap-baseline text-[16px] font-medium tracking-[-0.5px] text-text-primary">
            {title}
          </span>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-x-2.5 gap-y-0">
          <span className="text-[16px] font-medium tracking-[-0.5px] text-text-primary">
            You are currently
          </span>
          <span
            className={cn(
              "inline-flex items-center justify-center overflow-hidden rounded-full border border-solid px-[9px] py-[3px] text-[12px] font-medium leading-[1.2]",
              bandClass,
            )}
          >
            {bandText}
          </span>
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
              <div className="flex shrink-0 items-baseline gap-1 font-gilroy whitespace-nowrap">
                <span
                  className={cn(
                    "cap-baseline w-[72px] text-right text-[32px] font-medium leading-none tracking-[-1.6px] tabular-nums",
                    readinessScoreTextClass(displayScore),
                  )}
                >
                  {displayScore != null ? displayScore.toFixed(1) : "—"}
                </span>
                <span className="cap-baseline text-[24px] font-medium leading-none tracking-[-1.2px] text-[#abadb2]">
                  /{READINESS_MAX}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      {children}
    </div>
  );
}
