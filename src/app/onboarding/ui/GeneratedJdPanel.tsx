"use client";

import { useLayoutEffect, useRef } from "react";
import { ArrowRight, Building2, Check, Rocket, SquarePen } from "lucide-react";

import { LogoMark } from "@/components/ui/logo";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SelectionChip } from "@/components/ui/selection-chip";
import {
  JD_COMPANY_ANGLES,
  jdCompanyAngleLabel,
  type JdCompanyAngle,
} from "@/lib/jobDescriptionMock";
import { jdHtmlRootToMarkdown, jdMarkdownToHtml } from "@/lib/jdMarkdown";
import { cn } from "@/lib/utils";

type GeneratedJdPanelProps = {
  text: string;
  /** The inputs the draft was built from (role, seniority, industry) — shown
   * as provenance so the user can see WHY the draft says what it says. */
  targeting: string[];
  /** 0-based regenerate count; drafts after the first are numbered. */
  variant: number;
  /** Company context the draft was regenerated for (null = first draft). */
  angle: JdCompanyAngle | null;
  isEditing: boolean;
  onEdit: () => void;
  /** Persist in-place edits and leave edit mode (does not advance the flow). */
  onDoneEdit: (text: string) => void;
  onRegenerate: (angle: JdCompanyAngle) => void;
  onAccept: (text: string) => void;
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
 * The generated Job Description (the client's name for it, matching the
 * screen heading; "assessment spec" read as jargon) — framed as the artifact it actually is
 * (the source of the interview questions and scoring), not "a job
 * description the AI wrote". Header carries AI provenance + the inputs it
 * was built from; the document sits in an inset well; the real-posting
 * path is a first-class action, never a dead end.
 */
export function GeneratedJdPanel({
  text,
  targeting,
  variant,
  angle,
  isEditing,
  onEdit,
  onDoneEdit,
  onRegenerate,
  onAccept,
  onDraftChange,
}: GeneratedJdPanelProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const wasEditingRef = useRef(false);

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

  const targetingChips = [
    ...targeting.map((t) => t.trim()).filter(Boolean),
    // The company context rides with the other inputs, so the user can see
    // which draft they are looking at without opening the menu again.
    ...(angle ? [jdCompanyAngleLabel(angle)] : []),
  ];

  return (
    <>
      <Card className="mt-6 gap-0 py-5">
        <CardContent className="flex flex-col gap-4 px-5">
          {/* Provenance header — what this is, where it came from. Edit sits
              here as the document's one in-place action: the card is the
              document, everything that changes or approves it lives below. */}
          <div className="flex min-w-0 items-start gap-3">
            <span
              aria-hidden
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-1000 text-primary"
            >
              <LogoMark className="size-4.5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-h5 font-medium text-heading-teal">Job Description</h2>
                <Badge>JD Draft{variant > 0 ? ` · v${variant + 1}` : ""}</Badge>
              </div>
              <p aria-live="polite" className="mt-0.5 text-caption text-text-secondary">
                {isEditing
                  ? "Editing in place. Done saves your changes."
                  : "ProofDive drafted this from your target role and industry. Review it before continuing."}
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant={isEditing ? "default" : "secondary"}
              onClick={handleEditToggle}
              aria-pressed={isEditing}
              className="shrink-0"
            >
              {isEditing ? (
                <>
                  <Check />
                  Done
                </>
              ) : (
                <>
                  <SquarePen />
                  Edit
                </>
              )}
            </Button>
          </div>

          {/* What the draft was built from, including the company context it
              was last regenerated for. */}
          {targetingChips.length ? (
            <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1.5">
              <span className="text-overline font-medium uppercase tracking-wide text-text-secondary">
                Built from
              </span>
              {targetingChips.map((chip) => (
                <Badge key={chip}>{chip}</Badge>
              ))}
            </div>
          ) : null}

          {/* The document itself — an inset well, editable in place. */}
          <div
            className={cn(
              "overflow-hidden rounded-xl border bg-background/60 transition-shadow",
              isEditing ? "border-ring ring-[3px] ring-ring/20" : "border-border/70",
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
                aria-label="Job Description draft"
                onInput={isEditing ? handleInput : undefined}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regenerate, as suggestion chips (client, 2026-09-10): the way
          assistants offer "try again for…" — visible, one tap, icon per
          option — in the same label-plus-chips shape every other step in
          this flow uses for its offers. The selected chip is the context the
          current draft describes, so the user always knows which one they
          are looking at. Tapping the selected one redrafts it again. */}
      <div className="flex flex-col gap-2">
        <span className="text-body-sm font-semibold text-text-secondary">
          Regenerate for
        </span>
        <div className="flex flex-wrap gap-2">
          {JD_COMPANY_ANGLES.map((option) => {
            const Icon = option.id === "startup" ? Rocket : Building2;
            return (
              <SelectionChip
                key={option.id}
                selected={option.id === angle}
                disabled={isEditing}
                title={option.description}
                onClick={() => onRegenerate(option.id)}
              >
                <Icon className="size-4" aria-hidden />
                {option.label}
              </SelectionChip>
            );
          })}
        </div>
      </div>

      {/* The step's forward action, outside the card and sized like the plan
          step's Confirm, so every step in the flow moves on from the same
          kind of control in the same place. */}
      <div className="flex flex-wrap items-center gap-4">
        <Button onClick={handleAccept} className="h-11 rounded-md pl-6! pr-4! text-body-sm font-medium">
          Approve and continue
          <ArrowRight />
        </Button>
      </div>
    </>
  );
}
