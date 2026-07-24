import type { ReactNode } from "react";

import { SuccessDriverIcon } from "@/components/ui/success-driver-icon";
import {
  SUCCESS_DRIVER_COLORS,
  SUCCESS_DRIVERS,
  type SuccessDriverId,
} from "@/lib/successDrivers";
import { cn } from "@/lib/utils";

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
  const colors = SUCCESS_DRIVER_COLORS[driver];
  const text =
    label === "full" ? meta.label : label === "short" ? meta.shortLabel : null;

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <SuccessDriverIcon
        driver={driver}
        className={cn("size-5", colors.accent, iconClassName)}
      />
      {text ? (
        <span className={cn("min-w-0 truncate font-semibold", colors.fg)}>
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

/** Pastel Success Driver surface with an enlarged, blurred, grainy brand
 * symbol bleeding off the left edge. Content sits relatively above the art. */
function SuccessDriverCard({
  driver,
  children,
  className,
  badge,
  selected = false,
}: SuccessDriverCardProps) {
  const colors = SUCCESS_DRIVER_COLORS[driver];

  return (
    <div
      data-slot="success-driver-card"
      data-driver={driver}
      className={cn(
        "relative overflow-hidden rounded-lg border transition",
        colors.bg,
        selected
          ? cn(
              "border-transparent ring-2 ring-offset-2 ring-offset-background",
              colors.ring,
            )
          : "border-transparent",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -left-10 top-1/2 -translate-y-1/2 select-none"
        aria-hidden
      >
        <SuccessDriverIcon
          driver={driver}
          className={cn(
            "size-[11.5rem] opacity-55 blur-[18px] sm:size-[13rem]",
            colors.symbol,
          )}
        />
      </div>
      <div className="success-driver-noise absolute inset-0" aria-hidden />
      <div className="relative z-10 flex flex-col gap-3 py-5 pl-16 pr-5 sm:py-6 sm:pl-20 sm:pr-6">
        {badge ? (
          <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/70 bg-white/90 px-2.5 py-1 text-overline font-medium text-text-primary shadow-sm backdrop-blur-sm">
            <span
              className={cn("size-1.5 shrink-0 rounded-full", colors.accentDot)}
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
