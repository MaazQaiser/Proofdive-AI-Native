"use client";

import { useLayoutEffect, useRef } from "react";
import { ArrowRight, Check, Pencil } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { IconButton } from "@/components/ui/icon-button";
import { SelectionChip } from "@/components/ui/selection-chip";
import { jdHtmlRootToMarkdown, jdMarkdownToHtml } from "@/lib/jdMarkdown";

type GeneratedJdPanelProps = {
  text: string;
  isEditing: boolean;
  onEdit: () => void;
  /** Persist in-place edits and leave edit mode (does not advance the flow). */
  onDoneEdit: (text: string) => void;
  onRegenerate: () => void;
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

export function GeneratedJdPanel({
  text,
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

  function handleHeaderAction() {
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

  return (
    <Card className="mt-6 gap-0 py-5">
      <CardContent className="flex flex-col gap-4 px-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <h2 className="truncate text-h4 text-heading-teal">
              Generated Job Description
            </h2>
            <span className="inline-flex shrink-0 items-center rounded-full bg-extended-light-cyan px-2.5 py-0.5 text-body-sm font-medium text-[#095B73]">
              Draft
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <SelectionChip
              selected={isEditing}
              onClick={handleHeaderAction}
              aria-pressed={isEditing}
            >
              {isEditing ? (
                <>
                  <Check className="size-4" />
                  Done
                </>
              ) : (
                <>
                  <Pencil className="size-4" />
                  Edit
                </>
              )}
            </SelectionChip>
            <IconButton
              variant="ghost"
              size="md"
              onClick={onRegenerate}
              aria-label="Regenerate job description"
              className="text-primary"
            >
              <span
                aria-hidden
                className="size-4 bg-primary"
                style={{
                  maskImage: "url(/brand/refresh-ccw.png)",
                  maskSize: "contain",
                  maskRepeat: "no-repeat",
                  maskPosition: "center",
                  WebkitMaskImage: "url(/brand/refresh-ccw.png)",
                  WebkitMaskSize: "contain",
                  WebkitMaskRepeat: "no-repeat",
                  WebkitMaskPosition: "center",
                }}
              />
            </IconButton>
          </div>
        </div>

        <div
          ref={editorRef}
          data-slot="jd-editor"
          className={proseClasses}
          contentEditable={isEditing}
          suppressContentEditableWarning
          role={isEditing ? "textbox" : undefined}
          aria-multiline={isEditing ? true : undefined}
          aria-label="Job description draft"
          onInput={isEditing ? handleInput : undefined}
        />

        <div className="flex flex-wrap gap-2">
          <SelectionChip selected onClick={handleAccept}>
            Use this draft
            <ArrowRight className="size-4" />
          </SelectionChip>
        </div>
      </CardContent>
    </Card>
  );
}
