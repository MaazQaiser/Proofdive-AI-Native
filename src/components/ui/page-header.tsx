import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type PageHeaderProps = ComponentProps<"div"> & {
  /** Stick to the top of the scroll container while content scrolls. */
  sticky?: boolean;
  /** Extend edge-to-edge under a parent with horizontal padding (typically `-mx-6`). */
  bleed?: boolean;
};

/**
 * Shared page chrome bar for listing and form screens.
 * Padding: 12px top/bottom, 24px sides (`px-6 py-3`).
 * Sticky headers use a frosted translucent surface so scroll content doesn’t read through.
 */
export function PageHeader({
  className,
  sticky = false,
  bleed = false,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-3",
        sticky &&
          "sticky top-0 z-10 bg-background/75 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60",
        bleed && "-mx-6 w-[calc(100%+3rem)] min-w-0 max-w-none",
        className,
      )}
      {...props}
    />
  );
}
