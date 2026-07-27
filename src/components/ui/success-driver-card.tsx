import type { ReactNode } from "react";

import { SuccessDriverIcon } from "@/components/ui/success-driver-icon";
import {
  SUCCESS_DRIVERS,
  type SuccessDriverId,
} from "@/lib/successDrivers";
import { cn } from "@/lib/utils";

/** Canonical Success Driver symbol fill — brand dark cyan, used app-wide. */
export const SUCCESS_DRIVER_SYMBOL_CLASS = "text-extended-cyan-green";

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
  /** Soft ring when the card is the active / selected driver. */
  selected?: boolean;
};

/** Glass Success Driver surface — light tint of the brand symbol color with a
 * frosted fill, matching border, and a large noisy blur symbol on the right. */
function SuccessDriverCard({
  driver,
  children,
  className,
  badge,
  selected = false,
}: SuccessDriverCardProps) {
  return (
    <div
      data-slot="success-driver-card"
      data-driver={driver}
      className={cn(
        "relative overflow-hidden rounded-lg border transition",
        "bg-[color-mix(in_srgb,var(--extended-cyan-green)_9%,white)] backdrop-blur-xl",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]",
        selected
          ? "border-extended-cyan-green"
          : "border-extended-cyan-green/45",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -right-16 top-1/2 size-[18rem] -translate-y-1/2 select-none sm:-right-20 sm:size-[22rem]"
        aria-hidden
      >
        <SuccessDriverIcon
          driver={driver}
          className={cn(
            "size-full opacity-50 blur-[26px] sm:blur-[30px]",
            SUCCESS_DRIVER_SYMBOL_CLASS,
          )}
        />
      </div>
      <div className="success-driver-noise absolute inset-0" aria-hidden />
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

export { SuccessDriverCard, SuccessDriverMark };
