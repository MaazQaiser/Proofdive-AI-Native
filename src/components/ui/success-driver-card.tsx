import type { ReactNode } from "react";

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
};

/** Icon + label row — the canonical inline Success Driver heading treatment. */
function SuccessDriverMark({
  driver,
  label = "full",
  className,
  iconClassName,
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
 * Success Driver surface — Figma Competency Selection Cards (332:3921):
 * translucent white diagonal fill, shared `--app-stroke` (Chatbox stroke),
 * soft glow clipped into the bottom-right, plus film-grain noise.
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
        "relative overflow-hidden rounded-[16px] transition",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]",
        className,
      )}
    >
      {/* Fill sits under the glow so the decorative mark reads above the bg. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(127.57deg,rgba(255,255,255,0.8)_0%,rgba(255,255,255,0.5)_98.96%)]"
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
      <div className="relative z-10 flex flex-col gap-2.5 p-6 sm:p-8">
        {badge ? (
          <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/70 bg-white/90 px-2.5 py-1 text-overline font-medium text-text-primary shadow-sm backdrop-blur-sm">
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
};

/** Compact competency chip — Figma node 332:4299 (white fill, #b3effa stroke). */
function SuccessDriverCompetencyPill({
  driver,
  label,
  className,
}: SuccessDriverCompetencyPillProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-[#b3effa] bg-white py-1.5 pl-1.5 pr-3",
        className,
      )}
    >
      <SuccessDriverIcon driver={driver} className="size-4" />
      <span className="text-overline leading-[18px] text-text-primary">{label}</span>
    </div>
  );
}

export { SuccessDriverCard, SuccessDriverMark, SuccessDriverCompetencyPill };
