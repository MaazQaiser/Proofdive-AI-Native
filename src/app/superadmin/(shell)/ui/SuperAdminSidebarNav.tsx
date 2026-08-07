"use client";

import {
  Building2,
  CreditCard,
  Handshake,
  LayoutDashboard,
  LifeBuoy,
  Target,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";

import { cn } from "@/components/cn";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

export const SUPER_ADMIN_NAV_ITEMS: NavItem[] = [
  { href: "/superadmin/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/superadmin/organizations", label: "Organizations", icon: Building2 },
  { href: "/superadmin/payments", label: "Payments", icon: CreditCard },
  { href: "/superadmin/partners", label: "Partners", icon: Handshake },
  { href: "/superadmin/commissions", label: "Commissions", icon: Wallet },
  { href: "/superadmin/candidates", label: "Candidates", icon: Users },
  { href: "/superadmin/competency-engine", label: "Competency Engine", icon: Target },
  { href: "/superadmin/support", label: "Support Requests", icon: LifeBuoy },
];

export function SuperAdminSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-1 lg:flex-col lg:overflow-visible">
      {SUPER_ADMIN_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (pathname?.startsWith(`${href}/`) ?? false);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-caption transition",
              active
                ? "bg-black text-white"
                : "text-[var(--app-muted)] hover:bg-black/[0.04] hover:text-black",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
