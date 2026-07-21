"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string };

/**
 * Only Dashboard is fully built this pass — User Management renders a "Coming Soon" placeholder.
 * Profile, Billing, and Notifications are intentionally not top-nav tabs — Billing now lives inside
 * Profile & Account Management, and Profile/Notifications are reached via the Settings and Bell
 * icons in the header instead (see OrgAdminShell).
 */
export const ORG_ADMIN_NAV_ITEMS: NavItem[] = [
  { href: "/orgadmin/overview", label: "Dashboard" },
  { href: "/orgadmin/users", label: "User Management" },
];

export function OrgAdminTopNav() {
  const pathname = usePathname();
  return (
    <nav className="flex h-full items-center gap-1 overflow-x-auto" aria-label="Organization admin">
      {ORG_ADMIN_NAV_ITEMS.map(({ href, label }) => {
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
