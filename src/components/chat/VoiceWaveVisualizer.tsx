import { cn } from "@/lib/utils";

/** Minimal continuous waveform shown while the chat composer mic is listening.
 * A thin stroked SVG path (not bars) that scrolls gently — sits inline with
 * the mic control. SpeechRecognition doesn't expose levels, so motion is CSS. */
export function VoiceWaveVisualizer({ className }: { className?: string }) {
  // Two identical periods so translateX(-50%) loops without a seam.
  const period =
    "M0 8 C3 8 3 4 6 4 S9 12 12 12 S15 4 18 4 S21 12 24 12 S27 4 30 4 S33 12 36 12 S39 4 42 4 S45 12 48 12";
  const tiled = `${period} M48 8 C51 8 51 4 54 4 S57 12 60 12 S63 4 66 4 S69 12 72 12 S75 4 78 4 S81 12 84 12 S87 4 90 4 S93 12 96 12`;

  return (
    <div
      className={cn(
        "voice-wave-track relative h-4 w-12 shrink-0 overflow-hidden text-primary",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label="Listening"
    >
      <svg
        className="voice-wave-scroll absolute inset-y-0 left-0 h-full w-[200%]"
        viewBox="0 0 96 16"
        fill="none"
        aria-hidden
      >
        <path
          d={tiled}
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="sr-only">Listening</span>
    </div>
  );
}
