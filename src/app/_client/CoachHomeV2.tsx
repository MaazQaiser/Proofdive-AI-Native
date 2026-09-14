"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowUpRight, ChevronLeft } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { CoachFloatingNav } from "@/components/CoachFloatingNav";
import { COACH_HUB_CONTENT_TOP_CLASS } from "@/components/coachNavLayout";
import { CoachConversationalDock } from "@/components/coach/CoachConversationalDock";
import { JourneyCard } from "@/components/coach/JourneyCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreScale } from "@/components/scoring/ScoreScale";
import {
  InterviewReadinessCard,
  readinessPillarsFromReport,
} from "@/components/interview/InterviewReadinessCard";
import { SUCCESS_DRIVER_ORDER, SUCCESS_DRIVERS } from "@/lib/successDrivers";
import { useCoachJourneyModel } from "@/lib/coachJourneyModel";

/**
 * Home, second version — same page the client signed off on (agent heading,
 * readiness card, the 1-2-3 journey card, the assistant dock), with the
 * three things the audit found missing:
 *
 *   1. The steps carry REAL state. Each row reads its module's own progress
 *      (training phase %, saved Dives, mock reports) and says done / in
 *      progress / up next, with the detail that proves it.
 *   2. One step is clearly the next one. It is picked by the same
 *      `pickRecommendedNextStep` the onboarding plan and the FAQ bot already
 *      use, so Home never disagrees with them.
 *   3. The page derives from data, not from a stored "view" enum. Two users
 *      with the same progress see the same Home, however they got here.
 *
 * Dropped on purpose: the welcome tiles and the 1.6s "Preparing roadmap"
 * overlay — the journey card IS the roadmap, and it is the same for everyone.
 */

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}

export function CoachHomeV2() {
  const model = useCoachJourneyModel();
  const role = model?.role ?? "";
  const firstName = model?.firstName ?? "";

  const heading = useMemo(() => {
    if (!model) return { h2: "", h4: "" };
    const { report, doneCount, recommended } = model;
    if (report) {
      const improving = report.meta.heroVariant === "improving";
      return {
        h2: improving ? "Good news, you're improving." : "You're off to a strong start.",
        h4: report.headline,
      };
    }
    if (doneCount === 0) {
      return {
        h2: firstName ? `Welcome, ${firstName}.` : "Welcome to ProofDive.",
        h4: role
          ? `Three steps to get interview-ready for ${role}. Start with the first.`
          : "Three steps to get interview-ready. Start with the first.",
      };
    }
    return {
      h2: "You're on your way.",
      h4: `${doneCount} of 3 steps done. Next up: ${recommended.title.charAt(0).toLowerCase()}${recommended.title.slice(1)}.`,
    };
  }, [model, firstName, role]);

  const readinessEl = model?.report ? (
    <InterviewReadinessCard
      overall={model.report.overallScore}
      pillars={readinessPillarsFromReport(model.report)}
    >
      {/* The card has no CTA of its own; Home gives it the one it needs — the
          way into the report the numbers came from. */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <span className="text-caption text-text-secondary">
          Latest mock · {fmtDate(model.report.meta.createdAt)} · {model.report.meta.questionCount} questions
        </span>
        <Button asChild variant="outline" size="sm">
          <Link href={`/report/${encodeURIComponent(model.report.meta.id)}`}>
            View full report
            <ArrowUpRight aria-hidden />
          </Link>
        </Button>
      </div>
    </InterviewReadinessCard>
  ) : model ? (
    /* Empty readiness is the FULL card with em-dashes, above the journey —
       the client's call: a new user should see the scoreboard they are about
       to fill in, so the three steps read as the way to fill it. The card's
       footer carries the one honest line about how it fills. */
    <InterviewReadinessCard
      overall={null}
      pillars={SUCCESS_DRIVER_ORDER.map((id) => ({
        id,
        label: SUCCESS_DRIVERS[id].shortLabel,
        score: null,
      }))}
    >
      <p className="border-t border-border pt-4 text-caption text-text-secondary">
        Complete your first mock interview to generate readiness insights across the four
        Success Drivers.
      </p>
    </InterviewReadinessCard>
  ) : null;

  return (
    <AppShell contentTopClassName={COACH_HUB_CONTENT_TOP_CLASS}>
      <CoachFloatingNav />
      <div className="flex min-h-[70vh] flex-col items-start justify-start pb-44">
        <div className="mx-auto mt-0 flex w-full max-w-[840px] flex-col gap-0 px-6 text-left">
          {/* Review chrome: this is the preview, the current Home is one step back. */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/coach"
              className="inline-flex items-center gap-1 text-caption font-medium text-text-secondary hover:text-text-primary"
            >
              <ChevronLeft className="size-4" aria-hidden />
              Current Home
            </Link>
            <Badge>Preview · new Home</Badge>
          </div>

          {model ? (
            <>
              <h2 className="text-agent-heading text-heading-teal">{heading.h2}</h2>
              <h4 className="mt-3 text-agent-question text-text-primary">{heading.h4}</h4>

              {/* Readiness first in every state (see the empty-card note above),
                  then the journey that fills it. */}
              <div className="mt-8 w-full">{readinessEl}</div>
              <JourneyCard model={model} className="mt-8" />
              {/* The key, last: the numbers come first, and the reader who
                  wants to know what they mean is the one who has already
                  read them. Same bands and the same pills as the report's
                  scoring key. It says nothing about this reader's own score
                  — that belongs to the numbers themselves, which explain
                  their own band on hover. */}
              <ScoreScale className="mt-8" />
            </>
          ) : (
            <div className="min-h-[40vh]" aria-hidden />
          )}
        </div>
      </div>

      <CoachConversationalDock />
    </AppShell>
  );
}
