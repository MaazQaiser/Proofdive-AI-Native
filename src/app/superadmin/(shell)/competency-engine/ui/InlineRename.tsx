"use client";

import { Check, Pencil, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type InlineRenameProps = {
  value: string;
  onSave: (next: string) => void;
  /** Applied to the read-only label text. */
  textClassName?: string;
  className?: string;
  /** Accessible name for the rename control. */
  ariaLabel?: string;
};

/** Title + pencil → prefilled field with confirm (tick) / cancel (cross). */
export function InlineRename({
  value,
  onSave,
  textClassName,
  className,
  ariaLabel = "Rename",
}: InlineRenameProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputId = useId();

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  useEffect(() => {
    if (!editing) return;
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [editing]);

  function commit() {
    const next = draft.trim();
    if (!next) {
      setDraft(value);
      setEditing(false);
      return;
    }
    if (next !== value) onSave(next);
    setEditing(false);
  }

  function cancel() {
    setDraft(value);
    setEditing(false);
  }

  if (editing) {
    return (
      <div
        className={cn("flex min-w-0 flex-1 items-center gap-1.5", className)}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          id={inputId}
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            }
            if (e.key === "Escape") {
              e.preventDefault();
              cancel();
            }
          }}
          className="h-8 min-w-0 flex-1 text-body-sm"
          aria-label={ariaLabel}
        />
        <IconButton
          variant="solid"
          size="default"
          className="size-7 [&_svg]:size-3.5"
          onClick={commit}
          aria-label="Confirm rename"
        >
          <Check />
        </IconButton>
        <IconButton
          variant="ghost"
          size="default"
          className="size-7 text-muted-foreground hover:text-foreground [&_svg]:size-3.5"
          onClick={cancel}
          aria-label="Cancel rename"
        >
          <X />
        </IconButton>
      </div>
    );
  }

  return (
    <span className={cn("inline-flex min-w-0 max-w-full items-center gap-1.5", className)}>
      <span className={cn("min-w-0 truncate", textClassName)}>{value}</span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setDraft(value);
          setEditing(true);
        }}
        className="inline-flex size-3 shrink-0 items-center justify-center text-text-secondary transition hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        aria-label={ariaLabel}
      >
        <Pencil className="size-3" strokeWidth={2} aria-hidden />
      </button>
    </span>
  );
}
