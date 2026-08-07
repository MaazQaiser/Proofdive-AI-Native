import { cn } from "@/lib/utils";

type LogoFillProgressProps = {
  /** 0–100 fill amount (clip rises from bottom). */
  progress: number;
  /** CSS transition duration for the fill (default matches report loading). */
  durationMs?: number;
  className?: string;
  "aria-label"?: string;
};

/**
 * Brand mark that fills bottom-up via luminance mask — same treatment as the
 * interview report-generating screen (`ReportGeneratingOverlay`).
 */
export function LogoFillProgress({
  progress,
  durationMs = 2800,
  className,
  "aria-label": ariaLabel = "Loading progress",
}: LogoFillProgressProps) {
  const clipped = Math.min(100, Math.max(0, progress));
  const insetTop = `${100 - clipped}%`;

  return (
    <div
      className={cn("relative size-[88px] shrink-0 sm:size-[112px]", className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clipped)}
      aria-label={ariaLabel}
    >
      <div className="report-loading-logo-mask absolute inset-0 bg-[#d7ebf0]" aria-hidden />
      <div
        className="report-loading-logo-mask absolute inset-0 bg-[#0e9ab5] motion-reduce:transition-none"
        style={{
          clipPath: `inset(${insetTop} 0 0 0)`,
          transition: `clip-path ${durationMs}ms linear`,
        }}
        aria-hidden
      />
    </div>
  );
}
