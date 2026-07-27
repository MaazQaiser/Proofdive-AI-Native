import * as React from "react";
import Link, { type LinkProps } from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

type CardButtonProps = React.ComponentProps<"button"> & {
  variant?: "primary" | "gray";
  icon: React.ReactNode;
  title: React.ReactNode;
  subtitle: React.ReactNode;
  /** Abstract brand mark in the right column (e.g. `/brand/illustration-1.svg`). */
  illustrationSrc?: string;
  /** Renders as a `next/link` instead of a `<button>` when set. */
  href?: LinkProps["href"];
};

/** Module CTA — content stack on the left, brand illustration as a right column.
 * Whole card is the hit target; a text “Continue →” cue replaces a floating arrow chip.
 * `primary` is the filled teal tile; `gray` is white with accent chrome. */
function CardButton({
  className,
  variant = "primary",
  icon,
  title,
  subtitle,
  illustrationSrc,
  href,
  ...props
}: CardButtonProps) {
  const isPrimary = variant === "primary";

  const content = (
    <div className="relative z-10 flex min-h-0 flex-1 items-stretch gap-3">
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 py-0.5">
        <div className="flex flex-col gap-2.5">
          <div
            className={cn(
              "grid size-9 shrink-0 place-items-center rounded-full [&_svg]:size-[18px]",
              isPrimary
                ? "bg-white/15 text-primary-foreground"
                : "bg-brand-1000 text-primary",
            )}
            aria-hidden
          >
            {icon}
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <p
              className={cn(
                "text-[20px] leading-[1.25] font-semibold tracking-tight",
                isPrimary ? "text-primary-foreground" : "text-text-primary",
              )}
            >
              {title}
            </p>
            <p
              className={cn(
                "text-[13px] leading-snug",
                isPrimary ? "text-brand-900" : "text-text-secondary",
              )}
            >
              {subtitle}
            </p>
          </div>
        </div>

        <span
          className={cn(
            "inline-flex items-center gap-1.5 text-[13px] font-medium transition-transform duration-200 ease-out group-hover:translate-x-0.5",
            isPrimary ? "text-primary-foreground" : "text-primary",
          )}
        >
          Continue
          <ArrowRight className="size-4" aria-hidden />
        </span>
      </div>

      {illustrationSrc ? (
        <div
          aria-hidden
          className="relative flex w-[42%] shrink-0 items-center justify-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={illustrationSrc}
            alt=""
            className={cn(
              "h-[120px] w-auto max-w-[88%] select-none object-contain",
              isPrimary
                ? "opacity-95 [filter:brightness(0)_invert(1)]"
                : "opacity-90",
            )}
          />
        </div>
      ) : null}
    </div>
  );

  const sharedClassName = cn(
    "group relative flex min-h-[168px] w-full flex-col overflow-hidden rounded-2xl border p-4 text-left sm:p-5",
    "transition-[transform,box-shadow,background-color] duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
    "active:scale-[0.985] motion-reduce:transition-none motion-reduce:active:scale-100",
    isPrimary
      ? [
          "border-brand-300 bg-[linear-gradient(160deg,var(--brand-100)_0%,var(--brand-300)_100%)]",
          "shadow-[0_12px_28px_rgba(14,154,181,0.22)]",
          "hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(14,154,181,0.28)]",
          "motion-reduce:hover:translate-y-0",
        ]
      : [
          "border-border/80 bg-white",
          "shadow-[0_10px_24px_rgba(14,154,181,0.08)]",
          "hover:-translate-y-0.5 hover:bg-brand-1000/40 hover:shadow-[0_14px_28px_rgba(14,154,181,0.14)]",
          "motion-reduce:hover:translate-y-0",
        ],
    className,
  );

  if (href) {
    return (
      <Link href={href} data-slot="card-button" className={sharedClassName}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" data-slot="card-button" className={sharedClassName} {...props}>
      {content}
    </button>
  );
}

export { CardButton };
