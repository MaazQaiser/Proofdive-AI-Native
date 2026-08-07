import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/** Circular icon-only button — Figma "Icon Button" (node 38:312): a 28px
 * circle (4px padding around a 20px icon) by default. Distinct from Button's
 * square `size="icon"` (36px, rounded-md), which serves toolbar/table
 * contexts. The larger sizes below consolidate the one-off circular
 * dismiss/close/toggle/play buttons found scattered across the app (chat
 * composer, live interview mic/cam, training video player) onto this one
 * component instead of each reimplementing `rounded-full` by hand. */
const iconButtonVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-full transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  {
    variants: {
      variant: {
        solid: "bg-primary text-primary-foreground hover:bg-primary/90",
        ghost: "text-primary hover:bg-muted",
      },
      size: {
        default: "p-1 [&_svg]:size-5", // 28px
        md: "size-9 [&_svg]:size-4", // 36px — chat composer header controls
        lg: "size-10 [&_svg]:size-5", // 40px — composer full-screen close
        xl: "size-11 [&_svg]:size-5", // 44px — live-interview mic/cam
        "2xl": "size-16 [&_svg]:size-7", // 64px — video play button
      },
    },
    defaultVariants: {
      variant: "solid",
      size: "default",
    },
  },
);

function IconButton({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof iconButtonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="icon-button"
      type={asChild ? undefined : "button"}
      className={cn(iconButtonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { IconButton, iconButtonVariants };
