import type { ReactNode } from "react";

import { SuccessDriverIcon } from "@/components/ui/success-driver-icon";
import {
  SUCCESS_DRIVERS,
  type SuccessDriverId,
} from "@/lib/successDrivers";
import { cn } from "@/lib/utils";

/** Canonical Success Driver symbol fill — brand dark cyan, used app-wide. */
export const SUCCESS_DRIVER_SYMBOL_CLASS = "text-extended-cyan-green";

/** Card-background-only art from Competency Selection Cards Images (not heading icons). */
const CARD_BACKGROUND_SYMBOL: Record<SuccessDriverId, string> = {
  thinking: "/brand/Competency Selection Cards Images/Power of Thinking.svg",
  action: "/brand/Competency Selection Cards Images/Power of Action.svg",
  people: "/brand/Competency Selection Cards Images/Power of People.svg",
  mastery: "/brand/Competency Selection Cards Images/Power of Mastery.svg",
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

/** Success Driver surface — white fill with a large soft-blurred symbol
 * tucked into the bottom-right corner, plus film-grain noise. */
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
        "relative overflow-hidden rounded-[16px] border-0 transition",
        "bg-[#ffffff]",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -right-6 -bottom-6 size-[14rem] select-none sm:-right-8 sm:-bottom-8 sm:size-[16rem]"
        aria-hidden
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative brand SVG */}
        <img
          src={CARD_BACKGROUND_SYMBOL[driver]}
          alt=""
          className="size-full object-contain opacity-45 blur-[2.5px] sm:blur-[3px]"
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
