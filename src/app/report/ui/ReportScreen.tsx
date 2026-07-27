"use client";

import Link from "next/link";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ReportScreen() {
  return (
    <AppShell>
      <Card className="gap-0 py-0">
        <CardContent className="p-6">
          <h2 className="text-h3 leading-[0.95]">
            Report (next)
          </h2>
          <p className="mt-4 max-w-2xl text-body-sm leading-7 text-text-secondary">
            Next step: generate readiness (Star/Ready/Borderline/Not Yet) plus
            4 pillars and 12 competencies with rewrite suggestions and the next
            best action.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/coach?journey=1">
              <Button variant="outline">Back to Coach</Button>
            </Link>
            <Link href="/training">
              <Button variant="outline">Go to Training (stub)</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}

