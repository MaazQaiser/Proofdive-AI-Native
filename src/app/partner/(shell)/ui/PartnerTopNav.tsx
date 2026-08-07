"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string };

export const PARTNER_NAV_ITEMS: NavItem[] = [
  { href: "/partner/overview", label: "Dashboard" },
  { href: "/partner/commissions", label: "Commissions" },
];

export function PartnerTopNav() {
  const pathname = usePathname();
  return (
    <nav className="flex h-full min-w-0 flex-1 items-center gap-1 overflow-x-auto" aria-label="Partner portal">
      {PARTNER_NAV_ITEMS.map(({ href, label }) => {
        const active = pathname === href || pathname?.startsWith(`${href}/`);
        return (
          <Link key={href} href={href} className="flex h-full shrink-0 flex-col items-center justify-between pt-3">
            <span
              className={cn(
                "text-caption rounded-lg px-2 py-1 font-semibold whitespace-nowrap transition",
                active ? "text-primary" : "text-foreground/70 hover:text-foreground",
              )}
            >
              {label}
            </span>
            <span className={cn("mt-2 h-[3px] w-full rounded-full", active ? "bg-primary" : "bg-transparent")} aria-hidden />
          </Link>
        );
      })}
    </nav>
  );
}
