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
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  SEED_SUPER_ADMIN_NOTIFICATIONS,
  type SuperAdminNotification,
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

export function SuperAdminNotificationsScreen() {
  const [notifications] = useLocalStorageState<SuperAdminNotification[]>(
    StorageKeys.superAdminNotifications,
    SEED_SUPER_ADMIN_NOTIFICATIONS,
  );

  const sorted = [...notifications].sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-h5 text-foreground">Notifications</h1>
        <p className="mt-0.5 text-caption text-muted-foreground">
          Platform alerts for onboarding, support, subscriptions, and account events.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notification Center</CardTitle>
          <CardDescription>Most recent notifications appear first.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {sorted.length === 0 ? (
            <p className="py-10 text-center text-caption text-muted-foreground">
              No notifications available.
            </p>
          ) : (
            sorted.map((notification) => {
              const Icon = iconFor(notification.kind);
              return (
                <div
                  key={notification.id}
                  className="flex flex-col gap-2 rounded-md border border-border p-4 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="flex gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-body-sm text-foreground">{notification.message}</p>
                      <p className="text-caption text-muted-foreground">
                        {timestampFormatter.format(new Date(notification.timestamp))}
                      </p>
                    </div>
                  </div>
                  {notification.href ? (
                    <Button variant="outline" size="sm" className="shrink-0 self-start" asChild>
                      <Link href={notification.href}>View</Link>
                    </Button>
                  ) : null}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
