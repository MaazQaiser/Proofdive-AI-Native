"use client";

import {
  Bell,
  Briefcase,
  Building2,
  BookOpen,
  Handshake,
  LayoutDashboard,
  LifeBuoy,
  Target,
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
  { href: "/superadmin/content", label: "Content", icon: BookOpen },
  { href: "/superadmin/partners", label: "Partners", icon: Handshake },
  { href: "/superadmin/employers", label: "Employers", icon: Briefcase },
  { href: "/superadmin/competency-engine", label: "Competency Engine", icon: Target },
  { href: "/superadmin/support", label: "Support Requests", icon: LifeBuoy },
  { href: "/superadmin/notifications", label: "Notifications", icon: Bell },
];

export function SuperAdminSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-1 lg:flex-col lg:overflow-visible">
      {SUPER_ADMIN_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
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
