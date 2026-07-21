import * as React from "react";
import Link, { type LinkProps } from "next/link";

import { cn } from "@/lib/utils";

type CardButtonProps = React.ComponentProps<"button"> & {
  variant?: "primary" | "gray";
  icon: React.ReactNode;
  title: React.ReactNode;
  subtitle: React.ReactNode;
  /** Renders as a `next/link` instead of a `<button>` when set. */
  href?: LinkProps["href"];
};

/** Action card — Figma "cardbutton" (node 41:81): primary (teal, e.g.
 * "Storyboard") and gray (white, e.g. "Start mock interview") variants. */
function CardButton({
  className,
  variant = "primary",
  icon,
  title,
  subtitle,
  href,
  ...props
}: CardButtonProps) {
  const isPrimary = variant === "primary";

  const content = (
    <>
      <div
        className={cn(
          "flex size-6 shrink-0 items-center justify-center [&_svg]:size-6",
          isPrimary ? "text-primary-foreground" : "text-primary",
        )}
      >
        {icon}
      </div>
      <div className="flex flex-col items-start gap-1">
        <p
          className={cn(
            "text-[20px] leading-[1.3] font-medium",
            isPrimary ? "text-primary-foreground" : "text-text-primary",
          )}
        >
          {title}
        </p>
        <p
          className={cn(
            "text-[12px] leading-none",
            isPrimary ? "text-brand-900" : "text-text-secondary",
          )}
        >
          {subtitle}
        </p>
      </div>
    </>
  );

  const sharedClassName = cn(
    "flex h-24 w-full items-center gap-4 rounded-2xl border px-6 text-left transition-colors",
    isPrimary
      ? "border-brand-400 bg-primary hover:bg-primary/90"
      : "border-border bg-white hover:bg-muted",
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
