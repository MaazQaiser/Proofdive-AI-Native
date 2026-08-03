"use client";

import { Bell, CircleHelp, Settings } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/ui/logo";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import {
  SUPER_ADMIN_DEMO_PROFILE,
  type SuperAdminProfile,
} from "@/lib/superAdminProfileData";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

import { SuperAdminTopNav } from "./SuperAdminTopNav";
import { SuperAdminUserMenu } from "./SuperAdminUserMenu";

type Props = { children: ReactNode };

export function SuperAdminShell({ children }: Props) {
  const [overrides] = useLocalStorageState<Partial<SuperAdminProfile>>(
    StorageKeys.superAdminProfileOverrides,
    {},
  );
  const displayName = overrides.fullName ?? SUPER_ADMIN_DEMO_PROFILE.fullName;

  return (
    <div className="flex h-screen w-full min-w-[1200px] flex-col overflow-x-auto bg-background">
      <header className="flex h-14 shrink-0 items-end gap-6 border-b border-border bg-background px-6 print:hidden">
        <Link
          href="/superadmin/overview"
          className="flex h-full shrink-0 items-center border-r border-border pr-6"
        >
          <Logo size="xxs" />
        </Link>
        <SuperAdminTopNav />
        <div className="ml-auto flex h-full shrink-0 items-center gap-4">
          <div className="text-caption flex items-center gap-1 whitespace-nowrap pb-3">
            <span className="text-muted-foreground">Welcome</span>
            <span className="font-medium text-foreground">{displayName}</span>
          </div>
          <Separator orientation="vertical" className="mb-3 h-4" />
          <div className="mb-3 flex items-center gap-3 text-muted-foreground">
            <button type="button" aria-label="Help" className="hover:text-foreground">
              <CircleHelp className="h-4 w-4" />
            </button>
            <Link href="/superadmin/profile" aria-label="Settings" className="hover:text-foreground">
              <Settings className="h-4 w-4" />
            </Link>
            <Link href="/superadmin/notifications" aria-label="Notifications" className="hover:text-foreground">
              <Bell className="h-4 w-4" />
            </Link>
          </div>
          <SuperAdminUserMenu />
        </div>
      </header>

      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto px-6 pb-6">{children}</main>
    </div>
  );
}
