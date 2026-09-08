import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/** Toggle chip — Figma "Selectable chip" (node 152:370): default/hover/
 * focused states, each a translucent glass pill (`backdrop-blur`) rather
 * than a flat fill — "focused" in that component is the chosen/active
 * look, which is what this app uses for `selected`.
 *
 * No stroke (client request: borderless chips across the product). The
 * chip is its fill: unselected sits on `--chip-surface` — white on the
 * off-white page in light mode, a lifted graphite in dark — hover swaps to
 * the light-cyan surface, selected is the brand fill. The surface tokens
 * carry the findability the stroke used to. */
const selectionChipVariants = cva(
  // 16px both sides, icon or not. Figma's action chip tightened the icon
  // side to 8px; without a stroke that asymmetry read as the icon crowding
  // the edge next to text-only chips in the same row, so one padding for all.
  "inline-flex h-9 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full pl-4 pr-4 text-[16px] font-medium leading-[1.3] backdrop-blur-[9px] transition-colors outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-(--disabled-opacity)",
  {
    variants: {
      selected: {
        false:
          "bg-chip-surface text-extended-cyan hover:bg-extended-light-cyan hover:text-extended-blue",
        true: "bg-primary text-brand-1000",
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
