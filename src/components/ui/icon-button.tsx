import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/** Circular icon-only button — Figma "Icon Button" (node 38:312): a 28px
 * circle (4px padding around a 20px icon). Distinct from Button's square
 * `size="icon"` (36px, rounded-md), which serves toolbar/table contexts. */
const iconButtonVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-full p-1 transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0 outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  {
    variants: {
      variant: {
        solid: "bg-primary text-primary-foreground hover:bg-primary/90",
        ghost: "text-primary hover:bg-muted",
      },
    },
    defaultVariants: {
      variant: "solid",
    },
  },
);

function IconButton({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof iconButtonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="icon-button"
      type={asChild ? undefined : "button"}
      className={cn(iconButtonVariants({ variant, className }))}
      {...props}
    />
  );
}

export { IconButton, iconButtonVariants };
