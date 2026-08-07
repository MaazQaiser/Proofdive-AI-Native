"use client";

import { CheckCheck } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type NotificationsPanelProps = {
  children: ReactNode;
  className?: string;
  empty?: boolean;
  emptyLabel?: string;
  onMarkAllRead?: () => void;
  hasUnread?: boolean;
};

/** Shared chrome for the header-bell notification center overlay. */
export function NotificationsPanel({
  children,
  className,
  empty = false,
  emptyLabel = "No notifications available.",
  onMarkAllRead,
  hasUnread = false,
}: NotificationsPanelProps) {
  return (
    <div className={cn("flex max-h-[min(70vh,32rem)] w-[min(100vw-2rem,28rem)] flex-col", className)}>
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3">
        <h2 className="text-h5 font-semibold text-foreground">Notifications</h2>
        {onMarkAllRead ? (
          <button
            type="button"
            onClick={onMarkAllRead}
            disabled={!hasUnread}
            className="inline-flex items-center gap-1.5 text-caption font-medium text-primary transition-opacity hover:opacity-80 disabled:pointer-events-none disabled:opacity-40"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all as read
          </button>
        ) : null}
      </div>
      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
        {empty ? (
          <p className="px-4 py-10 text-center text-caption text-muted-foreground">{emptyLabel}</p>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

type NotificationRowProps = {
  unread?: boolean;
  onActivate?: () => void;
  icon: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
};

export function NotificationRow({
  unread = false,
  onActivate,
  icon,
  children,
  actions,
}: NotificationRowProps) {
  return (
    <div
      role={onActivate ? "button" : undefined}
      tabIndex={onActivate ? 0 : undefined}
      onClick={onActivate}
      onKeyDown={
        onActivate
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onActivate();
              }
            }
          : undefined
      }
      className={cn(
        "flex gap-3 border-b border-border px-4 py-3 last:border-b-0",
        onActivate && "cursor-pointer hover:bg-muted/50",
      )}
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-1000 text-[#2f6d8c]">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        {children}
        {actions ? (
          <div
            className="mt-2 flex flex-wrap items-center gap-2"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            {actions}
          </div>
        ) : null}
      </div>
      {unread ? (
        <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />
      ) : (
        <span className="mt-1 size-2 shrink-0" aria-hidden />
      )}
    </div>
  );
}
