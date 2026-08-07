"use client";

import {
  AlertTriangle,
  Bell,
  Briefcase,
  Building2,
  CreditCard,
  Handshake,
  LifeBuoy,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { NotificationRow, NotificationsPanel } from "@/components/shell/NotificationsPanel";
import {
  SEED_SUPER_ADMIN_NOTIFICATIONS,
  type SuperAdminNotificationKind,
} from "@/lib/superAdminNotificationsData";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

const timestampFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

function iconFor(kind: SuperAdminNotificationKind) {
  switch (kind) {
    case "org_onboarded":
      return Building2;
    case "employer_onboarded":
      return Briefcase;
    case "partner_onboarded":
      return Handshake;
    case "support_request":
      return LifeBuoy;
    case "subscription_request":
      return CreditCard;
    case "deletion_request":
      return Trash2;
    case "subscription_expiring":
    case "subscription_expired":
      return AlertTriangle;
    default:
      return Bell;
  }
}

export function SuperAdminNotificationsPanel() {
  const router = useRouter();
  const [notifications] = useLocalStorageState(
    StorageKeys.superAdminNotifications,
    SEED_SUPER_ADMIN_NOTIFICATIONS,
  );
  const [readIds, setReadIds] = useLocalStorageState<string[]>(
    StorageKeys.superAdminNotificationReadIds,
    [],
  );

  const sorted = [...notifications].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  const hasUnread = sorted.some((n) => !readIds.includes(n.id));

  function markRead(id: string) {
    setReadIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }

  function markAllRead() {
    setReadIds((prev) => Array.from(new Set([...prev, ...sorted.map((n) => n.id)])));
  }

  return (
    <NotificationsPanel
      empty={sorted.length === 0}
      hasUnread={hasUnread}
      onMarkAllRead={markAllRead}
    >
      {sorted.map((notification) => {
        const Icon = iconFor(notification.kind);
        const unread = !readIds.includes(notification.id);
        return (
          <NotificationRow
            key={notification.id}
            unread={unread}
            icon={<Icon className="h-4 w-4" />}
            onActivate={() => {
              markRead(notification.id);
              if (notification.href) router.push(notification.href);
            }}
          >
            <p className="text-body-sm text-foreground">{notification.message}</p>
            <p className="mt-0.5 text-caption text-muted-foreground">
              {timestampFormatter.format(new Date(notification.timestamp))}
            </p>
          </NotificationRow>
        );
      })}
    </NotificationsPanel>
  );
}
