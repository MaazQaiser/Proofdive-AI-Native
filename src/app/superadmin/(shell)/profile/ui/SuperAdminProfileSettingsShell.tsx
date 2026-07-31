"use client";

import { History, IdCard, KeyRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SettingsNavItem = {
  href: string;
  label: string;
  icon: typeof IdCard;
};

const SETTINGS_NAV_ITEMS: SettingsNavItem[] = [
  { href: "/superadmin/profile", label: "Account Info", icon: IdCard },
  { href: "/superadmin/profile/password", label: "Password and Auth", icon: KeyRound },
  { href: "/superadmin/profile/audit-logs", label: "Audit Logs", icon: History },
];

export function SuperAdminProfileSettingsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <nav aria-label="Profile & Account Management" className="w-full shrink-0 lg:w-60">
        <h1 className="mb-4 text-h5 text-foreground">Profile & Account Management</h1>
        <ul className="flex flex-col gap-0.5">
          {SETTINGS_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md border-l-2 px-3 py-2 text-body-sm transition",
                    active
                      ? "border-primary bg-primary font-medium text-primary-foreground"
                      : "border-transparent text-muted-foreground hover:bg-extended-light-cyan hover:text-extended-green-blue",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
