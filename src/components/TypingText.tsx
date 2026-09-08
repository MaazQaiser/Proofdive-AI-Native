"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

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

/**
 * Agent voice: text arrives one unit at a time. Each unit is its own span so
 * it can fade in (see `.typing-unit` in globals.css) instead of popping — the
 * pacing stays the same, the arrival is what got softened. Spans are keyed by
 * position and never re-mount, so each one animates exactly once.
 *
 * The caret is a drawn 2px line (`.typing-caret`), not a glyph — the old `▋`
 * rendered as a filled block and read as a selection highlight.
 */
export function TypingText({
  text,
  startDelayMs = 0,
  baseCharDelayMs = 36,
  baseWordDelayMs = 120,
  mode = "char",
  jitter = 0.12,
  cursor = true,
  reveal = false,
  onDone,
  className,
}: TypingTextProps) {
  const reducedMotion = useMemo(() => prefersReducedMotion(), []);
  const units = useMemo(() => toUnits(text, mode), [text, mode]);

  const [shownCount, setShownCount] = useState(0);
  const [done, setDone] = useState(false);
  const iRef = useRef(0);
  const timeoutRef = useRef<number | null>(null);
  const doneNotifiedRef = useRef(false);

  const isInstant = reveal || reducedMotion || !text;
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
      setShownCount(i + 1);

      const lastChar = nextUnit.trimEnd().slice(-1);
      // Breath at clause/sentence boundaries so the agent feels human, not robotic.
      const punctPause =
        lastChar === "." || lastChar === "!" || lastChar === "?"
          ? 300
          : lastChar === "," || lastChar === ";" || lastChar === ":"
            ? 140
            : lastChar === "…" || lastChar === "—"
              ? 200
              : 0;

      const rand = 1 + (Math.random() * 2 - 1) * jitter;
      const delay = Math.max(16, Math.round(baseDelay * rand + punctPause));
      timeoutRef.current = window.setTimeout(tick, delay);
    };

    timeoutRef.current = window.setTimeout(tick, startDelayMs);

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [units, startDelayMs, baseCharDelayMs, baseWordDelayMs, mode, isInstant, onDone, jitter]);

  if (isInstant) {
    return (
      <span className={className} aria-label={text}>
        {text}
      </span>
    );
  }

  return (
    <span className={className} aria-label={text}>
      {units.slice(0, shownCount).map((unit, i) => (
        <span
          key={i}
          className={cn("typing-unit", mode === "word" && "typing-unit-word")}
        >
          {unit}
        </span>
      ))}
      {showCursor ? <span aria-hidden="true" className="typing-caret" /> : null}
    </span>
  );
}
