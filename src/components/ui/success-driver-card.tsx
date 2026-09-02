import type { ReactNode } from "react";
import { Info } from "lucide-react";

import { SuccessDriverIcon } from "@/components/ui/success-driver-icon";
import {
  SUCCESS_DRIVERS,
  type SuccessDriverId,
} from "@/lib/successDrivers";
import { cn } from "@/lib/utils";

/** Canonical Success Driver symbol fill — brand dark cyan, used app-wide. */
export const SUCCESS_DRIVER_SYMBOL_CLASS = "text-extended-cyan-green";

/** Card-background-only glow art (not heading icons). */
const CARD_BACKGROUND_SYMBOL: Record<SuccessDriverId, string> = {
  thinking: "/brand/Competency Selection Cards Images/Power of Thinking.png",
  action: "/brand/Competency Selection Cards Images/Power of Action.png",
  people: "/brand/Competency Selection Cards Images/Power of People.png",
  mastery: "/brand/Competency Selection Cards Images/Power of Mastery.png",
};

type SuccessDriverMarkProps = {
  driver: SuccessDriverId;
  /** Prefer full "Power of …" title; pass `short` for compact rows. */
  label?: "full" | "short" | "none";
  className?: string;
  iconClassName?: string;
  /** 16px Lucide info control with hover/focus tooltip (driver description). */
  showInfoTooltip?: boolean;
  infoClassName?: string;
};

type SuccessDriverInfoTipProps = {
  driver: SuccessDriverId;
  className?: string;
};

/** Lucide `Info` — 16px, --text-secondary, tooltip on hover/focus. */
function SuccessDriverInfoTip({ driver, className }: SuccessDriverInfoTipProps) {
  const meta = SUCCESS_DRIVERS[driver];

  return (
    <button
      type="button"
      className={cn(
        "group relative inline-flex size-4 shrink-0 items-center justify-center text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        className,
      )}
      aria-label={`About ${meta.label}`}
    >
      <Info className="size-full" strokeWidth={2} aria-hidden />
      <span
        role="tooltip"
        className="pointer-events-none absolute top-full left-1/2 z-20 mt-2 w-max max-w-[240px] -translate-x-1/2 rounded-xl bg-foreground px-3 py-2 text-left text-caption leading-4 font-normal text-background opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        {meta.description}
      </span>
    </button>
  );
}

/** Icon + label row — the canonical inline Success Driver heading treatment. */
function SuccessDriverMark({
  driver,
  label = "full",
  className,
  iconClassName,
  showInfoTooltip = false,
  infoClassName,
}: SuccessDriverMarkProps) {
  const meta = SUCCESS_DRIVERS[driver];
  const text =
    label === "full" ? meta.label : label === "short" ? meta.shortLabel : null;

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <SuccessDriverIcon
        driver={driver}
        className={cn("size-5", SUCCESS_DRIVER_SYMBOL_CLASS, iconClassName)}
      />
      {text ? (
        <span className="min-w-0 truncate font-semibold text-extended-cyan-green">
          {text}
        </span>
      ) : null}
      {showInfoTooltip ? (
        <SuccessDriverInfoTip driver={driver} className={infoClassName} />
      ) : null}
    </span>
  );
}

type SuccessDriverCardProps = {
  driver: SuccessDriverId;
  children: ReactNode;
  className?: string;
  /** Optional white status pill in the top-left (inspiration pattern). */
  badge?: ReactNode;
};

/**
 * Success Driver surface — Figma Competency Selection Cards (332:3921): a
 * translucent diagonal glass fill, shared `--app-stroke` (Chatbox stroke),
 * soft glow clipped into the bottom-right, plus film-grain noise.
 *
 * The fill and the lit top edge come from `--glass-*` tokens, not literal
 * whites: on a dark surface the same effect is a ~5% light veil, and the
 * grain has to switch blend mode to survive (see globals.css).
 */
function SuccessDriverCard({
  driver,
  children,
  className,
  badge,
}: SuccessDriverCardProps) {
  return (
    <div
      data-slot="success-driver-card"
      data-driver={driver}
      className={cn(
        "relative flex flex-col overflow-hidden rounded-[16px] transition",
        "shadow-[inset_0_1px_0_var(--glass-inset)]",
        className,
      )}
    >
      {/* Fill sits under the glow so the decorative mark reads above the bg. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(127.57deg,var(--glass-from)_0%,var(--glass-to)_98.96%)]"
      />
      <div
        className="pointer-events-none absolute -right-[24px] -bottom-[24px] z-[1] size-[256px] select-none"
        aria-hidden
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative brand glow PNG */}
        <img
          src={CARD_BACKGROUND_SYMBOL[driver]}
          alt=""
          className="size-full object-contain"
        />
      </div>
      <div className="success-driver-noise absolute inset-0 z-[1]" aria-hidden />
      <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-2.5 p-6">
        {badge ? (
          <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[var(--glass-chip-border)] bg-[var(--glass-chip)] px-2.5 py-1 text-overline font-medium text-text-primary shadow-sm backdrop-blur-sm">
            <span
              className="size-1.5 shrink-0 rounded-full bg-extended-cyan-green"
              aria-hidden
            />
            {badge}
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}

type SuccessDriverCompetencyPillProps = {
  driver: SuccessDriverId;
  /** e.g. "Thinking · Analytical Thinking" */
  label: ReactNode;
  className?: string;
  /** `filled` = report-style chip (--pill-surface / --pill-foreground). Default keeps the outlined Figma chip. */
  variant?: "outline" | "filled";
};

/** Compact competency chip — Figma node 332:4299 (card fill, --pill-outline-border stroke). */
function SuccessDriverCompetencyPill({
  driver,
  label,
  className,
  variant = "outline",
}: SuccessDriverCompetencyPillProps) {
  const filled = variant === "filled";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full",
        filled
          ? "h-6 gap-1.5 border border-pill-border bg-pill-surface py-0 pl-1 pr-2"
          : "gap-2 border border-pill-outline-border bg-card py-1.5 pl-1.5 pr-3",
        className,
      )}
    >
      <SuccessDriverIcon
        driver={driver}
        className={cn(filled ? "size-3.5 text-pill-foreground" : "size-4")}
      />
      <span
        className={cn(
          filled
            ? "text-[11px] leading-4 font-medium tracking-[0.5px] text-pill-foreground"
            : "text-overline leading-[18px] text-text-primary",
        )}
      >
        {label}
      </span>
    </span>
  );
}

export {
  SuccessDriverCard,
  SuccessDriverMark,
  SuccessDriverCompetencyPill,
  SuccessDriverInfoTip,
};
