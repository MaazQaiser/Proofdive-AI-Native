import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * The one label chrome in the product.
 *
 * Shape and type come from the onboarding "Recommended" tag, which is the look
 * we standardised on: a fully rounded pill, `text-overline` at regular weight,
 * and a soft `secondary` wash rather than a saturated fill — quiet enough to
 * label something without competing with it. Everything that was hand-rolling
 * its own pill now renders this instead, so a tag looks the same on the
 * candidate flow and in the admin portals.
 *
 * `secondary` is the default because the neutral label is the common case;
 * reach for `default` only where a badge has to out-rank a neighbouring one
 * (e.g. "Custom" against "Default"), and for `outline` on a plain ground.
 *
 * NOT this component: `StatusPill` (semantic success/warning/danger status,
 * where the colour is the information), scoring bands, and `SelectionChip`
 * (an interactive control, not a label).
 */
const badgeVariants = cva(
  [
    "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden",
    "whitespace-nowrap rounded-full border border-transparent px-2 py-0.5",
    "text-overline font-normal",
    // Icons are sized here so a tag cannot drift by call site; a caller that
    // genuinely needs another size overrides with `size-*!` on the icon.
    "[&>svg]:pointer-events-none [&>svg]:size-3 [&>svg]:shrink-0",
    "transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
    "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
  ].join(" "),
  {
    variants: {
      variant: {
        secondary:
          "bg-secondary/60 text-secondary-foreground/90 [a&]:hover:bg-secondary/80",
        default: "bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        destructive:
          "bg-destructive text-white focus-visible:ring-destructive/20 [a&]:hover:bg-destructive/90",
        outline:
          "border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "secondary",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
