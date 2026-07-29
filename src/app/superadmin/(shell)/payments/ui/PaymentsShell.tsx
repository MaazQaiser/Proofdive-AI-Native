"use client";

import type { ReactNode } from "react";

import { PaymentsSubNav } from "./PaymentsSubNav";

export function PaymentsShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-h4 text-text-primary">{title}</h1>
          {description ? (
            <p className="mt-1 max-w-2xl text-body-sm text-text-secondary">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      <PaymentsSubNav />
      {children}
    </div>
  );
}
