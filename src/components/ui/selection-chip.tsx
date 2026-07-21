import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/** Toggle chip — Figma "selection chips" (node 38:324): default/hover/
 * selected states for multi-select fields (e.g. onboarding role picker). */
const selectionChipVariants = cva(
  "inline-flex h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-full border px-4 text-[16px] font-medium leading-[1.3] transition-colors outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      selected: {
        false:
          "border-primary bg-white text-primary hover:border-primary hover:bg-extended-light-cyan",
        true: "border-brand-400 bg-primary text-primary-foreground",
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
