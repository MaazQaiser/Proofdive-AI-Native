"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

export type BackgroundGlowIntensity = "full" | "soft";

/**
 * Legacy bottom teal wash behind the chat composer.
 *
 * Candidate pages now paint their canvas via `.app-canvas.app-canvas--motif`
 * in `globals.css` (white fill + diagonal wash + blur motif). This portal is
 * kept as a no-op so existing `ChatComposer` call sites stay stable; pass
 * `enabled` only if a surface still needs the old wash.
 */
export function BackgroundGlow({
  className,
  intensity = "soft",
  enabled = false,
}: {
  className?: string;
  intensity?: BackgroundGlowIntensity;
  enabled?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || !enabled) return null;

  return createPortal(
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/onboarding-gradient.png"
      alt=""
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-[1] h-auto w-full select-none print:hidden",
        intensity === "full" ? "opacity-100" : "opacity-40",
        className,
      )}
    />,
    document.body,
  );
}
