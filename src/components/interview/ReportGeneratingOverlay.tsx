"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { Logo } from "@/components/ui/logo";
import { LogoFillProgress } from "@/components/ui/logo-fill-progress";
import { cn } from "@/lib/utils";

const BLOBS = [
  {
    src: "/brand/report-loading/blob-1.png",
    className: "report-loading-blob report-loading-blob--a left-[-22%] top-[-18%]",
  },
  {
    src: "/brand/report-loading/blob-2.png",
    className: "report-loading-blob report-loading-blob--b bottom-[-24%] right-[-20%]",
  },
  {
    src: "/brand/report-loading/blob-3.png",
    className: "report-loading-blob report-loading-blob--c left-[22%] top-[28%]",
  },
] as const;

const STEP_SUBTEXT: Record<string, string> = {
  "Parsing answers": "Reading your transcript and lining up each response.",
  "Mapping competencies":
    "Mapping each answer to competencies and extracting the strongest proof points.",
  "Scoring strengths & gaps": "Scoring where you showed strength — and where the gaps are.",
  "Generating next actions": "Turning the gaps into clear, coachable next actions.",
  "Finalizing report": "Putting the finishing touches on your interview report.",
};

type Props = {
  stepIdx: number;
  steps: readonly string[];
  /** How long each step takes — lets the overlay say how long is left. */
  stepMs?: number;
};

export function ReportGeneratingOverlay({ stepIdx, steps, stepMs = 3_000 }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const safeIdx = Math.min(Math.max(stepIdx, 0), Math.max(steps.length - 1, 0));
  const status = steps[safeIdx] ?? "Generating your report…";
  const subtext =
    STEP_SUBTEXT[status] ??
    "Mapping each answer to competencies and extracting the strongest proof points.";
  const progress =
    steps.length === 0 ? 0 : (Math.min(stepIdx, steps.length) / steps.length) * 100;
  const remainingSeconds = Math.ceil(
    ((steps.length - Math.min(stepIdx, steps.length)) * stepMs) / 1000,
  );

  if (!mounted) return null;

  return createPortal(
    <div
      className="report-loading-overlay fixed inset-0 z-[200] h-dvh w-screen overflow-hidden text-foreground"
      role="status"
      aria-busy="true"
    >
      {/* A brand wash into transparency, so it sits on the page ground in both
          themes; the old wash faded to opaque white and the blur motif was a
          light-only asset, both of which the app canvas has since dropped. */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(to top right, rgb(14 154 181 / 0.3) 0%, transparent 100%)",
        }}
        aria-hidden
      />

      <div className="pointer-events-none absolute inset-0 z-[1]" aria-hidden>
        {BLOBS.map((blob) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={blob.src} src={blob.src} alt="" className={cn(blob.className)} />
        ))}
      </div>

      <div className="relative z-[2] flex h-full w-full flex-col px-6 py-10">
        <div className="flex shrink-0 items-center">
          <Logo size="xxs" className="text-primary" />
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4">
          <LogoFillProgress progress={progress} aria-label="Report generation progress" />

          <div className="flex max-w-3xl flex-col items-center gap-3 text-center">
            <h1
              key={`heading-${status}`}
              aria-live="polite"
              className={cn(
                "text-h1",
                "bg-gradient-to-r from-extended-blue via-brand-100 to-extended-cyan bg-clip-text text-transparent",
                "report-loading-heading",
              )}
            >
              {status}…
            </h1>
            <p
              key={`sub-${status}`}
              className={cn(
                "text-agent-question max-w-2xl text-text-secondary",
                "report-loading-subtext",
              )}
            >
              {subtext}
            </p>
            {/* Where we are and how long is left — the two things a wait has to
                say for the user to feel held rather than stuck. */}
            <p
              className="text-overline font-medium uppercase tracking-wide text-text-secondary"
              aria-live="polite"
            >
              Step {safeIdx + 1} of {steps.length}
              {remainingSeconds > 0 ? ` · about ${remainingSeconds}s left` : " · opening your report"}
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
