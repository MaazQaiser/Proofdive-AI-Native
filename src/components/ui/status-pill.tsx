import type { LucideIcon } from "lucide-react";
import { CheckCircle2, Clock, Ban, XCircle } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type StatusTone = "success" | "warning" | "danger" | "neutral";

const TONE_CLASS: Record<StatusTone, string> = {
  success: "border-scoring-green/25 bg-scoring-green/15 text-scoring-green-fg",
  warning: "border-scoring-yellow/30 bg-scoring-yellow/20 text-scoring-yellow-fg",
  danger: "border-scoring-red/25 bg-scoring-red/15 text-scoring-red-fg",
  neutral: "border-border bg-muted text-muted-foreground",
};

/** Default icon per tone — override with `icon` when a status needs a more specific glyph. */
export const STATUS_TONE_ICON: Record<StatusTone, LucideIcon> = {
  success: CheckCircle2,
  warning: Clock,
  danger: XCircle,
  neutral: Ban,
};

type Props = {
  tone: StatusTone;
  children: ReactNode;
  /** Defaults to the tone’s standard icon. */
  icon?: LucideIcon;
  className?: string;
};

/**
 * Shared status pill chrome for Superadmin, Org Admin, and Partner portals.
 * Always shows an icon + label with consistent padding and scoring tones.
 */
export function StatusPill({ tone, children, icon, className }: Props) {
  const Icon = icon ?? STATUS_TONE_ICON[tone];

  return (
    <span
      className={cn(
        "text-overline inline-flex h-6 w-fit items-center gap-1 rounded-full border pl-1 pr-2 whitespace-nowrap",
        TONE_CLASS[tone],
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
      {children}
    </span>
  );
}
