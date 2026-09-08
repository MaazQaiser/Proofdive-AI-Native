"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

import { TypingText } from "@/components/TypingText";
import { AiProgressStatus } from "@/components/onboarding/AiProgressStatus";
import { Logo } from "@/components/ui/logo";

const subscribeNoop = () => () => {};

type Props = {
  stepIdx: number;
  steps: readonly string[];
  /** How long each step takes — lets the caption say how long is left. */
  stepMs?: number;
  /** Names the session in the subtitle ("Reading your Financial Analyst session…"). */
  roleTitle?: string;
};

/**
 * The wait between "End session" and the report.
 *
 * Same shape as the onboarding waits (resume parse, JD draft, Core Four):
 * the flow's agent heading, then `AiProgressStatus` — a named step list, a
 * determinate bar and an honest caption — in the same left-set column on the
 * plain app ground. This used to be its own thing (a centred hero with a
 * gradient headline, a filling logo and drifting blobs), which meant the
 * product's most anxious wait was also the one that looked least like the
 * rest of it. One loading language, so the user already knows how to read
 * this screen by the time they reach it.
 *
 * The step list is owned by the caller (InterviewLiveScreen) and must name
 * what report generation actually does — same rule as every other
 * AiProgressStatus.
 */
export function ReportGeneratingOverlay({
  stepIdx,
  steps,
  stepMs = 3_000,
  roleTitle,
}: Props) {
  // Portal target exists only on the client; this is the hydration-safe way
  // to know that without a setState-in-effect.
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  const safeIdx = Math.min(Math.max(stepIdx, 0), Math.max(steps.length - 1, 0));
  const remainingSeconds = Math.ceil(
    ((steps.length - Math.min(stepIdx, steps.length)) * stepMs) / 1000,
  );

  if (!mounted) return null;

  const role = roleTitle?.trim();

  return createPortal(
    <div
      className="report-loading-overlay fixed inset-0 z-[200] h-dvh w-screen overflow-y-auto text-foreground"
      aria-busy="true"
    >
      <div className="flex min-h-full w-full flex-col px-6 py-10">
        <div className="flex shrink-0 items-center">
          <Logo size="xxs" className="text-primary" />
        </div>

        {/* Same column as the onboarding steps: left-set, capped, vertically
            centred so the heading lands where the flow's questions do. */}
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center py-16">
          <p className="text-overline font-medium uppercase tracking-wide text-text-secondary">
            Session complete
          </p>
          <h1 className="mt-3 text-agent-heading text-extended-blue">
            <TypingText
              key="report-generating"
              text="Drafting your interview report…"
              mode="word"
              cursor={false}
              startDelayMs={200}
            />
          </h1>

          <AiProgressStatus
            className="mt-10 max-w-[30rem]"
            ariaLabel="Drafting your interview report"
            subtitle={
              role
                ? `Reading your ${role} session, one answer at a time.`
                : "Reading your session, one answer at a time."
            }
            steps={steps}
            activeIndex={safeIdx}
            caption={
              remainingSeconds > 0
                ? `About ${remainingSeconds}s left — you'll see the full report next, with what to work on first.`
                : "Opening your report…"
            }
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
