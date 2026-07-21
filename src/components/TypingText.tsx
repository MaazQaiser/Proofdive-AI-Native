"use client";

import { useEffect, useMemo, useRef, useState } from "react";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

/** Splits into reveal units: whole words (each carrying its trailing whitespace,
 * so joining the units reconstructs `text` exactly) for "word" mode, or
 * individual characters for "char" mode. */
function toUnits(text: string, mode: "char" | "word"): string[] {
  if (mode === "char") return Array.from(text);
  return text.match(/\S+\s*/g) ?? [];
}

export type TypingTextProps = {
  text: string;
  startDelayMs?: number;
  baseCharDelayMs?: number;
  baseWordDelayMs?: number;
  /** Reveal one character at a time, or one whole word at a time. */
  mode?: "char" | "word";
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
  baseWordDelayMs = 90,
  mode = "char",
  jitter = 0.2,
  cursor = true,
  reveal = false,
  onDone,
  className,
}: TypingTextProps) {
  const reducedMotion = useMemo(() => prefersReducedMotion(), []);
  const units = useMemo(() => toUnits(text, mode), [text, mode]);

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

    const baseDelay = mode === "word" ? baseWordDelayMs : baseCharDelayMs;

    const tick = () => {
      const i = iRef.current;
      if (i >= units.length) {
        setDone(true);
        if (!doneNotifiedRef.current) {
          doneNotifiedRef.current = true;
          onDone?.();
        }
        return;
      }

      const nextUnit = units[i] ?? "";
      iRef.current = i + 1;
      setShown((prev) => prev + nextUnit);

      const lastChar = nextUnit.trimEnd().slice(-1);
      const punctPause =
        lastChar === "." || lastChar === "!" || lastChar === "?"
          ? 220
          : lastChar === "," || lastChar === ";" || lastChar === ":"
            ? 120
            : 0;

      const rand = 1 + (Math.random() * 2 - 1) * jitter;
      const delay = Math.max(10, Math.round(baseDelay * rand + punctPause));
      timeoutRef.current = window.setTimeout(tick, delay);
    };

    timeoutRef.current = window.setTimeout(tick, startDelayMs);

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [units, startDelayMs, baseCharDelayMs, baseWordDelayMs, mode, isInstant, onDone, jitter]);

  return (
    <span className={className} aria-label={text}>
      {displayText}
      {showCursor ? <span aria-hidden="true">▋</span> : null}
    </span>
  );
}
