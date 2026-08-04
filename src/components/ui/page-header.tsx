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
 * Equal `p-6` padding on all sides; change styles here to keep headers consistent.
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
        "flex min-h-[84px] shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border bg-background p-6",
        sticky && "sticky top-0 z-10",
        bleed && "-mx-6",
        className,
      )}
      {...props}
    />
  );
}
