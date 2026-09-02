"use client";

import { useLayoutEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  ClipboardPaste,
  RefreshCcw,
  Sparkles,
  SquarePen,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SelectionChip } from "@/components/ui/selection-chip";
import { Textarea } from "@/components/ui/textarea";
import { jdHtmlRootToMarkdown, jdMarkdownToHtml } from "@/lib/jdMarkdown";
import { cn } from "@/lib/utils";

type GeneratedJdPanelProps = {
  text: string;
  /** The inputs the draft was built from (role, seniority, industry) — shown
   * as provenance so the user can see WHY the draft says what it says. */
  targeting: string[];
  /** 0-based regenerate count; drafts after the first are numbered. */
  variant: number;
  isEditing: boolean;
  onEdit: () => void;
  /** Persist in-place edits and leave edit mode (does not advance the flow). */
  onDoneEdit: (text: string) => void;
  onRegenerate: () => void;
  onAccept: (text: string) => void;
  /** The real-posting escape hatch — always available, always wins. */
  onUseRealPosting: (text: string) => void;
  onDraftChange?: (text: string) => void;
};

const proseClasses =
  "min-h-0 w-full text-left text-body-sm leading-relaxed text-text-primary outline-none " +
  "[&_h2]:mb-3 [&_h2]:text-h5 [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-heading-teal " +
  "[&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-body [&_h3]:font-semibold [&_h3]:text-text-primary " +
  "[&_p]:mb-3 [&_p]:last:mb-0 " +
  "[&_ul]:mb-3 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 " +
  "[&_li]:leading-relaxed " +
  "[&_strong]:font-semibold " +
  "[&_u]:underline";

/**
 * The generated assessment spec — framed as the artifact it actually is
 * (the source of the interview questions and scoring), not "a job
 * description the AI wrote". Header carries AI provenance + the inputs it
 * was built from; the document sits in an inset well; the real-posting
 * path is a first-class action, never a dead end.
 */
export function GeneratedJdPanel({
  text,
  targeting,
  variant,
  isEditing,
  onEdit,
  onDoneEdit,
  onRegenerate,
  onAccept,
  onUseRealPosting,
  onDraftChange,
}: GeneratedJdPanelProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const wasEditingRef = useRef(false);
  const [showPaste, setShowPaste] = useState(false);
  const [pasteText, setPasteText] = useState("");

  // Keep view-mode DOM in sync with the latest draft. Skip while editing so
  // parent re-renders (draft change callbacks) don't wipe the caret.
  useLayoutEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    const nextHtml = jdMarkdownToHtml(text);

    if (isEditing) {
      if (!wasEditingRef.current) {
        el.innerHTML = nextHtml;
        el.focus();
        const selection = window.getSelection();
        if (selection) {
          const range = document.createRange();
          range.selectNodeContents(el);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
      wasEditingRef.current = true;
      return;
    }

    wasEditingRef.current = false;
    if (el.innerHTML !== nextHtml) {
      el.innerHTML = nextHtml;
    }
  }, [text, isEditing]);

  function readMarkdown(): string {
    const el = editorRef.current;
    if (!el) return text;
    return jdHtmlRootToMarkdown(el);
  }

  function handleInput() {
    const el = editorRef.current;
    if (!el) return;
    onDraftChange?.(jdHtmlRootToMarkdown(el));
  }

  function handleEditToggle() {
    if (!isEditing) {
      onEdit();
      return;
    }
    const next = readMarkdown();
    if (!next.trim()) return;
    onDoneEdit(next);
  }

  function handleAccept() {
    const next = isEditing ? readMarkdown() : text;
    if (!next.trim()) return;
    onAccept(next);
  }

  function handleUsePasted() {
    const payload = pasteText.trim();
    if (!payload) return;
    onUseRealPosting(payload);
  }

  const targetingChips = targeting.map((t) => t.trim()).filter(Boolean);

  return (
    <Card className="mt-6 gap-0 py-5">
      <CardContent className="flex flex-col gap-4 px-5">
        {/* Provenance header — what this is, where it came from */}
        <div className="flex min-w-0 items-start gap-3">
          <span
            aria-hidden
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-1000 text-primary"
          >
            <Sparkles className="size-4.5" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-h5 font-medium text-heading-teal">
                Your assessment spec
              </h2>
              <span className="inline-flex shrink-0 items-center rounded-full bg-secondary px-2 py-0.5 text-overline font-medium text-secondary-foreground">
                AI draft{variant > 0 ? ` · v${variant + 1}` : ""}
              </span>
            </div>
            <p className="mt-0.5 text-caption text-text-secondary">
              Your interview questions and scoring come from this. Review it
              like an interviewer would.
            </p>
          </div>
        </div>

        {/* What the draft was built from. Extra top margin (2× the card's
            base gap) so the header reads as its own block and the
            provenance row doesn't crowd the description line. */}
        {targetingChips.length ? (
          <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1.5">
            <span className="text-overline font-medium uppercase tracking-wide text-text-secondary">
              Built from
            </span>
            {targetingChips.map((chip) => (
              <span
                key={chip}
                className="rounded-full bg-brand-1000 px-2.5 py-1 text-overline font-medium text-extended-blue"
              >
                {chip}
              </span>
            ))}
          </div>
        ) : null}

        {/* The document itself — an inset well, editable in place. Its own
            footer carries the document-level actions (edit / regenerate), so
            the header stays a clean statement of what this artifact is and
            the card footer stays the single place you move forward from. */}
        <div
          className={cn(
            "overflow-hidden rounded-xl border bg-background/60 transition-shadow",
            isEditing
              ? "border-ring ring-[3px] ring-ring/20"
              : "border-border/70",
          )}
        >
          <div className="px-5 py-4">
            <div
              ref={editorRef}
              data-slot="jd-editor"
              className={proseClasses}
              contentEditable={isEditing}
              suppressContentEditableWarning
              role={isEditing ? "textbox" : undefined}
              aria-multiline={isEditing ? true : undefined}
              aria-label="Assessment spec draft"
              onInput={isEditing ? handleInput : undefined}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-border/70 bg-brand-1000/25 px-4 py-2.5">
            <div className="flex shrink-0 items-center gap-1.5">
              <SelectionChip
                selected={isEditing}
                onClick={handleEditToggle}
                aria-pressed={isEditing}
              >
                {isEditing ? (
                  <>
                    <Check className="size-4" />
                    Done
                  </>
                ) : (
                  <>
                    <SquarePen className="size-4" />
                    Edit
                  </>
                )}
              </SelectionChip>
              <SelectionChip onClick={onRegenerate} disabled={isEditing}>
                <RefreshCcw className="size-4" />
                Regenerate
              </SelectionChip>
            </div>
            <p
              aria-live="polite"
              className="min-w-0 text-overline text-text-secondary"
            >
              {isEditing
                ? "Editing in place. Done saves your changes."
                : "Anything off? Edit it, or regenerate for a different angle."}
            </p>
          </div>
        </div>

        {/* Actions — draft path and real-posting path, side by side */}
        {showPaste ? (
          <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-background/60 p-4">
            <p className="text-caption text-text-secondary">
              Paste the posting you&apos;re actually targeting. It replaces the
              draft and becomes your assessment spec.
            </p>
            <Textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Paste the job posting here…"
              rows={6}
              autoFocus
              className="bg-card text-body-sm"
            />
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={handleUsePasted}
                disabled={!pasteText.trim()}
                className="h-10 rounded-md pl-5! pr-3! text-body-sm font-medium"
              >
                Use this posting
                <ArrowRight />
              </Button>
              <button
                type="button"
                onClick={() => setShowPaste(false)}
                className="text-caption font-medium text-text-secondary underline-offset-2 hover:text-foreground hover:underline"
              >
                Keep the draft
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={handleAccept}
              className="h-10 rounded-md pl-5! pr-3! text-body-sm font-medium"
            >
              Use this draft
              <ArrowRight />
            </Button>
            <button
              type="button"
              onClick={() => setShowPaste(true)}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-card px-4 text-body-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <ClipboardPaste className="size-4 text-primary" aria-hidden />
              Paste the real posting instead
            </button>
          </div>
        )}
        <p className="text-overline text-text-secondary">
          A real posting always beats a draft. You can swap one in later from
          your profile, too.
        </p>
      </CardContent>
    </Card>
  );
}
