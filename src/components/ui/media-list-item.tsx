import type { ReactNode } from "react";

import { PixelMedia } from "@/components/ui/pixel-media";
import { cn } from "@/lib/utils";

/** Horizontal media row — thumbnail with play, title/summary, duration as
 * plain text on the right. Shared across training chapters and similar lists. */
export function MediaListItem({
  imageUrl,
  title,
  summary,
  duration,
  className,
  trailing,
}: {
  imageUrl: string;
  title: ReactNode;
  summary?: ReactNode;
  /** Plain duration text on the right (e.g. "28 min") — never overlaid on the thumb. */
  duration?: string;
  className?: string;
  /** Optional extra content under the summary (e.g. hover CTA). */
  trailing?: ReactNode;
}) {
  return (
    <div className={cn("flex items-start gap-4", className)}>
      <PixelMedia src={imageUrl} className="h-14 w-16 rounded-xl" />
      <div className="min-w-0 flex-1">
        <div className="text-caption font-semibold text-text-primary">{title}</div>
        {summary ? (
          <div className="mt-1 text-caption leading-5 text-text-secondary">{summary}</div>
        ) : null}
        {trailing}
      </div>
      {duration ? (
        <div className="shrink-0 pt-0.5 text-caption text-text-secondary tabular-nums">
          {duration}
        </div>
      ) : null}
    </div>
  );
}
