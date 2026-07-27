import { Play } from "lucide-react";

import { cn } from "@/lib/utils";

/** Campaign / video thumbnail with the brand stepped corner. Play affordance
 * sits centered on the media; duration belongs beside the row, not on the thumb. */
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
        "relative shrink-0 overflow-hidden bg-heading-teal",
        "[clip-path:polygon(0_0,100%_0,100%_72%,88%_72%,88%_100%,0_100%)]",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-heading-teal/10" />
      {showPlay ? (
        <div
          className="absolute inset-0 z-10 grid place-items-center"
          aria-hidden
        >
          <span className="grid size-7 place-items-center rounded-full bg-white/90 text-text-primary shadow-sm backdrop-blur-sm">
            <Play className="size-3.5 translate-x-px fill-current" strokeWidth={0} />
          </span>
        </div>
      ) : null}
    </div>
  );
}
