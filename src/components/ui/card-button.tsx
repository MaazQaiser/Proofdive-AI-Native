import * as React from "react";
import Link, { type LinkProps } from "next/link";
import { ArrowUpRight } from "lucide-react";

import {
  GlassBlurSymbol,
  glassCardSurfaceClasses,
} from "@/components/ui/glass-blur-symbol";
import { cn } from "@/lib/utils";

type CardButtonProps = React.ComponentProps<"button"> & {
  variant?: "primary" | "gray";
  icon: React.ReactNode;
  title: React.ReactNode;
  subtitle: React.ReactNode;
  /** Brand mark rendered as a large blurred glass symbol (e.g. `/brand/illustration-1.svg`). */
  illustrationSrc?: string;
  /** Renders as a `next/link` instead of a `<button>` when set. */
  href?: LinkProps["href"];
};

/** Module CTA — compact left content, diagonal arrow top-right, and a large
 * blurred illustration as a glass symbol (same treatment as SuccessDriverCard).
 * `primary` is the filled teal tile; `gray` is frosted white with accent chrome.
 * Title: `text-body-lg` (20px). Subtitle: `text-caption` (14px). */
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
      {illustrationSrc ? (
        <GlassBlurSymbol src={illustrationSrc} variant={variant} />
      ) : null}

      <span
        className={cn(
          "absolute top-3 right-3 z-10 grid size-8 place-items-center transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0",
          isPrimary ? "text-primary-foreground" : "text-primary",
        )}
        aria-hidden
      >
        <ArrowUpRight className="size-4" strokeWidth={2.25} />
      </span>

      <div className="relative z-10 flex min-w-0 flex-col gap-2.5 pr-10">
        <div
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-full backdrop-blur-sm [&_svg]:size-4",
            isPrimary
              ? "bg-white/20 text-primary-foreground"
              : "bg-brand-1000/80 text-primary",
          )}
          aria-hidden
        >
          {icon}
        </div>
        <div
          className={cn(
            "flex min-w-0 flex-col gap-0.5",
            isPrimary && "[text-shadow:0_1px_2px_rgba(7,62,76,0.28)]",
          )}
        >
          <p
            className={cn(
              "text-body-lg leading-snug font-semibold tracking-tight",
              isPrimary ? "text-primary-foreground" : "text-text-primary",
            )}
          >
            {title}
          </p>
          <p
            className={cn(
              "max-w-[14rem] text-caption leading-snug",
              isPrimary ? "text-primary-foreground/90" : "text-text-secondary",
            )}
          >
            {subtitle}
          </p>
        </div>
      </div>
    </>
  );

  const sharedClassName = cn(
    "group relative flex min-h-[112px] w-full flex-col overflow-hidden rounded-[16px] p-4 text-left",
    "backdrop-blur-xl",
    "transition-[transform,box-shadow,background-color] duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
    "active:scale-[0.985] motion-reduce:transition-none motion-reduce:active:scale-100",
    "hover:-translate-y-0.5 motion-reduce:hover:translate-y-0",
    glassCardSurfaceClasses(variant),
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
