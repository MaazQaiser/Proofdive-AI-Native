import * as React from "react";
import Link, { type LinkProps } from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

type CardButtonProps = React.ComponentProps<"button"> & {
  variant?: "primary" | "gray";
  icon: React.ReactNode;
  title: React.ReactNode;
  subtitle: React.ReactNode;
  /** Abstract brand mark anchored bottom-right (e.g. `/brand/illustration%201.svg`). */
  illustrationSrc?: string;
  /** Renders as a `next/link` instead of a `<button>` when set. */
  href?: LinkProps["href"];
};

/** Module CTA card — layout inspired by dashboard action tiles: title + body
 * top-left, icon top-right, arrow bottom-left, brand illustration bottom-right.
 * `primary` is the filled teal featured tile; `gray` is white with accent chrome. */
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
    <>
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1.5 pr-2">
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
              "max-w-[16ch] text-[13px] leading-snug",
              isPrimary ? "text-brand-900" : "text-text-secondary",
            )}
          >
            {subtitle}
          </p>
        </div>
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
      </div>

      <div className="relative z-10 mt-auto flex items-end justify-between gap-3 pt-8">
        <span
          className={cn(
            "grid size-9 place-items-center rounded-full transition-transform duration-200 ease-out group-hover:translate-x-0.5",
            isPrimary
              ? "bg-white/15 text-primary-foreground"
              : "bg-brand-1000 text-primary",
          )}
          aria-hidden
        >
          <ArrowRight className="size-4" />
        </span>
        {illustrationSrc ? (
          // Decorative — title already names the destination.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={illustrationSrc}
            alt=""
            aria-hidden
            className={cn(
              "pointer-events-none h-[72px] w-auto max-w-[42%] select-none object-contain object-right-bottom",
              !isPrimary && "opacity-90",
            )}
          />
        ) : (
          <span className="h-[72px] w-16 shrink-0" aria-hidden />
        )}
      </div>
    </>
  );

  const sharedClassName = cn(
    "group relative flex min-h-[200px] w-full flex-col overflow-hidden rounded-lg border p-5 text-left",
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
