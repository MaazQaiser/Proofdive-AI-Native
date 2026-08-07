"use client";

import { CheckCircle2, FileText, ScrollText, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { NotificationRow, NotificationsPanel } from "@/components/shell/NotificationsPanel";
import { Button } from "@/components/ui/button";
import {
  SEED_PARTNER_NOTIFICATIONS,
  type PartnerNotification,
} from "@/lib/partnerMockData";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

const timestampFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

function iconFor(kind: PartnerNotification["kind"]) {
  if (kind === "invoice") return FileText;
  if (kind === "referral") return UserPlus;
  return ScrollText;
}

export function PartnerNotificationsPanel() {
  const router = useRouter();
  const [notifications] = useLocalStorageState(
    StorageKeys.partnerNotifications,
    SEED_PARTNER_NOTIFICATIONS,
  );
  const [readIds, setReadIds] = useLocalStorageState<string[]>(
    StorageKeys.partnerNotificationReadIds,
    [],
  );
  const [acknowledged, setAcknowledged] = useLocalStorageState<string[]>(
    StorageKeys.partnerPolicyAcknowledgements,
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

  function handleAcknowledge(policyId: string) {
    setAcknowledged((prev) => (prev.includes(policyId) ? prev : [...prev, policyId]));
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
        const isPolicy = notification.kind === "policy" && notification.policyId;
        const isAcknowledged = isPolicy ? acknowledged.includes(notification.policyId!) : false;

        return (
          <NotificationRow
            key={notification.id}
            unread={unread}
            icon={<Icon className="h-4 w-4" />}
            onActivate={() => {
              markRead(notification.id);
              if (!isPolicy && notification.href) router.push(notification.href);
            }}
            actions={
              isPolicy ? (
                <>
                  {notification.href ? (
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        href={notification.href}
                        target="_blank"
                        onClick={() => markRead(notification.id)}
                      >
                        View
                      </Link>
                    </Button>
                  ) : null}
                  {isAcknowledged ? (
                    <span className="flex items-center gap-1 text-caption font-medium text-scoring-green-fg">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Acknowledged
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => {
                        markRead(notification.id);
                        handleAcknowledge(notification.policyId!);
                      }}
                    >
                      Acknowledge
                    </Button>
                  )}
                </>
              ) : null
            }
          >
            {isPolicy ? (
              <>
                <p className="text-body-sm font-medium text-foreground">
                  {notification.title ?? notification.message}
                </p>
                {notification.effectiveDate ? (
                  <p className="text-caption text-muted-foreground">
                    Effective {notification.effectiveDate}
                  </p>
                ) : null}
                {notification.summary ? (
                  <p className="mt-1 text-caption text-muted-foreground">{notification.summary}</p>
                ) : null}
                <p className="mt-1 text-caption text-muted-foreground">
                  {timestampFormatter.format(new Date(notification.timestamp))}
                </p>
              </>
            ) : (
              <>
                <p className="text-body-sm text-foreground">{notification.message}</p>
                <p className="mt-0.5 text-caption text-muted-foreground">
                  {timestampFormatter.format(new Date(notification.timestamp))}
                </p>
              </>
            )}
          </NotificationRow>
        );
      })}
    </NotificationsPanel>
  );
}
