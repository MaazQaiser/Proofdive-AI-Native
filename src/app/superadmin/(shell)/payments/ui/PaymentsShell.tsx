"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";
import { PageHeader } from "@/components/ui/page-header";
import { PageTitle } from "@/components/ui/page-title";

import { PaymentsSubNav } from "./PaymentsSubNav";

export function PaymentsShell({
  title,
  description: _description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const isBundleNested = pathname.startsWith("/superadmin/payments/bundles");
  const isDiscountNew = pathname.startsWith("/superadmin/payments/discounts/new");
  const isDiscountDetail =
    pathname.startsWith("/superadmin/payments/discounts/") && !isDiscountNew;
  const isNestedChrome = isBundleNested || isDiscountNew || isDiscountDetail;

  const breadcrumbParent = isDiscountDetail
    ? { href: "/superadmin/payments/discounts", label: "Discount Codes" }
    : { href: "/superadmin/payments", label: "Payments" };

  if (isNestedChrome) {
    return (
      <div className="flex flex-col gap-8">
        <PageHeader sticky bleed>
          <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <PageBreadcrumb
              parentHref={breadcrumbParent.href}
              parentLabel={breadcrumbParent.label}
              title={title}
            />
            {actions ? (
              <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
            ) : null}
          </div>
        </PageHeader>
        {children}
      </div>
    );
  }

  return (
    <div className="-mx-6 -mb-6 flex h-full flex-col overflow-hidden">
      <PageHeader>
        <PageTitle>{title}</PageTitle>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </PageHeader>
      <PaymentsSubNav />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  );
}
