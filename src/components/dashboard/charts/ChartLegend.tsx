import { cn } from "@/lib/utils";

export type ChartLegendItem = {
  key: string;
  label: string;
  color: string;
};

export function ChartLegend({
  items,
  className,
}: {
  items: ChartLegendItem[];
  className?: string;
}) {
  if (items.length <= 1) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-start gap-x-4 gap-y-1 @min-[36rem]/card-header:justify-end",
        className,
      )}
    >
      {items.map((item) => (
        <div key={item.key} className="flex items-center gap-1.5 text-overline text-muted-foreground">
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
          {item.label}
        </div>
      ))}
    </div>
  );
}
