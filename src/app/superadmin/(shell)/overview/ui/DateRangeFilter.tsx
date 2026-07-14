"use client";

import { cn } from "@/components/cn";
import type { DateRangeGranularity } from "@/lib/superAdminMockData";

type Props = {
  value: DateRangeGranularity;
  onChange: (value: DateRangeGranularity) => void;
  options: { value: DateRangeGranularity; label: string }[];
};

export function DateRangeFilter({ value, onChange, options }: Props) {
  return (
    <div
      className="inline-flex items-center gap-1 rounded-full bg-black/[0.04] p-1"
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
              "rounded-full px-4 py-1.5 text-sm font-semibold tracking-tight transition",
              active
                ? "bg-white text-black shadow-sm"
                : "text-[var(--app-muted)] hover:text-black",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
