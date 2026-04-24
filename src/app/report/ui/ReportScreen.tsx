"use client";

import Link from "next/link";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { Card, CardBody } from "@/components/Card";

export function ReportScreen() {
  return (
    <AppShell>
      <Card>
        <CardBody>
          <h2 className="text-5xl font-extrabold leading-[0.95] tracking-tight">
            Report (next)
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--app-muted)]">
            Next step: generate readiness (Star/Ready/Borderline/Not Yet) plus
            4 pillars and 12 competencies with rewrite suggestions and the next
            best action.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/coach?journey=1">
              <Button variant="secondary">Back to Coach</Button>
            </Link>
            <Link href="/training">
              <Button variant="secondary">Go to Training (stub)</Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    </AppShell>
  );
}

