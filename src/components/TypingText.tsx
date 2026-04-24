"use client";

import { useEffect, useMemo, useRef, useState } from "react";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

export type TypingTextProps = {
  text: string;
  startDelayMs?: number;
  baseCharDelayMs?: number;
  jitter?: number; // 0.2 = ±20%
  cursor?: boolean;
  reveal?: boolean;
  onDone?: () => void;
  className?: string;
};

export function TypingText({
  text,
  startDelayMs = 0,
  baseCharDelayMs = 28,
  jitter = 0.2,
  cursor = true,
  reveal = false,
  onDone,
  className,
}: TypingTextProps) {
  const reducedMotion = useMemo(() => prefersReducedMotion(), []);

  const [shown, setShown] = useState("");
  const [done, setDone] = useState(false);
  const iRef = useRef(0);
  const timeoutRef = useRef<number | null>(null);
  const doneNotifiedRef = useRef(false);

  const isInstant = reveal || reducedMotion || !text;
  const displayText = isInstant ? text : shown;
  const showCursor = cursor && !isInstant && !done;

  // Notify completion without relying on effect-driven state resets.
  useEffect(() => {
    if (isInstant && !doneNotifiedRef.current) {
      doneNotifiedRef.current = true;
      onDone?.();
    }
  }, [isInstant, onDone]);

  useEffect(() => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    if (isInstant) {
      return;
    }

    const tick = () => {
      const i = iRef.current;
      if (i >= text.length) {
        setDone(true);
        if (!doneNotifiedRef.current) {
          doneNotifiedRef.current = true;
          onDone?.();
        }
        return;
      }

      const nextChar = text[i] ?? "";
      iRef.current = i + 1;
      setShown(text.slice(0, i + 1));

      const punctPause =
        nextChar === "." || nextChar === "!" || nextChar === "?"
          ? 220
          : nextChar === "," || nextChar === ";" || nextChar === ":"
            ? 120
            : 0;

      const rand = 1 + (Math.random() * 2 - 1) * jitter;
      const delay = Math.max(10, Math.round(baseCharDelayMs * rand + punctPause));
      timeoutRef.current = window.setTimeout(tick, delay);
    };

    timeoutRef.current = window.setTimeout(tick, startDelayMs);

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [text, startDelayMs, baseCharDelayMs, jitter, isInstant, onDone]);

  return (
    <span className={className} aria-label={text}>
      {displayText}
      {showCursor ? <span aria-hidden="true">▋</span> : null}
    </span>
  );
}

