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
      // viewBoxFont * (width / viewBoxWidth) ≈ targetPx → viewBoxFont = targetPx * viewBoxWidth / width
      // Cap only the upper viewBox size for very narrow cards; never floor at targetPx
      // (that would let rendered labels grow past the card title on wide layouts).
      setFontSize(Math.min(16, (targetPx * viewBoxWidth) / width));
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
