import { Bell, CircleHelp, Settings } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

function HeaderIconTooltip({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span className={cn("group relative inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute top-full left-1/2 z-50 mt-2 -translate-x-1/2 rounded-md bg-foreground px-2 py-1 text-overline whitespace-nowrap text-background opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}

type RoleShellUtilityActionsProps = {
  settingsHref: string;
  notificationsHref: string;
  className?: string;
};

/** Help / Settings / Notifications icons with hover tooltips for role shell headers. */
export function RoleShellUtilityActions({
  settingsHref,
  notificationsHref,
  className,
}: RoleShellUtilityActionsProps) {
  return (
    <div className={cn("flex items-center gap-3 text-muted-foreground", className)}>
      <HeaderIconTooltip label="Help">
        <button type="button" aria-label="Help" className="hover:text-foreground">
          <CircleHelp className="h-4 w-4" />
        </button>
      </HeaderIconTooltip>
      <HeaderIconTooltip label="Settings">
        <Link href={settingsHref} aria-label="Settings" className="hover:text-foreground">
          <Settings className="h-4 w-4" />
        </Link>
      </HeaderIconTooltip>
      <HeaderIconTooltip label="Notifications">
        <Link href={notificationsHref} aria-label="Notifications" className="hover:text-foreground">
          <Bell className="h-4 w-4" />
        </Link>
      </HeaderIconTooltip>
    </div>
  );
}
