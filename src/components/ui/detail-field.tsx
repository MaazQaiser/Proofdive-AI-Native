import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function DetailField({
  label,
  value,
  className,
  muted = false,
}: {
  label: string;
  value?: ReactNode;
  className?: string;
  muted?: boolean;
}) {
  const empty = value === undefined || value === null || value === "";
  const display = empty ? "—" : value;

  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      <p className="text-overline text-muted-foreground">{label}</p>
      <div
        className={cn(
          "text-body-sm break-words font-normal text-text-primary",
          (muted || empty) && "text-muted-foreground",
        )}
      >
        {display}
      </div>
    </div>
  );
}

export function DetailSection({
  title,
  end,
  children,
  className,
}: {
  title: string;
  end?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-body font-semibold tracking-tight text-foreground">{title}</h3>
        {end ? <div className="shrink-0">{end}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function DetailGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("grid grid-cols-3 gap-x-6 gap-y-4", className)}>{children}</div>;
}
