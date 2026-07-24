"use client";

import { cn } from "@/lib/utils";

type Option<G extends string> = { value: G; label: string };

type Props<G extends string> = {
  value: G;
  onChange: (value: G) => void;
  options: Option<G>[];
};

/** Generic over the granularity union so both Super Admin and Org Admin dashboards can share it. */
export function DateRangeFilter<G extends string>({ value, onChange, options }: Props<G>) {
  return (
    <div
      className="inline-flex items-center gap-1 rounded-full bg-muted p-1"
      role="group"
      aria-label="Date range"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            className={cn(
              "rounded-full border px-4 py-1.5 text-caption transition",
              active
                ? "border-border bg-card text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
