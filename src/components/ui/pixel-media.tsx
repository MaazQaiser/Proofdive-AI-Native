import { Play } from "lucide-react";

import { cn } from "@/lib/utils";

/** Campaign / video thumbnail with the brand stepped corner. Play affordance
 * sits centered on the media; duration belongs beside the row, not on the thumb.
 *
 * Colors come from the `--media-*` tokens rather than the type ramp. The play
 * plate is a light glass disc in BOTH themes — it sits on arbitrary
 * photography, not on a theme surface — so its glyph is always dark. Using
 * `text-text-primary` here made the glyph near-white on a white plate in dark
 * mode, i.e. an invisible play button. */
export function PixelMedia({
  src,
  alt = "",
  className,
  showPlay = true,
}: {
  src: string;
  alt?: string;
  className?: string;
  /** Centered play mark for video-style thumbs. Default on. */
  showPlay?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden bg-[var(--media-backdrop)]",
        "[clip-path:polygon(0_0,100%_0,100%_72%,88%_72%,88%_100%,0_100%)]",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-[var(--media-veil)]" />
      {showPlay ? (
        <div
          className="absolute inset-0 z-10 grid place-items-center"
          aria-hidden
        >
          <span className="grid size-7 place-items-center rounded-full bg-[var(--media-play-surface)] text-[var(--media-play-foreground)] shadow-sm backdrop-blur-sm">
            <Play className="size-3.5 translate-x-px fill-current" strokeWidth={0} />
          </span>
        </div>
      ) : null}
    </div>
  );
}
