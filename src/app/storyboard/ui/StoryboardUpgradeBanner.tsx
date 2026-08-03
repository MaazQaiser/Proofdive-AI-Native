"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Persistent upgrade prompt when storyboard generation usage is near the plan limit.
 * Intentionally has no dismiss control.
 */
export function StoryboardUpgradeBanner() {
  return (
    <div
      role="alert"
      aria-live="polite"
      className="mb-6 flex w-full flex-col gap-3 rounded-lg border border-scoring-yellow/40 bg-scoring-yellow/15 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 items-start gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-scoring-yellow-fg" />
        <div className="min-w-0 space-y-1">
          <p className="text-body-sm font-medium text-foreground">
            You&apos;re nearing your storyboard generation limit
          </p>
          <p className="text-caption leading-5 text-muted-foreground">
            Upgrade your subscription or purchase storyboard add-ons to keep generating new
            storyboards without interruption.
          </p>
        </div>
      </div>
      <Button asChild size="sm" className="shrink-0 self-stretch sm:self-center">
        <Link href="/profile/billing?addon=storyboard">Upgrade subscription</Link>
      </Button>
    </div>
  );
}
