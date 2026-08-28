"use client";

import { ArrowUp, Check, Pencil } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export type QuestionCardOption = {
  id: string;
  label: string;
};

type QuestionCardProps = {
  /** The question itself — lives in the card header, Claude-widget style. */
  title: string;
  /** Small agent context line above the card (e.g. "UX Designer — noted"). */
  contextLine?: string;
  /** Position within the current step, shown as "2 of 3" in the header. */
  step: { index: number; total: number };
  options: QuestionCardOption[];
  selectedId?: string;
  onPick: (id: string) => void;
  /** Free-text answer from the card's own input row. */
  onCustom: (text: string) => void;
  customPlaceholder?: string;
  /** Renders a Skip control on the input row (optional questions). */
  onSkip?: () => void;
};

/**
 * Contained question card, docked where the chat bar lives — one question,
 * numbered options, and its own input row at the bottom (the card IS the
 * chat section for these turns; the global composer is hidden). Skip sits
 * on the input row, Claude-widget style. Number keys 1–9 select options
 * when focus is outside a text field.
 */
export function QuestionCard({
  title,
  contextLine,
  step,
  options,
  selectedId,
  onPick,
  onCustom,
  customPlaceholder = "Something else…",
  onSkip,
}: QuestionCardProps) {
  const [customText, setCustomText] = useState("");

  function submitCustom() {
    const cleaned = customText.trim();
    if (!cleaned) return;
    setCustomText("");
    onCustom(cleaned);
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      const n = Number(e.key);
      if (!Number.isInteger(n) || n < 1 || n > options.length) return;
      e.preventDefault();
      onPick(options[n - 1]!.id);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [options, onPick]);

  return (
    <div className="w-full">
      {contextLine ? (
        <p className="mb-3 text-caption text-text-secondary">{contextLine}</p>
      ) : null}

      <div
        role="radiogroup"
        aria-label={title}
        className="w-full overflow-hidden rounded-2xl border border-border bg-card shadow-[0_16px_40px_-24px_rgba(4,32,39,0.25)]"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border/70 px-5 py-4">
          <h2 className="min-w-0 text-body font-medium text-heading-teal">
            {title}
          </h2>
          <span className="shrink-0 text-caption tabular-nums text-text-secondary">
            {step.index + 1} of {step.total}
          </span>
        </div>

        {options.map((option, i) => {
          const isSelected = option.id === selectedId;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onPick(option.id)}
              className={cn(
                "group flex w-full items-center gap-3.5 border-b border-border/60 px-5 py-3.5 text-left transition-colors",
                "hover:bg-brand-1000/40 focus-visible:outline-none focus-visible:bg-brand-1000/40 focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/50",
                isSelected && "bg-brand-1000/50",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-md text-caption font-medium transition-colors",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-text-secondary group-hover:bg-brand-900 group-hover:text-extended-blue",
                )}
              >
                {i + 1}
              </span>
              <span
                className={cn(
                  "min-w-0 flex-1 text-body-sm text-foreground",
                  isSelected && "font-medium",
                )}
              >
                {option.label}
              </span>
              {isSelected ? (
                <Check className="size-4 shrink-0 text-primary" aria-hidden />
              ) : null}
            </button>
          );
        })}

        <div className="flex items-center gap-3.5 bg-background/40 px-5 py-2.5">
          <span
            aria-hidden
            className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-text-secondary"
          >
            <Pencil className="size-3.5" />
          </span>
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submitCustom();
              }
            }}
            placeholder={customPlaceholder}
            aria-label={customPlaceholder}
            className="h-10 min-w-0 flex-1 bg-transparent text-body-sm text-foreground outline-none placeholder:text-placeholder"
          />
          {customText.trim() ? (
            <button
              type="button"
              onClick={submitCustom}
              aria-label="Send answer"
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <ArrowUp className="size-4" />
            </button>
          ) : onSkip ? (
            <button
              type="button"
              onClick={onSkip}
              className="shrink-0 rounded-md border border-border bg-white px-3 py-1.5 text-caption font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              Skip
            </button>
          ) : null}
        </div>
      </div>

      <p className="mt-3 text-overline text-text-secondary">
        Tap an option, press its number key, or type your own.
      </p>
    </div>
  );
}
