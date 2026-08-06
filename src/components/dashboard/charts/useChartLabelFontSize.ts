"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Keeps SVG axis labels ~`targetPx` CSS pixels tall as the chart scales with its container.
 * SVG `fontSize` is in viewBox units, so we compensate for the rendered width.
 */
export function useChartLabelFontSize(
  containerRef: RefObject<HTMLElement | null>,
  viewBoxWidth: number,
  targetPx = 11,
) {
  const [fontSize, setFontSize] = useState(targetPx);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = (width: number) => {
      if (width <= 0) return;
      // Clamp so labels stay readable in 2-col cards without blowing up on ultra-wide.
      setFontSize(Math.min(18, Math.max(targetPx, (targetPx * viewBoxWidth) / width)));
    };

    update(el.getBoundingClientRect().width);

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      update(width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [containerRef, viewBoxWidth, targetPx]);

  return fontSize;
}
