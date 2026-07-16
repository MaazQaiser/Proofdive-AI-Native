import { Bell, CircleHelp, Settings } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/ui/logo";
import { SuperAdminTopNav } from "./SuperAdminTopNav";

type Props = { children: ReactNode };

export function SuperAdminShell({ children }: Props) {
  return (
    <div className="min-h-screen w-full min-w-[1200px] overflow-x-auto bg-background">
      <header className="sticky top-0 z-20 flex h-14 items-end gap-6 border-b border-border bg-background px-6 print:hidden">
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
            <span className="font-medium text-foreground">Super Admin</span>
          </div>
          <Separator orientation="vertical" className="mb-3 h-4" />
          <div className="mb-3 flex items-center gap-3 text-muted-foreground">
            <button type="button" aria-label="Help" className="hover:text-foreground">
              <CircleHelp className="h-4 w-4" />
            </button>
            <button type="button" aria-label="Settings" className="hover:text-foreground">
              <Settings className="h-4 w-4" />
            </button>
            <Link href="/superadmin/notifications" aria-label="Notifications" className="hover:text-foreground">
              <Bell className="h-4 w-4" />
            </Link>
          </div>
          <Avatar className="mb-2.5 h-8 w-8">
            <AvatarFallback className="bg-muted text-muted-foreground text-caption font-medium">
              SA
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      <main className="min-w-0 p-6">{children}</main>
    </div>
  );
}
