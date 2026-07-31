"use client";

import { Bell, CheckCircle2, FileText, UserPlus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  SEED_PARTNER_NOTIFICATIONS,
  type PartnerNotification,
} from "@/lib/partnerMockData";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import { useLocalStorageState } from "@/lib/useLocalStorageState";
import { cn } from "@/lib/utils";

const timestampFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

function iconFor(kind: PartnerNotification["kind"]) {
  if (kind === "invoice") return FileText;
  if (kind === "referral") return UserPlus;
  return Bell;
}

export function PartnerNotificationsScreen() {
  const [notifications] = useLocalStorageState<PartnerNotification[]>(
    StorageKeys.partnerNotifications,
    SEED_PARTNER_NOTIFICATIONS,
  );
  const [acknowledged, setAcknowledged] = useLocalStorageState<string[]>(
    StorageKeys.partnerPolicyAcknowledgements,
    [],
  );

  function handleAcknowledge(policyId: string) {
    setAcknowledged((prev) => (prev.includes(policyId) ? prev : [...prev, policyId]));
  }

  const sorted = [...notifications].sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-h5 text-foreground">Notifications</h1>
        <p className="mt-0.5 text-caption text-muted-foreground">
          In-app alerts for invoices, referral activity, and policy updates.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inbox</CardTitle>
          <CardDescription>Email delivery is simulated in this prototype.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {sorted.length === 0 ? (
            <p className="py-10 text-center text-caption text-muted-foreground">No notifications available.</p>
          ) : (
            sorted.map((notification) => {
              const Icon = iconFor(notification.kind);
              const isPolicy = notification.kind === "policy" && notification.policyId;
              const isAcknowledged = isPolicy ? acknowledged.includes(notification.policyId!) : false;

              return (
                <div
                  key={notification.id}
                  className={cn(
                    "flex flex-col gap-2 rounded-md border border-border p-4 sm:flex-row sm:items-start sm:justify-between",
                  )}
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
                  {isPolicy ? (
                    <div className="flex shrink-0 items-center gap-2 pl-11 sm:pl-0">
                      {notification.href ? (
                        <Button variant="outline" size="sm" asChild>
                          <Link href={notification.href} target="_blank">
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
                        <Button size="sm" onClick={() => handleAcknowledge(notification.policyId!)}>
                          Acknowledge
                        </Button>
                      )}
                    </div>
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
