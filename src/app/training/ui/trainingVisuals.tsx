import { cn } from "@/lib/utils";

/** Campaign thumbnail with a light stepped corner — brand motif without decorative clutter. */
export function PixelMedia({
  src,
  alt = "",
  className,
  duration,
}: {
  src: string;
  alt?: string;
  className?: string;
  duration?: string;
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
      {duration ? (
        <div className="absolute bottom-2 left-2 z-10 inline-flex items-center rounded-lg bg-white/90 px-2 py-1 text-overline text-text-primary backdrop-blur-sm">
          {duration}
        </div>
      ) : null}
    </div>
  );
}

export const TRAINING_CAMPAIGN = {
  1: "/brand/training-campaign-1.png",
  2: "/brand/training-campaign-2.png",
  3: "/brand/training-campaign-3.png",
  4: "/brand/training-campaign-4.png",
  5: "/brand/training-campaign-5.png",
} as const;
