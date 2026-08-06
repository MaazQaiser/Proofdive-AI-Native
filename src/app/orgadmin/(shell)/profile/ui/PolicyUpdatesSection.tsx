"use client";

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ORG_ADMIN_POLICY_UPDATES } from "@/lib/orgAdminPolicyUpdates";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

export function PolicyUpdatesSection() {
  const [acknowledged, setAcknowledged] = useLocalStorageState<string[]>(
    StorageKeys.orgAdminPolicyAcknowledgements,
    [],
  );

  function handleAcknowledge(id: string) {
    setAcknowledged((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Receive Terms & Policy Updates</CardTitle>
        <CardDescription>Stay informed about updates to our terms, privacy policy, and platform policies.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {ORG_ADMIN_POLICY_UPDATES.map((update) => {
          const isAcknowledged = acknowledged.includes(update.id);
          return (
            <div key={update.id} className="flex flex-col gap-2 rounded-md border border-border p-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-col gap-0.5">
                <p className="text-body-sm font-medium text-foreground">{update.title}</p>
                <p className="text-caption text-muted-foreground">Effective {update.effectiveDate}</p>
                <p className="mt-1 text-caption text-muted-foreground">{update.summary}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={update.href} target="_blank">
                    View
                  </Link>
                </Button>
                {isAcknowledged ? (
                  <span className="flex items-center gap-1 text-caption font-medium text-scoring-green-fg">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Acknowledged
                  </span>
                ) : (
                  <Button size="sm" onClick={() => handleAcknowledge(update.id)}>
                    Acknowledge
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
