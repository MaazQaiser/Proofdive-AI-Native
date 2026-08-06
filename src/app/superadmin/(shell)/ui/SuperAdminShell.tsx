"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import {
  isRoleHubPath,
  ROLE_HUB_MOTIF_CLASS,
  ROLE_SHELL_HEADER_SURFACE_CLASS,
  ROLE_SHELL_ROOT_CANVAS_CLASS,
} from "@/components/shell/roleShellCanvas";
import { RoleShellUtilityActions } from "@/components/shell/RoleShellUtilityActions";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

import { SuperAdminTopNav } from "./SuperAdminTopNav";
import { SuperAdminUserMenu } from "./SuperAdminUserMenu";

type Props = { children: ReactNode };

export function SuperAdminShell({ children }: Props) {
  const pathname = usePathname();
  const isHub = isRoleHubPath(pathname, "/superadmin/overview");

  return (
    <div
      className={cn(
        "flex h-screen w-full min-w-[1200px] flex-col overflow-x-auto",
        ROLE_SHELL_ROOT_CANVAS_CLASS,
        isHub && ROLE_HUB_MOTIF_CLASS,
      )}
    >
      <header className={cn("flex h-14 shrink-0 items-stretch gap-6 px-6 print:hidden", ROLE_SHELL_HEADER_SURFACE_CLASS)}>
        <Link
          href="/superadmin/overview"
          className="flex shrink-0 items-center border-r border-border pr-6"
        >
          <Logo size="xxs" />
        </Link>
        <SuperAdminTopNav />
        <div className="ml-auto flex h-full shrink-0 items-center gap-4 border-l border-border pl-6">
          <RoleShellUtilityActions
            settingsHref="/superadmin/profile"
            notificationsHref="/superadmin/notifications"
          />
          <SuperAdminUserMenu />
        </div>
      </header>

      <main className="relative z-[2] min-h-0 min-w-0 flex-1 overflow-y-auto px-6 pb-6">{children}</main>
    </div>
  );
}
