import { Card, CardBody } from "@/components/Card";

type Props = {
  label: string;
  value: string;
  breakdown?: { label: string; value: number }[];
  isEmpty?: boolean;
  emptyMessage?: string;
};

export function KpiCard({
  label,
  value,
  breakdown,
  isEmpty,
  emptyMessage = "No analytics data available.",
}: Props) {
  return (
    <Card>
      <CardBody>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--app-muted)]">
          {label}
        </p>
        {isEmpty ? (
          <p className="mt-3 text-sm font-medium text-[var(--app-muted)]">{emptyMessage}</p>
        ) : (
          <>
            <p className="mt-2 text-3xl font-extrabold tabular-nums tracking-tight text-black">
              {value}
            </p>
            {breakdown && breakdown.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold text-[var(--app-muted)]">
                {breakdown.map((b) => (
                  <span key={b.label}>
                    {b.label}: <span className="text-black">{b.value}</span>
                  </span>
                ))}
              </div>
            ) : null}
          </>
        )}
      </CardBody>
    </Card>
  );
}
