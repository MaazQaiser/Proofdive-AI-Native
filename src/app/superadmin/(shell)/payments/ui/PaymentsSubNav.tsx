"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/components/cn";

const TABS = [
  { href: "/superadmin/payments", label: "Bundles", match: (p: string) => p === "/superadmin/payments" || p.startsWith("/superadmin/payments/bundles") },
  { href: "/superadmin/payments/set-price", label: "Set Price", match: (p: string) => p.startsWith("/superadmin/payments/set-price") },
  { href: "/superadmin/payments/discounts", label: "Discount Codes", match: (p: string) => p.startsWith("/superadmin/payments/discounts") },
] as const;

export function PaymentsSubNav() {
  const pathname = usePathname() ?? "";

  return (
    <div className="flex w-full shrink-0 flex-wrap items-center gap-1 border-b border-border px-6 pb-0">
      {TABS.map((tab) => {
        const active = tab.match(pathname);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-caption font-semibold transition",
              active
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
