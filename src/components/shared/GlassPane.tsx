"use client";

import { useEffect, useRef, type ComponentProps } from "react";

import { cn } from "@/lib/utils";

/** Degrees the pane tips at its edge — the website's own value (src/ui/o2/tilt.ts). */
const LEAN = 5;

/**
 * A pane of the website's liquid glass (`.glass-pane` in globals.css): milk on
 * a light ground, smoke on a dark one. For surfaces that float over water —
 * the auth panel's plates — not for ordinary cards, which keep `Card`.
 *
 * `lean` adds the website's pointer lean: the pane tips towards the pointer
 * and a soft pool of light follows it across the face, with a brighter line
 * along the rim. Only for a fine pointer with motion allowed; it eases back
 * when the pointer leaves. Pointer events still bubble, so the water under
 * the pane keeps answering the same movement.
 */
export function GlassPane({
  lean = false,
  className,
  children,
  ...rest
}: ComponentProps<"div"> & { lean?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!lean || !el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function move(e: PointerEvent): void {
      const r = el!.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el!.classList.add("is-lean");
      el!.style.setProperty("--ry", `${(x * LEAN * 2).toFixed(2)}deg`);
      el!.style.setProperty("--rx", `${(-y * LEAN * 2).toFixed(2)}deg`);
      el!.style.setProperty("--px", `${Math.round(e.clientX - r.left)}px`);
      el!.style.setProperty("--py", `${Math.round(e.clientY - r.top)}px`);
    }
    function leave(): void {
      el!.classList.remove("is-lean");
      el!.style.setProperty("--rx", "0deg");
      el!.style.setProperty("--ry", "0deg");
    }

    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [lean]);

  return (
    <div ref={ref} className={cn("glass-pane", lean && "glass-lean", className)} {...rest}>
      {children}
    </div>
  );
}
