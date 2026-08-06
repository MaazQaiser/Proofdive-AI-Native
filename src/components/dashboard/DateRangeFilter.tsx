"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Option<G extends string> = { value: G; label: string };

type Props<G extends string> = {
  value: G;
  onChange: (value: G) => void;
  options: Option<G>[];
};

/** Generic over the granularity union so both Super Admin and Org Admin dashboards can share it. */
export function DateRangeFilter<G extends string>({ value, onChange, options }: Props<G>) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as G)}>
      <SelectTrigger
        size="sm"
        variant="filter"
        aria-label="Date range"
        className="border border-extended-green-blue/25 px-2.5 py-1.5 text-caption [&_svg]:!size-4"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
