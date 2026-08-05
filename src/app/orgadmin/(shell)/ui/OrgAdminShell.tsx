"use client";

import { Bell, CircleHelp, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import {
  isRoleHubPath,
  ROLE_HUB_MOTIF_CLASS,
  ROLE_SHELL_HEADER_SURFACE_CLASS,
  ROLE_SHELL_ROOT_CANVAS_CLASS,
} from "@/components/shell/roleShellCanvas";
import { Logo } from "@/components/ui/logo";
import { Separator } from "@/components/ui/separator";
import { ORG_ADMIN_DEMO_ORG } from "@/lib/orgAdminDemo";
import { cn } from "@/lib/utils";

import { OrgAdminTopNav } from "./OrgAdminTopNav";
import { OrgAdminUserMenu } from "./OrgAdminUserMenu";

type Props = { children: ReactNode };

export function OrgAdminShell({ children }: Props) {
  const pathname = usePathname();
  const isHub = isRoleHubPath(pathname, "/orgadmin/overview");

  return (
    <div
      className={cn(
        "flex h-screen w-full min-w-[1200px] flex-col overflow-x-auto",
        ROLE_SHELL_ROOT_CANVAS_CLASS,
        isHub && ROLE_HUB_MOTIF_CLASS,
      )}
    >
      <header className={cn("flex h-14 shrink-0 items-end gap-6 px-6 print:hidden", ROLE_SHELL_HEADER_SURFACE_CLASS)}>
        <Link href="/orgadmin/overview" className="flex h-full shrink-0 items-center border-r border-border pr-6">
          <Logo size="xxs" />
        </Link>
        <OrgAdminTopNav />
        <div className="ml-auto flex h-full shrink-0 items-center gap-4">
          <div className="text-caption flex items-center gap-1 whitespace-nowrap pb-3">
            <span className="text-muted-foreground">Welcome</span>
            <span className="font-medium text-foreground">{ORG_ADMIN_DEMO_ORG.contactName}</span>
          </div>
          <Separator orientation="vertical" className="mb-3 h-4" />
          <div className="mb-3 flex items-center gap-3 text-muted-foreground">
            <button type="button" aria-label="Help" className="hover:text-foreground">
              <CircleHelp className="h-4 w-4" />
            </button>
            <Link href="/orgadmin/profile" aria-label="Settings" className="hover:text-foreground">
              <Settings className="h-4 w-4" />
            </Link>
            <Link href="/orgadmin/notifications" aria-label="Notifications" className="hover:text-foreground">
              <Bell className="h-4 w-4" />
            </Link>
          </div>
          <OrgAdminUserMenu />
        </div>
      </header>

      <main className="relative z-[2] min-h-0 min-w-0 flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
