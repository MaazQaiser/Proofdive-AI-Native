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

/** Fill duration — covers typing “Preparing roadmap” plus the post-type hold. */
const FILL_DURATION_MS = 4200;

/**
 * Full-screen preparing state for Coach “View Roadmap” — same logo-fill
 * animation language as the interview report-generating overlay.
 */
export function RoadmapPreparingOverlay() {
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setProgress(100));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="report-loading-overlay fixed inset-0 z-[200] h-dvh w-screen overflow-hidden text-foreground"
      role="status"
      aria-busy="true"
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(to top right, rgb(14 154 181 / 0.3) 0%, rgb(255 255 255 / 1) 100%)",
        }}
        aria-hidden
      />

      <div
        className="pointer-events-none absolute left-0 top-[191px] z-0 h-[894px] w-[min(1024px,100%)] bg-[url('/brand/candidate-bg-blur.png')] bg-left-top bg-contain bg-no-repeat"
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
          <Logo size="xxs" />
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4">
          <LogoFillProgress
            progress={progress}
            durationMs={FILL_DURATION_MS}
            aria-label="Preparing roadmap progress"
          />

          <div className="flex max-w-3xl flex-col items-center gap-3 text-center">
            <h1
              aria-live="polite"
              className={cn(
                "text-h1",
                "bg-gradient-to-r from-extended-blue via-brand-100 to-extended-cyan bg-clip-text text-transparent",
                "report-loading-heading",
              )}
            >
              Preparing roadmap…
            </h1>
            <p
              className={cn(
                "text-agent-question max-w-2xl text-text-secondary",
                "report-loading-subtext",
              )}
            >
              Building a focused prep path from your role and profile.
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
