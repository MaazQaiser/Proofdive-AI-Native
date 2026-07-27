import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/** Toggle chip — Figma "Selectable chip" (node 152:370): default/hover/
 * focused states, each a translucent glass pill (`backdrop-blur`) rather
 * than a flat fill — "focused" in that component is the chosen/active
 * look, which is what this app uses for `selected`.
 *
 * The default (unselected, idle) border is Figma's actual "linear1" stroke
 * paint — a top-to-bottom gradient stopping at #F2F2F2 (0%), the
 * extended-light-cyan token (41%), then white (100%) — laid over a fully
 * opaque white fill. A plain `border-color` utility can't express a
 * gradient, so both the fill and the border ring are painted via the
 * standard "double background" trick: one layer clipped to padding-box for
 * the fill, one clipped to border-box for the gradient ring. Hover keeps
 * flat colors (no gradient), routed through the same technique so it fully
 * replaces the default state's `background` shorthand instead of layering
 * a plain `bg-*`/`border-*` utility underneath it. */
const selectionChipVariants = cva(
  // Icon-side 8px / text-side 16px when a leading or trailing SVG is present
  // (Figma action-chip padding). Text-only chips keep symmetric px-4.
  "inline-flex h-9 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border px-4 text-[16px] font-medium leading-[1.3] backdrop-blur-[9px] transition-colors outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 has-[>svg:first-child]:pl-2 has-[>svg:first-child]:pr-4 has-[>svg:last-child]:pl-4 has-[>svg:last-child]:pr-2",
  {
    variants: {
      selected: {
        false:
          "border-transparent text-extended-cyan [background:linear-gradient(#fff,#fff)_padding-box,linear-gradient(180deg,#f2f2f2,var(--extended-light-cyan)_41%,#fff)_border-box] hover:text-extended-blue hover:[background:linear-gradient(var(--extended-light-cyan),var(--extended-light-cyan))_padding-box,linear-gradient(#f2f2f2,#f2f2f2)_border-box]",
        true: "border-brand-200 bg-primary text-brand-1000",
      },
    },
    defaultVariants: {
      selected: false,
    },
  },
);

function SelectionChip({
  className,
  selected,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof selectionChipVariants>) {
  return (
    <button
      type="button"
      data-slot="selection-chip"
      aria-pressed={selected ?? false}
      className={cn(selectionChipVariants({ selected, className }))}
      {...props}
    />
  );
}

export { SelectionChip, selectionChipVariants };
