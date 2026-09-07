"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { pickLatestReport, safeParseReportsMap } from "@/lib/interviewReports";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";

/**
 * `/report` with no id. This used to be a placeholder card ("Report (next)",
 * "Go to Training (stub)") that the hub's demo cards linked to. A bare
 * `/report` now means "my latest report": it opens the most recent one on
 * this device, or sends the user back to sessions when there is none. The
 * card below is only ever seen for the instant before the redirect.
 */
export function ReportScreen() {
  const router = useRouter();

  useEffect(() => {
    let latestId: string | null = null;
    try {
      const map = safeParseReportsMap(window.localStorage.getItem(StorageKeys.reports));
      latestId = pickLatestReport(map)?.meta.id ?? null;
    } catch {
      latestId = null;
    }
    router.replace(latestId ? `/report/${encodeURIComponent(latestId)}` : "/interview");
  }, [router]);

  return (
    <AppShell>
      <Card className="gap-0 py-0">
        <CardContent className="p-6">
          <h2 className="text-h5 text-text-primary">Opening your latest report…</h2>
          <p className="mt-2 max-w-2xl text-caption leading-6 text-text-secondary">
            If nothing happens, go back to your sessions and open a report from there.
          </p>
          <div className="mt-6">
            <Button asChild variant="outline">
              <Link href="/interview">Back to sessions</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
