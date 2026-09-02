import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/** Toggle chip — Figma "Selectable chip" (node 152:370): default/hover/
 * focused states, each a translucent glass pill (`backdrop-blur`) rather
 * than a flat fill — "focused" in that component is the chosen/active
 * look, which is what this app uses for `selected`.
 *
 * Default (unselected) is a solid `--chip-border` stroke over a
 * `--chip-surface` fill; hover swaps to the light-cyan surface with the
 * flatter `--chip-border-hover` stroke. Those three are tokens rather than
 * literals because the chip's stroke is an AFFORDANCE: on dark surfaces it
 * has to be pushed past 3:1 to stay findable, where the same value would be
 * a shouty outline on white. */
const selectionChipVariants = cva(
  // Text-only: 16px both sides. Leading icon: 8px left / 16px right.
  // Trailing icon: 16px left / 8px right. (Figma action-chip padding.)
  // Use pl/pr (not px) so icon overrides win the cascade cleanly.
  "inline-flex h-9 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border pl-4 pr-4 text-[16px] font-medium leading-[1.3] backdrop-blur-[9px] transition-colors outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-(--disabled-opacity) has-[>svg:first-child]:pl-2 has-[>svg:last-child]:pr-2",
  {
    variants: {
      selected: {
        false:
          "border-chip-border bg-chip-surface text-extended-cyan hover:border-chip-border-hover hover:bg-extended-light-cyan hover:text-extended-blue",
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
