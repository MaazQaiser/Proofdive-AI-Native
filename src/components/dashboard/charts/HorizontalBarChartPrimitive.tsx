export type HorizontalBarItem = {
  key: string;
  label: string;
  value: number;
  color: string;
};

type Props = {
  items: HorizontalBarItem[];
  maxValue?: number;
  valueFormatter?: (value: number) => string;
};

export function HorizontalBarChartPrimitive({ items, maxValue = 5, valueFormatter }: Props) {
  const format = valueFormatter ?? ((v: number) => v.toFixed(1));

  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => {
        const pct = Math.max(Math.min((item.value / maxValue) * 100, 100), 0);
        return (
          <div key={item.key} className="flex items-center gap-3">
            <span className="w-28 shrink-0 truncate text-caption text-foreground">{item.label}</span>
            <span className="w-10 shrink-0 text-right text-caption font-semibold" style={{ color: item.color }}>
              {format(item.value)}
            </span>
            <div className="h-2.5 flex-1 rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-[width]"
                style={{ width: `${pct}%`, backgroundColor: item.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
