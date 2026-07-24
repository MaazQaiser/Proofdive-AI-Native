"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

export type BackgroundGlowIntensity = "full" | "soft";

/** Ambient teal/cyan wash behind the chat composer — Figma "Background
 * gradient" (node 4:513). Anchored to the bottom of the viewport so the
 * frosted Chatbox reads over the same soft falloff on every candidate
 * surface (onboarding, coach dock, storyboard, interview, etc.).
 *
 * Portaled to `document.body` at a low z-index so it stays under page
 * content / sticky chrome (z-20) and the composer footer (z-40). Rendering
 * it inside the footer stacking context made the tall wash paint over
 * scrolling content.
 *
 * `intensity`: onboarding keeps the full baked wash; other candidate pages
 * dial it down (the PNG's blur is baked in, so strength is controlled via
 * opacity rather than a live CSS blur).
 *
 * Uses the flattened PNG (`/brand/onboarding-gradient.png`) rather than the
 * source SVGs (`/brand/gradient 2.svg` light / `gradient 3.svg` dark): those
 * still carry an opaque page fill + live blur filters, while the PNG has
 * blur/opacity baked in and a top edge that matches `--background`. */
export function BackgroundGlow({
  className,
  intensity = "soft",
}: {
  className?: string;
  intensity?: BackgroundGlowIntensity;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

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
