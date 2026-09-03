"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

/* The concept board's own grain: fine, dense fractal noise. Kept as a CSS
 * layer rather than baked into the plates because grain is the one thing that
 * must not be resampled — flattened into the image it would both smear when
 * the plate is scaled to cover and roughly quadruple the file size. */
const GRAIN_URL =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E\")";

/**
 * The welcome screen's ambient light — the client's Concept 01 board, used as
 * designed, in both themes.
 *
 * Both plates are that board's exact composition, flattened: its glow raster
 * placed on the SVG's own geometry, the group's 50.75 blur, and the four black
 * rects blurred at 186.7 that crush the frame on all four edges. Reproducing
 * that filter stack in CSS would only approximate it, so it is composited once
 * at source resolution. Because the result is nothing but smooth gradients the
 * two plates cost ~12 KB each, against 1.8 MB for the board's own raster.
 *
 * The light plate is the SAME artefact, not an inversion — inverting it turns
 * the teal into muddy pink. The mesh is blended toward white instead of over
 * black, and the vignette crushes to the page instead of to black, so the
 * shapes, the asymmetry and the brand hue all survive; only the register
 * changes, from light emerging out of a dark room to colour blooming on paper.
 *
 * The one thing added on top of the stills: a very slow drift, so the entry
 * screen breathes instead of being wallpaper. Deliberately below the threshold
 * where you would notice it moving — the brief asked for energy, not motion.
 */
export function WelcomeAmbience({
  className,
  /** Overrides the plate's own `bg-cover bg-center` — the dialog crops in on
   *  the glow's core, because at card size the full plate is mostly falloff. */
  plateClassName,
}: {
  className?: string;
  plateClassName?: string;
}) {
  const driftRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = driftRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    /* Driven through the Web Animations API rather than a keyframe in
     * globals.css: this component owns one visual and nothing else needs
     * these frames, so it stays self-contained. Applied to the WRAPPER so a
     * single animation carries both plates. */
    const anim = el.animate(
      [
        { transform: "scale(1.06) translate3d(0, 0, 0)" },
        { transform: "scale(1.12) translate3d(-1.4%, -1%, 0)" },
        { transform: "scale(1.06) translate3d(0.8%, 0.6%, 0)" },
        { transform: "scale(1.06) translate3d(0, 0, 0)" },
      ],
      {
        duration: 46000,
        iterations: Infinity,
        easing: "cubic-bezier(0.45, 0, 0.55, 1)",
      },
    );
    return () => anim.cancel();
  }, []);

  return (
    <div
      aria-hidden
      data-slot="welcome-ambience"
      className={cn(
        "pointer-events-none absolute inset-0 z-0 overflow-hidden",
        className,
      )}
    >
      {/* Scaled past 1 at rest so the drift never exposes an edge. Swapped by
          the `dark:` variant rather than in JS, which keeps the rendered
          markup theme-independent — no hydration mismatch against the
          pre-paint theme bootstrap. */}
      <div
        ref={driftRef}
        className="absolute inset-0 will-change-transform"
        style={{ transform: "scale(1.06)" }}
      >
        <div
          className={cn(
            "absolute inset-0 bg-cover bg-center bg-no-repeat dark:hidden",
            plateClassName,
          )}
          style={{
            backgroundImage: "url(/brand/welcome-ambience-light.webp)",
          }}
        />
        <div
          className={cn(
            "absolute inset-0 hidden bg-cover bg-center bg-no-repeat dark:block",
            plateClassName,
          )}
          style={{ backgroundImage: "url(/brand/welcome-ambience.webp)" }}
        />
      </div>

      {/* Grain reads far louder on a light ground, and `overlay` pivots on
          mid-grey — which is right over the dark plate but crushes the pale
          one. Hence a different blend and half the strength in light. */}
      <div
        className="absolute inset-0 opacity-[0.1] mix-blend-soft-light dark:opacity-[0.22] dark:mix-blend-overlay"
        style={{
          backgroundImage: GRAIN_URL,
          backgroundRepeat: "repeat",
          backgroundSize: "170px 170px",
        }}
      />
    </div>
  );
}
