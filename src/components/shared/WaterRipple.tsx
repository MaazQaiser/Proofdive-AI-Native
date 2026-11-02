"use client";

import { useEffect, useRef } from "react";

import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";

/**
 * Water under a surface: a real (if small) wave simulation, not drawn rings.
 *
 * Ported from the marketing website (Proofdive-Website-, `src/ui/org/ripple.ts`),
 * whose How it works hero carries it — and whose "Start preparing" lands on our
 * sign-up, so the visitor touches the same water on both sides of that click.
 * The physics are the website's, constants and all: every step each cell of a
 * coarse height grid is pulled towards its neighbours and away from where it
 * was (the discrete wave equation), with a little damping, so a disturbance
 * travels out, interferes, reflects off the edges and dies away. The light is
 * worked out from the slope at every cell, lit from the upper left.
 *
 * One deliberate difference. The website paints OPAQUE pixels equal to its
 * section's flat tint and clears when calm; that works on a flat ground. The
 * surfaces here are a gradient, and themed, so an opaque canvas would flatten
 * the gradient while the water moved and snap back when it stilled. So this
 * draws light only: still water is fully transparent, a crest is the glint at
 * an alpha that grows with its slope, a trough the shade the same way — and
 * the ground underneath is whatever the host paints, in either theme.
 *
 * Behaviour, as on the website: a pointer moving over the host trails a wake,
 * deeper the faster it moves; a click drops a stone. Still until touched — no
 * ambient drops, so nothing moves beside a form while someone types. The loop
 * runs only while the water moves and is on screen. The canvas sits behind the
 * host's content with `pointer-events: none` and listens on its parent, so
 * every click still reaches the content. Decorative (aria-hidden); with reduced
 * motion it is never started and the host shows its own ground.
 *
 * Render it as the first child of a `relative overflow-hidden` host.
 */

type RGB = readonly [number, number, number];
type Palette = { glint: RGB; glintMax: number; shade: RGB; shadeMax: number };

/** Light: white glints, and the website's own trough — the brand teal, softened. */
const LIGHT: Palette = { glint: [255, 255, 255], glintMax: 0.85, shade: [118, 178, 196], shadeMax: 0.7 };
/** Dark: light is emitted, not cast — a brand-light glint held lower, an abyss trough. */
const DARK: Palette = { glint: [127, 212, 230], glintMax: 0.5, shade: [1, 22, 27], shadeMax: 0.55 };

const DAMP = 0.978; // energy kept per step: a drop settles in about four seconds
const CELLS = 56000; // about this many cells, whatever the host's size
const STILL = 0.015; // below this the water counts as flat (invisible)
const STEP_MS = 1000 / 60;

export function WaterRipple({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paletteRef = useRef<Palette>(LIGHT);
  const { resolved } = useTheme();

  // A theme flip mid-ripple recolours the next frame; nothing restarts.
  useEffect(() => {
    paletteRef.current = resolved === "dark" ? DARK : LIGHT;
  }, [resolved]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = canvas?.parentElement;
    if (!canvas || !root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const view = canvas.getContext("2d");
    const off = document.createElement("canvas");
    const ctx = off.getContext("2d");
    if (!view || !ctx) return;
    const v = view;
    const c = ctx;

    let cell = 5;
    let cols = 0;
    let rows = 0;
    let now = new Float32Array(0); // heights this step
    let was = new Float32Array(0); // heights last step
    let img: ImageData | null = null;
    let w = 0;
    let h = 0;
    let capH = 0; // built a little taller than the host, so small growth never rebuilds
    let raf = 0;
    let last = 0;
    let calm = 0;
    let onScreen = true;

    /** Build the grid and the canvas for the host's size; a same-width rebuild keeps the water. */
    function size(): void {
      const r = root!.getBoundingClientRect();
      const sameWidth = cols > 0 && Math.round(r.width) === Math.round(w);
      w = r.width;
      h = r.height;
      if (w < 1 || h < 1) return; // hidden (the auth panel below lg): wait for a real size
      if (sameWidth && h <= capH) return;
      const keep = sameWidth ? { now, was, rows } : null;
      if (!sameWidth) cell = Math.max(4, Math.ceil(Math.sqrt((w * h) / CELLS)));
      capH = Math.ceil(h * 1.2);
      cols = Math.ceil(w / cell) + 2;
      rows = Math.ceil(capH / cell) + 2;
      now = new Float32Array(cols * rows);
      was = new Float32Array(cols * rows);
      if (keep) {
        const n = Math.min(keep.rows, rows) * cols;
        now.set(keep.now.subarray(0, n));
        was.set(keep.was.subarray(0, n));
      }
      off.width = cols;
      off.height = rows;
      img = c.createImageData(cols, rows);
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(capH * dpr);
      canvas!.style.height = `${capH}px`;
      v.setTransform(dpr, 0, 0, dpr, 0, 0);
      v.imageSmoothingEnabled = true;
      v.imageSmoothingQuality = "high";
      v.clearRect(0, 0, w, capH);
      if (raf) draw();
    }

    /** Push the surface down in a soft disc (a stone, or a fingertip). */
    function disturb(px: number, py: number, radius: number, depth: number): void {
      if (!cols) return;
      const cx = px / cell + 1;
      const cy = py / cell + 1;
      const r = Math.max(1, radius);
      const x0 = Math.max(1, Math.floor(cx - r));
      const x1 = Math.min(cols - 2, Math.ceil(cx + r));
      const y0 = Math.max(1, Math.floor(cy - r));
      const y1 = Math.min(rows - 2, Math.ceil(cy + r));
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          const d = Math.hypot(x - cx, y - cy) / r;
          if (d < 1) now[y * cols + x] -= depth * (0.5 + 0.5 * Math.cos(d * Math.PI));
        }
      }
      calm = 0;
      if (!raf && onScreen) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    }

    /** One step of the wave equation; the border stays still, so waves reflect. */
    function step(): number {
      let energy = 0;
      for (let y = 1; y < rows - 1; y++) {
        let i = y * cols + 1;
        for (let x = 1; x < cols - 1; x++, i++) {
          const n = ((now[i - 1] + now[i + 1] + now[i - cols] + now[i + cols]) * 0.5 - was[i]) * DAMP;
          was[i] = n;
          const a = n < 0 ? -n : n;
          if (a > energy) energy = a;
        }
      }
      const t = now;
      now = was;
      was = t;
      return energy;
    }

    /** Light the surface from its slopes — light only, transparent where still — upscaled smoothly. */
    function draw(): void {
      if (!img) return;
      const { glint, glintMax, shade, shadeMax } = paletteRef.current;
      const px = img.data;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = y * cols + x;
          const l = x > 0 ? now[i - 1] : now[i];
          const r = x < cols - 1 ? now[i + 1] : now[i];
          const u = y > 0 ? now[i - cols] : now[i];
          const d = y < rows - 1 ? now[i + cols] : now[i];
          // light from the upper left: a face rising towards it catches it
          let lit = ((l - r) * 0.62 + (u - d) * 0.78) * 2.4;
          if (lit > 1) lit = 1;
          else if (lit < -1) lit = -1;
          const o = i * 4;
          if (lit >= 0) {
            // a sharper glint at the very top of the range
            const k = lit * 0.75 + lit * lit * lit * 0.25;
            px[o] = glint[0];
            px[o + 1] = glint[1];
            px[o + 2] = glint[2];
            px[o + 3] = k * glintMax * 255;
          } else {
            const k = -lit * 0.85;
            px[o] = shade[0];
            px[o + 1] = shade[1];
            px[o + 2] = shade[2];
            px[o + 3] = k * shadeMax * 255;
          }
        }
      }
      c.putImageData(img, 0, 0);
      // translucent pixels composite over the last frame, so clear it first
      v.clearRect(0, 0, w, capH);
      v.drawImage(off, -cell, -cell, cols * cell, rows * cell);
    }

    function frame(t: number): void {
      // a fixed 60 steps a second, whatever the display's rate
      let steps = Math.min(3, Math.floor((t - last) / STEP_MS));
      if (steps < 1) steps = 0;
      last += steps * STEP_MS;
      let energy = STILL * 2;
      for (let s = 0; s < steps; s++) energy = step();
      if (steps) draw();
      calm = energy < STILL ? calm + steps : 0;
      if (calm > 45 || !onScreen) {
        // flat again: hand the surface back to its own ground
        now.fill(0);
        was.fill(0);
        v.clearRect(0, 0, w, capH);
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(frame);
    }

    // the wake: a trail along the pointer's path, deeper the faster it goes
    let lx = -1;
    let ly = -1;
    let lt = 0;
    function onMove(e: PointerEvent): void {
      const r = root!.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const t = performance.now();
      if (lx >= 0 && t - lt < 120) {
        const dist = Math.hypot(x - lx, y - ly);
        const speed = dist / Math.max(1, t - lt); // px per ms
        const depth = Math.min(0.55, speed * 0.22);
        if (depth > 0.02) {
          const n = Math.max(1, Math.ceil(dist / (cell * 1.5)));
          for (let k = 1; k <= n; k++) {
            disturb(lx + ((x - lx) * k) / n, ly + ((y - ly) * k) / n, 2.2, depth / Math.sqrt(n));
          }
        }
      }
      lx = x;
      ly = y;
      lt = t;
    }
    function onLeave(): void {
      lx = -1;
    }
    // a stone
    function onDown(e: PointerEvent): void {
      if (e.button !== 0) return;
      const r = root!.getBoundingClientRect();
      disturb(e.clientX - r.left, e.clientY - r.top, 5, 2.4);
    }

    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("pointerdown", onDown);

    const io =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(([entry]) => {
            onScreen = entry.isIntersecting;
          })
        : null;
    io?.observe(root);

    size();
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            const r = root.getBoundingClientRect();
            if (Math.round(r.width) !== Math.round(w) || Math.round(r.height) !== Math.round(h)) size();
          })
        : null;
    ro?.observe(root);

    return () => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("pointerdown", onDown);
      io?.disconnect();
      ro?.disconnect();
      if (raf) cancelAnimationFrame(raf);
      v.clearRect(0, 0, w, capH);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("pointer-events-none absolute inset-x-0 top-0 w-full", className)}
    />
  );
}
